import { Router, Request, Response, } from "express";
import User from "../../model/UserModel";
import History from "../../model/HistoryModel";
import Game from "../../model/GameModel";
import { RBYAmount, fee, rpcURL, solanaNet, tokenMint, treasuryPrivKey } from "../../config/config";

import { Connection, PublicKey, Keypair, Transaction, clusterApiUrl, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from 'bs58';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

// Create a new instance of the Express Router of handle wallet
const WalletRouter = Router();

const connection = new Connection(rpcURL);

const checkTx = async (address: string, signature: string) => {
    const decoded = await connection.getParsedTransaction(signature, 'confirmed')
    const treasuryKeypair = Keypair.fromSecretKey(
        bs58.decode(treasuryPrivKey)
    )
    console.log('decoded->\n', signature, decoded)
    const treasuryPubKey = treasuryKeypair.publicKey.toString()
    const treasuryTkAccount = await getTokenAccount()
    const userPubKey = address
    const userTkAccount = await getAssociatedTokenAddress(new PublicKey(tokenMint), new PublicKey(address))

    const mintInfo = await connection.getParsedAccountInfo(new PublicKey(tokenMint))
    // @ts-ignore
    const numberDecimals: number = mintInfo.value?.data.parsed?.info.decimals;
    const tkAmount = RBYAmount * Math.pow(10, numberDecimals)
    const solAmount = fee * LAMPORTS_PER_SOL
    const tkTransfer = `{"parsed":{"info":{"amount":"${tkAmount}","authority":"${userPubKey}","destination":"${treasuryTkAccount}","source":"${userTkAccount}"},"type":"transfer"},"program":"spl-token","programId":"${TOKEN_PROGRAM_ID.toString()}","stackHeight":null}`
    const solTransfer = `{"parsed":{"info":{"destination":"${treasuryPubKey}","lamports":${solAmount},"source":"${userPubKey}"},"type":"transfer"},"program":"system","programId":"${SystemProgram.programId.toString()}","stackHeight":null}`

    const result = (JSON.stringify(decoded?.transaction.message.instructions[2]) == tkTransfer) && (JSON.stringify(decoded?.transaction.message.instructions[3]) == solTransfer)
    return result
}

export const sendSolToUser = async (userWallet: string, amount: number) => {
    try {
        const treasuryKeypair = Keypair.fromSecretKey(
            bs58.decode(treasuryPrivKey)
        )

        // Add transfer instruction to transaction
        const userWalletPK = new PublicKey(userWallet);
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: treasuryKeypair.publicKey,
                toPubkey: userWalletPK,
                lamports: Math.floor((amount - fee) * LAMPORTS_PER_SOL),
            })
        );
        const recentBlockhash = await connection.getLatestBlockhash()
        transaction.recentBlockhash = recentBlockhash.blockhash;
        transaction.feePayer = treasuryKeypair.publicKey

        // Sign transaction, broadcast, and confirm
        const simulator = await connection.simulateTransaction(transaction)
        console.log('simulator => ', simulator)
        const txid = await connection.sendTransaction(transaction, [treasuryKeypair])
        await connection.confirmTransaction(txid, "confirmed")

        return txid
    } catch (e) {
        if (e instanceof Error) {
            console.warn(e)
            throw Error(e.message)
        }
        console.warn(e)
        throw (e)
    }
}

export const checkTreasuryBalance = async (amount: number) => {
    const treasuryKeypair = Keypair.fromSecretKey(
        bs58.decode(treasuryPrivKey)
    )
    const balance = await connection.getBalance(treasuryKeypair.publicKey)
    return (balance > amount * LAMPORTS_PER_SOL)
}

const getTokenAccount = async () => {
    const treasuryKeypair = Keypair.fromSecretKey(
        bs58.decode(treasuryPrivKey)
    )
    const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        treasuryKeypair,
        new PublicKey(tokenMint),
        treasuryKeypair.publicKey
    );

    return treasuryTokenAccount.address.toString()
}
WalletRouter.get('/test', async (req: Request, res: Response) => {
    try {
        res.json('Wallet router is working now')
    } catch (e) {
        console.warn(e)
        return res.status(500).json({ error: `Internal Error -> ${e}` })
    }
})

// @route    POST api/wallet/deposit
// @desc     User deposit token to play game
// @access   Public -> Private (need research for security, to expand multi deposit)
// @params   address, amount, tx
WalletRouter.post('/deposit', async (req: Request, res: Response) => {
    try {
        if (!req.body.tx) {
            console.warn(`${req.body.address} is using empty tx`)
            await User.findOneAndUpdate({ address: req.body.address }, { risk: 'Use empty transaction' }, { upsert: true })
            return res.status(400).json({ error: 'You are using empty tx signature' })
        }
        const txInfo = await History.findOne({ tx: req.body.tx })
        if (txInfo) {
            console.warn(`${req.body.address} is using last tx`)
            await User.findOneAndUpdate({ address: req.body.address }, { risk: 'Use old transaction' }, { upsert: true })
            return res.status(400).json({ error: 'You are using old tx signature' })
        }
        if (!(await checkTx(req.body.address, req.body.tx))) {
            console.warn(`${req.body.address} is using invalid tx`)
            await User.findOneAndUpdate({ address: req.body.address }, { risk: 'Use invalid transaction' }, { upsert: true })
            return res.status(400).json({ error: 'You are using invalid tx signature' })
        }
        const userInfo = await User.findOne({ address: req.body.address })
        if (userInfo) {
            // User have already deposit
            if (userInfo.deposit) {
                console.warn(`${req.body.address} has already deposit`)
                return res.status(400).json({ error: 'You have already deposit' })
            }

            // User is playing game
            if (userInfo.playing) {
                console.warn(`${req.body.address} is playing now`)
                return res.status(400).json({ error: 'You have are playing game now' })
            }

            await User.findOneAndUpdate({ address: req.body.address }, { deposit: true })
            const tx = new History({
                address: req.body.address,
                action: 'deposit',
                amount: req.body.amount,
                tx: req.body.tx
            })
            await tx.save()
            console.log(`${req.body.address} deposit`)
            return res.json({
                message: "Successfully deposited", data: {
                    amount: RBYAmount
                }
            })
        } else {
            // User not exist
            console.log(`${req.body.address} not exist in our db`)
            return res.status(404).json({ error: "You are not registered to our platform" })
        }
    } catch (e) {
        console.warn(e)
        return res.status(500).json({ error: `Internal Error -> ${e}` })
    }
})

// @route    POST api/wallet/fetch
// @desc     User fetch all data
// @access   Public -> Private (need research for security, to expand multi deposit)
// @params   address, amount, tx
WalletRouter.post('/fetch', async (req: Request, res: Response) => {
    try {
        const userInfo = await User.findOne({ address: req.body.address })
        if (userInfo) {
            await User.findOneAndUpdate({ address: req.body.address }, { process: false })
            console.log(`${req.body.address} fetch data`)
            return res.json({
                message: "User data", data: {
                    deposit: userInfo.deposit,
                    playing: userInfo.playing,
                    claimable: userInfo.claimableAmount,
                    totalDeposit: userInfo.totalDeposited,
                    totalClaim: userInfo.totalClaimed,
                    process: false
                }
            })
        } else {
            // New user
            const newUser = new User({
                address: req.body.address
            })
            await newUser.save()
            const tx = new History({
                address: req.body.address,
                action: 'register',
                amount: 0,
            })
            await tx.save()
            console.log(`${req.body.address} is registered`)
            return res.json({
                message: "New User", data: {
                    deposit: false,
                    playing: false,
                    claimable: 0,
                    totalDeposit: 0,
                    totalClaim: 0,
                    process: false
                }
            })
        }
    } catch (e) {
        console.warn(e)
        return res.status(500).json({ error: `Internal Error -> ${e}` })
    }
})

// @route    POST api/wallet/claim
// @desc     User claim token of reward
// @access   Public
WalletRouter.post('/claim', async (req: Request, res: Response) => {
    try {
        if (!req.body.address) {
            console.warn(`Empty address`)
            return res.status(400).json({ error: 'Empty address' })
        }
        const userInfo = await User.findOne({ address: req.body.address })
        const gameInfo = await Game.findOne({})
        if (userInfo) {
            if (userInfo.totalDeposited == 0) {
                console.warn(`${req.body.address} has never deposit`)
                return res.status(400).json({ error: 'You have never deposit' })
            }

            if (!userInfo.playing) {
                console.warn(`${req.body.address} has not played yet`)
                return res.status(400).json({ error: 'You did not played yet' })
            }


            if (userInfo.process) {
                console.warn(`${req.body.address} is not finish game yet`)
                return res.status(400).json({ error: 'Your game is not finished yet' })
            }

            if (!(await checkTreasuryBalance(userInfo.claimableAmount))) {
                console.warn(`${req.body.address} treasury has low balance`)
                return res.status(400).json({ error: 'Treasury has low balance' })

            }

            let signature: string = ''
            if (userInfo.claimableAmount) {
                // Create tx to send sol to user
                signature = await sendSolToUser(req.body.address, userInfo.claimableAmount)
            }

            let totalClaimed: number = 0
            totalClaimed += userInfo.totalClaimed + userInfo.claimableAmount
            await User.findOneAndUpdate({ address: req.body.address }, { totalClaimed: userInfo.totalClaimed + userInfo.claimableAmount, playing: false, claimableAmount: 0 })
            await Game.findOneAndUpdate({}, {
                totalPlaying: (gameInfo!.totalPlaying) + 1,
                totalClaimable: gameInfo!.totalClaimable - userInfo.claimableAmount,
                totalClaimed: gameInfo!.totalClaimed + userInfo.claimableAmount
            })

            const tx = new History({
                address: req.body.address,
                action: 'claim',
                amount: userInfo.claimableAmount,
                tx: signature
            })
            await tx.save()
            console.log(`${req.body.address} claimed`)
            return res.json({
                message: "Successfully claimed", data: {
                    signature: signature
                }
            })
        } else {
            // User not exist
            console.log(`${req.body.address} not exist in our db`)
            return res.status(404).json({ error: "You are not registered to our platform" })
        }
    } catch (e) {
        console.warn(e)
        return res.status(500).json({ error: `Internal Error -> ${e}` })
    }
})

WalletRouter.get('/tokenaccount', async (req: Request, res: Response) => {
    try {
        res.json(await getTokenAccount())
    } catch (e) {
        console.log(e)
    }
})
// @route    POST api/wallet/withdraw
// @desc     User withdraw token already deposited
// @access   Public
// WalletRouter.post('/withdraw', async (req: Request, res: Response) => {
//     try {
//         const userInfo = await User.findOne({ address: req.body.address })
//         if (userInfo) {
//             if (userInfo.depositAmount == 0) {
//                 console.warn(`${req.body.address} has not deposit yet`)
//                 return res.status(400).json({ error: 'You did not deposit yet' })
//             }

//             // Calculate amount reduced by fee

//             // Create tx to send sol to user
//             // ...
//             await User.findOneAndUpdate({ address: req.body.address }, { depositAmount: 0 })
//             const tx = new History({
//                 address: req.body.address,
//                 action: 'withdraw',
//                 amount: userInfo.depositAmount, // calc reduced 
//                 tx: req.body.tx
//             })
//             await tx.save()
//             return res.json({ message: "Successfully withdrew" })
//         } else {
//             // User not exist
//             console.log(`${req.body.address} not exist in our db`)
//             return res.status(404).json({ error: "You are not registered to our platform" })
//         }
//     } catch (e) {
//         console.warn(e)
//         return res.status(500).json({ error: `Internal Error -> ${e}` })
//     }
// })

export default WalletRouter;
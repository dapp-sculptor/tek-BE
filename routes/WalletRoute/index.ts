import { Router, Request, Response, } from "express";
import User from "../../model/UserModel";
import History from "../../model/HistoryModel";
import Game from "../../model/GameModel";
import { RBYAmount, solanaNet, treasuryPrivKey } from "../../config/config";

import { Connection, PublicKey, Keypair, Transaction, clusterApiUrl, LAMPORTS_PER_SOL, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js";
import bs58 from 'bs58';

// Create a new instance of the Express Router of handle wallet
const WalletRouter = Router();

// Consider fee


export const sendSolToUser = async (userWallet: string, amount: number) => {
    try {
        const treasuryKeypair = Keypair.fromSecretKey(
            bs58.decode(treasuryPrivKey)
        )

        // Connect to cluster
        // const connection = new Connection(clusterApiUrl('devnet'));
        // const connection = new Connection("https://devnet.helius-rpc.com/?api-key=a632ca12-a781-4a5a-ab8a-d4314facfec7")
        
        const connection = new Connection('https://api.devnet.solana.com');

        // Add transfer instruction to transaction
        const userWalletPK = new PublicKey(userWallet);
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: treasuryKeypair.publicKey,
                toPubkey: userWalletPK,
                lamports: amount * LAMPORTS_PER_SOL,
            })
        );
        console.log("1")
        const recentBlockhash = await connection.getLatestBlockhash()
        console.log('recentBlockhash',recentBlockhash)
        transaction.recentBlockhash = recentBlockhash.blockhash;
        console.log("2")    
        transaction.feePayer = treasuryKeypair.publicKey
        console.log("3")

        // Sign transaction, broadcast, and confirm
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [treasuryKeypair]
        );
        console.log(userWallet, signature);
        return signature
    } catch (e) {
        console.warn(e)
        return ''
    }
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
        const txInfo = await History.findOne({ tx: req.body.tx })
        if (txInfo) {
            console.warn(`${req.body.address} is using last tx`)
            await User.findOneAndUpdate({ address: req.body.address }, { risk: 'Usd old transaction' }, { upsert: true })
            return res.status(400).json({ error: 'You are using old tx signature' })
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
            if (Number(req.body.amount) >= RBYAmount) await User.findOneAndUpdate({ address: req.body.address }, { deposit: true })
            else {
                console.warn(`${req.body.address} should more deposit`)
                return res.status(400).json({ error: 'You should more deposit' })
            }
            const tx = new History({
                address: req.body.address,
                action: 'deposit',
                amount: req.body.amount,
                tx: req.body.tx
            })
            await tx.save()
            return res.json({
                message: "Successfully deposited", data: {
                    amount: RBYAmount
                }
            })
        } else {
            // User new deposit
            const newUser = new User({
                address: req.body.address,
                depositAmount: req.body.amount,
            })
            await newUser.save()
            const tx = new History({
                address: req.body.address,
                action: 'deposit',
                amount: req.body.amount,
                tx: req.body.tx
            })
            await tx.save()
            return res.json({
                message: "Successfully registered and deposited", data: {
                    amount: req.body.amount
                }
            })
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
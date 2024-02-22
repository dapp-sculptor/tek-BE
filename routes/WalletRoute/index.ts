import { Router, Request, Response, } from "express";
import User from "../../model/UserModel";
import History from "../../model/HistoryModel";
import Game from "../../model/GameModel";

// Create a new instance of the Express Router of handle wallet
const WalletRouter = Router();

// Consider fee

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
            // if (userInfo.depositAmount != 0) {
            //     console.warn(`${req.body.address} has already deposit`)
            //     return res.status(400).json({ error: 'You have already deposit' })
            // }

            if (userInfo.playingAmount != 0) {
                console.warn(`${req.body.address} is playing now`)
                return res.status(400).json({ error: 'You have are playing game now' })
            }

            // Total deposit should be updated after play
            // let totalDeposited: number = 0
            // totalDeposited = userInfo.totalDeposited + Number(req.body.amount)
            await User.findOneAndUpdate({ address: req.body.address }, { depositAmount: Number(req.body.amount) + userInfo.depositAmount})
            const tx = new History({
                address: req.body.address,
                action: 'deposit',
                amount: req.body.amount,
                tx: req.body.tx
            })
            await tx.save()
            return res.json({
                message: "Successfully deposited", data: {
                    amount: req.body.amount
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
                action: 'new deposit',
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

// @route    POST api/wallet/claim
// @desc     User claim token of reward
// @access   Public
WalletRouter.post('/claim', async (req: Request, res: Response) => {
    try {
        const userInfo = await User.findOne({ address: req.body.address })
        const gameInfo = await Game.findOne({})
        if (userInfo) {
            // if (userInfo.depositAmount > 0) {
            //     console.warn(`${req.body.address} has not start play yet`)
            //     return res.status(400).json({ error: 'You did not start play yet' })
            // }

            if (userInfo.totalDeposited == 0) {
                console.warn(`${req.body.address} has not deposit yet`)
                return res.status(400).json({ error: 'You did not deposit yet' })
            }

            if (userInfo.playingAmount == 0) {
                console.warn(`${req.body.address} has not played yet`)
                return res.status(400).json({ error: 'You did not played yet' })
            }

            if (userInfo.claimableAmount == 0) {
                console.warn(`${req.body.address} has no claimable amount`)
                return res.status(400).json({ error: 'You have no claimable amount' })
            }

            if (userInfo.process) {
                console.warn(`${req.body.address} is not finish game yet`)
                return res.status(400).json({ error: 'Your game is not finished yet' })
            }
            // Create tx to send sol to user
            // ...
            let totalClaimed: number = 0
            totalClaimed += userInfo.totalClaimed + userInfo.claimableAmount
            await User.findOneAndUpdate({ address: req.body.address }, { totalClaimed, playingAmount: 0, claimableAmount: 0 })
            await Game.findOneAndUpdate({}, {
                totalPlaying: gameInfo!.totalPlaying - userInfo.playingAmount,
                totalClaimable: gameInfo!.totalClaimable - userInfo.claimableAmount,
                totalClaimed: gameInfo!.totalClaimed + userInfo.claimableAmount
            })
            const tx = new History({
                address: req.body.address,
                action: 'claim',
                amount: userInfo.claimableAmount,
                tx: req.body.tx
            })
            await tx.save()
            return res.json({ message: "Successfully claimed" })
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
WalletRouter.post('/withdraw', async (req: Request, res: Response) => {
    try {
        const userInfo = await User.findOne({ address: req.body.address })
        if (userInfo) {
            if (userInfo.depositAmount == 0) {
                console.warn(`${req.body.address} has not deposit yet`)
                return res.status(400).json({ error: 'You did not deposit yet' })
            }

            // Calculate amount reduced by fee

            // Create tx to send sol to user
            // ...
            await User.findOneAndUpdate({ address: req.body.address }, { depositAmount: 0 })
            const tx = new History({
                address: req.body.address,
                action: 'withdraw',
                amount: userInfo.depositAmount, // calc reduced 
                tx: req.body.tx
            })
            await tx.save()
            return res.json({ message: "Successfully withdrew" })
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

export default WalletRouter;
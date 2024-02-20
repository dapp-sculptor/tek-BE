import { Router, Request, Response, } from "express";
import User from "../../model/UserModel";
import History from "../../model/HistoryModel";

// Create a new instance of the Express Router of handle wallet
const PlayRouter = Router();

// Consider fee

// @route    POST api/wallet/start
// @desc     User play the spin wheel
// @access   Public -> Private (need research for security, to expand multi deposit)
PlayRouter.post('/play', async (req: Request, res: Response) => {
    try {
        const userInfo = await User.findOne({ address: req.body.address })
        if (userInfo) {
            // Add data to json
            if (userInfo.playingAmount != 0 || userInfo.process) {
                console.warn(`${req.body.address} is playing now`)
                return res.status(400).json({ error: 'You are playing now' })
            }
            if (userInfo.depositAmount == 0) {
                console.warn(`${req.body.address} has not deposit yet`)
                return res.status(400).json({ error: 'You did not deposit yet' })
            }

            // Generate random number
            const prize = req.body.prize
            // ...
            const game_result = 5
            // Calc claimable amount
            const reward = 500
            const total: number = userInfo.totalDeposited + userInfo.depositAmount
            await User.findOneAndUpdate({ address: req.body.address }, { depositAmount: 0, playingAmount: userInfo.depositAmount, claimableAmount: reward, totalDeposited: total, process: true })

            const tx = new History({
                address: req.body.address,
                amount: userInfo.depositAmount,
                action: 'play'
            })
            await tx.save()
            return res.json({ message: "Spinning started" })
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

// @route    POST api/wallet/start
// @desc     User play the spin wheel
// @access   Public -> Private (need research for security, to expand multi deposit)
PlayRouter.post('/finish', async (req: Request, res: Response) => {
    try {
        const userInfo = await User.findOne({ address: req.body.address })
        if (userInfo) {
            if (!userInfo.process) {
                console.log(`${req.body.address} is not running game`)
                return res.status(404).json({ error: "You are not running game" })
            } else {
                await User.findOneAndUpdate({ address: req.body.address }, { process: false })
                const tx = new History({
                    address: req.body.address,
                    action: 'finish'
                })
                return res.json({ message: "Game is finished" })
            }
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


export default PlayRouter;
import { Router, Request, Response, } from "express";
import User from "../../model/UserModel";
import History from "../../model/HistoryModel";
import Game from "../../model/GameModel";
import { total_angle } from "../../config/config";

// Create a new instance of the Express Router of handle wallet
const PlayRouter = Router();

type Item = {
    name: string;
    img: string;
    percentpage: number;
};


const rate_arr = [0, 0.35, 0.55, 0.75, 0.9, 1]
const angle_arr = [-1, 2, 6, 4, 0]
const zero_arr = [1, 3, 5, 7]

// Generate angle
const genAngle = (index: number) => {
    let num: number
    if (!index) {
        num = zero_arr[Date.now() % 4]
    } else {
        num = angle_arr[index]
    }
    const rand = Math.ceil(45 * (num + Math.random()))
    const angle = total_angle - 22.5 + rand
    return angle
}

// Generate random number
const genResult = (prize: Item[]) => {
    const sortedArray = [...prize].sort((a, b) => a.percentpage - b.percentpage);
    const resultArray = sortedArray.map(item => item.percentpage).filter((value, index, self) => self.indexOf(value) === index)
    const origin = Math.random()
    for (let index = 0; index < rate_arr.length - 1; index++) {
        if (origin > rate_arr[index] && origin <= rate_arr[index + 1]) {
            const reward = resultArray[index]
            const angle = genAngle(index)
            return {
                reward, angle
            }
        }
    }
    const reward = resultArray[4]
    const angle = genAngle(4)
    return {
        reward, angle
    }
}

PlayRouter.get('/test', async (req: Request, res: Response) => {
    try {
        res.json('Play router is working now')
    } catch (e) {
        console.warn(e)
        return res.status(500).json({ error: `Internal Error -> ${e}` })
    }
})

// @route    POST api/wallet/start
// @desc     User play the spin wheel
// @access   Public -> Private (need research for security, to expand multi deposit)
PlayRouter.post('/play', async (req: Request, res: Response) => {
    try {
        const userInfo = await User.findOne({ address: req.body.address })
        const gameInfo = await Game.findOne({})
        if (userInfo) {
            if (userInfo.playing && userInfo.process) {
                console.warn(`${req.body.address} is not claimed yet`)
                return res.status(400).json({ error: 'You are not claimed yet' })
            }
            const prize = req.body.prize
            const { reward, angle } = genResult(prize)!
            await User.findOneAndUpdate({ address: req.body.address }, {
                deposit: false,
                playing: true,
                claimableAmount: reward,
                totalDeposited: userInfo.totalDeposited + 1,
                process: true
            })
            await Game.findOneAndUpdate({}, {
                totalPlaying: Number(gameInfo!.totalPlaying) + 1,
                totalClaimable: Number(gameInfo!.totalClaimable) + reward,
            }, { upsert: true })

            const tx = new History({
                address: req.body.address,
                action: 'play'
            })
            await tx.save()
            console.log(`${req.body.address} started play`)
            return res.json({
                message: "Spinning started", data: {
                    angle: angle,
                    reward: reward
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

// @route    POST api/wallet/start
// @desc     User play the spin wheel
// @access   Public -> Private (need research for security, to expand multi deposit)
PlayRouter.post('/finish', async (req: Request, res: Response) => {
    try {
        const userInfo = await User.findOne({ address: req.body.address })
        if (userInfo) {
            if (!userInfo.playing) {
                console.log(`${req.body.address} has not started running game`)
                return res.status(404).json({ error: "You have not started running game" })
            } else if (!userInfo.process) {
                console.log(`${req.body.address} is already finished`)
                return res.status(404).json({ error: "You are already finished" })
            } else {
                await User.findOneAndUpdate({ address: req.body.address }, { process: false })
                const tx = new History({
                    address: req.body.address,
                    action: 'finish'
                })
                console.log(`${req.body.address} finished`)
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
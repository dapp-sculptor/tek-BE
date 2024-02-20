import { Router } from "express";
import User from "../../model/UserModel";

// Create a new instance of the Express Router of handle wallet
const WalletRouter = Router();

// @route    POST api/wallet/deposit
// @desc     User deposit token to play game
// @access   Public
WalletRouter.post('/deposit', async (req, res) => {
    try {
        const userInfo = await User.findOne({ address: req.body.address })
        if (userInfo) {
            // User have already deposit
            if (userInfo.depositAmount !== 0) {
                console.warn('You have already deposit')
                return res.status(400).json({ error: 'You have already deposit' })
            }
            const totalDeposited = userInfo.totalDeposited + req.body.amount
            await User.findOneAndUpdate({ address: req.body.address }, { depositAmount: req.body.amount, totalDeposited })
            return res.json({ message: "Successfully deposited" })
        } else {
            // User new deposit
            const newUser = new User({
                address: req.body.address,
                depositAmount: req.body.amount
            })
            await newUser.save()
            return res.json({ message: "Successfully registered and deposited" })
        }
    } catch (e) {
        console.warn(e)
        return res.status(500).json({ error: `Internal Error -> ${e}` })
    }
})

export default WalletRouter;
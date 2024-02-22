"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserModel_1 = __importDefault(require("../../model/UserModel"));
const HistoryModel_1 = __importDefault(require("../../model/HistoryModel"));
const GameModel_1 = __importDefault(require("../../model/GameModel"));
// Create a new instance of the Express Router of handle wallet
const PlayRouter = (0, express_1.Router)();
const num_list = [128, 64, 32, 16, 8, 4, 2, 1];
const order_list = [3, 5, 7, 1, 0, 2, 6, 4];
const prize_list = [1, 0.5, 2, 0, 10, 0.1, 5, 0.25];
// Generate angle
const genAngle = (num) => {
    const count = order_list[num];
    const prize_result = prize_list[count];
    return 12960 - 22.5 + Math.ceil(45 * (count + Math.random()));
};
// Generate random number
const genResult = ({ U, P, C, prize }) => {
    const origin = Math.random();
    let rate = Math.pow(origin, 2) * 256;
    //  * (-U / P + 1.5)
    if (C > P)
        rate *= P / C;
    for (let i = 0; i < num_list.length; i++) {
        rate -= num_list[i];
        if (rate <= 0) {
            console.log('result--->', i);
            const angle = genAngle(i);
            // const angle = genAngle(Math.floor(i + (-U / P + 1)))
            console.log("angle", angle);
            return angle;
        }
    }
    console.log('result--->', num_list.length);
    const angle = genAngle(8);
    console.log("angle", angle);
    return genAngle(8);
};
// Consider fee
PlayRouter.get('/test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json('Play router is working now');
    }
    catch (e) {
        console.warn(e);
        return res.status(500).json({ error: `Internal Error -> ${e}` });
    }
}));
// @route    POST api/wallet/start
// @desc     User play the spin wheel
// @access   Public -> Private (need research for security, to expand multi deposit)
PlayRouter.post('/play', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = yield UserModel_1.default.findOne({ address: req.body.address });
        const gameInfo = yield GameModel_1.default.findOne({});
        if (!gameInfo) {
            const newData = new GameModel_1.default({
                totalPlaying: 0,
                totalClaimable: 0,
                totalDeposited: 0,
                totalClaimed: 0,
            });
            yield newData.save();
        }
        if (userInfo) {
            // Add data to json
            if (userInfo.playingAmount != 0 || userInfo.process) {
                console.warn(`${req.body.address} is not claimed yet`);
                return res.status(400).json({ error: 'You are not claimed yet' });
            }
            if (userInfo.depositAmount == 0) {
                console.warn(`${req.body.address} has not deposit yet`);
                return res.status(400).json({ error: 'You did not deposit yet' });
            }
            // Generate random number
            const prize = req.body.prize;
            // ...
            const game_result = genResult({ U: userInfo.depositAmount, P: gameInfo.totalPlaying, C: gameInfo.totalClaimable, prize: prize });
            // Calc claimable amount
            const reward = 500;
            const total = userInfo.totalDeposited + userInfo.depositAmount;
            yield UserModel_1.default.findOneAndUpdate({ address: req.body.address }, {
                depositAmount: 0,
                playingAmount: userInfo.depositAmount,
                claimableAmount: reward,
                totalDeposited: total,
                process: true
            });
            yield GameModel_1.default.findOneAndUpdate({}, {
                totalPlaying: gameInfo.totalPlaying + userInfo.depositAmount,
                totalClaimable: gameInfo.totalClaimable + reward,
                totalDeposited: gameInfo.totalDeposited + userInfo.depositAmount
            }, { upsert: true });
            const tx = new HistoryModel_1.default({
                address: req.body.address,
                amount: userInfo.depositAmount,
                action: 'play'
            });
            yield tx.save();
            return res.json({ message: "Spinning started" });
        }
        else {
            // User not exist
            console.log(`${req.body.address} not exist in our db`);
            return res.status(404).json({ error: "You are not registered to our platform" });
        }
    }
    catch (e) {
        console.warn(e);
        return res.status(500).json({ error: `Internal Error -> ${e}` });
    }
}));
// @route    POST api/wallet/start
// @desc     User play the spin wheel
// @access   Public -> Private (need research for security, to expand multi deposit)
PlayRouter.post('/finish', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = yield UserModel_1.default.findOne({ address: req.body.address });
        if (userInfo) {
            if (!userInfo.process) {
                console.log(`${req.body.address} is not running game`);
                return res.status(404).json({ error: "You are not running game" });
            }
            else {
                yield UserModel_1.default.findOneAndUpdate({ address: req.body.address }, { process: false });
                const tx = new HistoryModel_1.default({
                    address: req.body.address,
                    action: 'finish'
                });
                return res.json({ message: "Game is finished" });
            }
        }
        else {
            // User not exist
            console.log(`${req.body.address} not exist in our db`);
            return res.status(404).json({ error: "You are not registered to our platform" });
        }
    }
    catch (e) {
        console.warn(e);
        return res.status(500).json({ error: `Internal Error -> ${e}` });
    }
}));
exports.default = PlayRouter;

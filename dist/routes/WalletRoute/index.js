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
const WalletRouter = (0, express_1.Router)();
// Consider fee
// @route    POST api/wallet/deposit
// @desc     User deposit token to play game
// @access   Public -> Private (need research for security, to expand multi deposit)
// @params   address, amount, tx
WalletRouter.post('/deposit', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const txInfo = yield HistoryModel_1.default.findOne({ tx: req.body.tx });
        if (txInfo) {
            console.warn(`${req.body.address} is using last tx`);
            yield UserModel_1.default.findOneAndUpdate({ address: req.body.address }, { risk: 'Usd old transaction' }, { upsert: true });
            return res.status(400).json({ error: 'You are using old tx signature' });
        }
        const userInfo = yield UserModel_1.default.findOne({ address: req.body.address });
        if (userInfo) {
            // User have already deposit
            if (userInfo.depositAmount != 0) {
                console.warn(`${req.body.address} has already deposit`);
                return res.status(400).json({ error: 'You have already deposit' });
            }
            // if (userInfo.playingAmount != 0) {
            //     console.warn(`${req.body.address} is playing now`)
            //     return res.status(400).json({ error: 'You have are playing game now' })
            // }
            // Total deposit should be updated after play
            // let totalDeposited: number = 0
            // totalDeposited = userInfo.totalDeposited + Number(req.body.amount)
            yield UserModel_1.default.findOneAndUpdate({ address: req.body.address }, { depositAmount: req.body.amount });
            const tx = new HistoryModel_1.default({
                address: req.body.address,
                action: 'deposit',
                amount: req.body.amount,
                tx: req.body.tx
            });
            yield tx.save();
            return res.json({
                message: "Successfully deposited", data: {
                    amount: req.body.amount
                }
            });
        }
        else {
            // User new deposit
            const newUser = new UserModel_1.default({
                address: req.body.address,
                depositAmount: req.body.amount,
            });
            yield newUser.save();
            const tx = new HistoryModel_1.default({
                address: req.body.address,
                action: 'new deposit',
                amount: req.body.amount,
                tx: req.body.tx
            });
            yield tx.save();
            return res.json({
                message: "Successfully registered and deposited", data: {
                    amount: req.body.amount
                }
            });
        }
    }
    catch (e) {
        console.warn(e);
        return res.status(500).json({ error: `Internal Error -> ${e}` });
    }
}));
// @route    POST api/wallet/claim
// @desc     User claim token of reward
// @access   Public
WalletRouter.post('/claim', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = yield UserModel_1.default.findOne({ address: req.body.address });
        const gameInfo = yield GameModel_1.default.findOne({});
        if (userInfo) {
            // if (userInfo.depositAmount > 0) {
            //     console.warn(`${req.body.address} has not start play yet`)
            //     return res.status(400).json({ error: 'You did not start play yet' })
            // }
            if (userInfo.totalDeposited == 0) {
                console.warn(`${req.body.address} has not deposit yet`);
                return res.status(400).json({ error: 'You did not deposit yet' });
            }
            if (userInfo.playingAmount == 0) {
                console.warn(`${req.body.address} has not played yet`);
                return res.status(400).json({ error: 'You did not played yet' });
            }
            if (userInfo.claimableAmount == 0) {
                console.warn(`${req.body.address} has no claimable amount`);
                return res.status(400).json({ error: 'You have no claimable amount' });
            }
            if (userInfo.process) {
                console.warn(`${req.body.address} is not finish game yet`);
                return res.status(400).json({ error: 'Your game is not finished yet' });
            }
            // Create tx to send sol to user
            // ...
            let totalClaimed = 0;
            totalClaimed += userInfo.totalClaimed + userInfo.claimableAmount;
            yield UserModel_1.default.findOneAndUpdate({ address: req.body.address }, { totalClaimed, playingAmount: 0, claimableAmount: 0 });
            yield GameModel_1.default.findOneAndUpdate({}, {
                totalPlaying: gameInfo.totalPlaying - userInfo.playingAmount,
                totalClaimable: gameInfo.totalClaimable - userInfo.claimableAmount,
                totalClaimed: gameInfo.totalClaimed + userInfo.claimableAmount
            });
            const tx = new HistoryModel_1.default({
                address: req.body.address,
                action: 'claim',
                amount: userInfo.claimableAmount,
                tx: req.body.tx
            });
            yield tx.save();
            return res.json({ message: "Successfully claimed" });
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
// @route    POST api/wallet/withdraw
// @desc     User withdraw token already deposited
// @access   Public
WalletRouter.post('/withdraw', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = yield UserModel_1.default.findOne({ address: req.body.address });
        if (userInfo) {
            if (userInfo.depositAmount == 0) {
                console.warn(`${req.body.address} has not deposit yet`);
                return res.status(400).json({ error: 'You did not deposit yet' });
            }
            // Calculate amount reduced by fee
            // Create tx to send sol to user
            // ...
            yield UserModel_1.default.findOneAndUpdate({ address: req.body.address }, { depositAmount: 0 });
            const tx = new HistoryModel_1.default({
                address: req.body.address,
                action: 'withdraw',
                amount: userInfo.depositAmount,
                tx: req.body.tx
            });
            yield tx.save();
            return res.json({ message: "Successfully withdrew" });
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
exports.default = WalletRouter;

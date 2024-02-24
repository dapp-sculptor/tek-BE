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
exports.getTokenAccount = exports.sendSolToUser = void 0;
const express_1 = require("express");
const UserModel_1 = __importDefault(require("../../model/UserModel"));
const HistoryModel_1 = __importDefault(require("../../model/HistoryModel"));
const GameModel_1 = __importDefault(require("../../model/GameModel"));
const config_1 = require("../../config/config");
const web3_js_1 = require("@solana/web3.js");
const bs58_1 = __importDefault(require("bs58"));
const spl_token_1 = require("@solana/spl-token");
// Create a new instance of the Express Router of handle wallet
const WalletRouter = (0, express_1.Router)();
// Consider fee
const sendSolToUser = (userWallet, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const treasuryKeypair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(config_1.treasuryPrivKey));
        // Connect to cluster
        const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)(config_1.solanaNet));
        // Add transfer instruction to transaction
        const userWalletPK = new web3_js_1.PublicKey(userWallet);
        const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.transfer({
            fromPubkey: treasuryKeypair.publicKey,
            toPubkey: userWalletPK,
            lamports: amount * web3_js_1.LAMPORTS_PER_SOL,
        }));
        const recentBlockhash = yield connection.getLatestBlockhash();
        transaction.recentBlockhash = recentBlockhash.blockhash;
        transaction.feePayer = treasuryKeypair.publicKey;
        // Sign transaction, broadcast, and confirm
        const signature = yield (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [treasuryKeypair]);
        return signature;
    }
    catch (e) {
        console.warn(e);
        return '';
    }
});
exports.sendSolToUser = sendSolToUser;
const getTokenAccount = () => __awaiter(void 0, void 0, void 0, function* () {
    const connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)(config_1.solanaNet));
    const treasuryKeypair = web3_js_1.Keypair.fromSecretKey(bs58_1.default.decode(config_1.treasuryPrivKey));
    const treasuryTokenAccount = yield (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, treasuryKeypair, new web3_js_1.PublicKey(config_1.tokenMint), treasuryKeypair.publicKey);
    console.log('tes', treasuryKeypair, treasuryTokenAccount);
    return treasuryTokenAccount.address.toString();
});
exports.getTokenAccount = getTokenAccount;
WalletRouter.get('/test', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json('Wallet router is working now');
    }
    catch (e) {
        console.warn(e);
        return res.status(500).json({ error: `Internal Error -> ${e}` });
    }
}));
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
            if (userInfo.deposit) {
                console.warn(`${req.body.address} has already deposit`);
                return res.status(400).json({ error: 'You have already deposit' });
            }
            // User is playing game
            if (userInfo.playing) {
                console.warn(`${req.body.address} is playing now`);
                return res.status(400).json({ error: 'You have are playing game now' });
            }
            if (Number(req.body.amount) >= config_1.RBYAmount)
                yield UserModel_1.default.findOneAndUpdate({ address: req.body.address }, { deposit: true });
            else {
                console.warn(`${req.body.address} should more deposit`);
                return res.status(400).json({ error: 'You should more deposit' });
            }
            const tx = new HistoryModel_1.default({
                address: req.body.address,
                action: 'deposit',
                amount: req.body.amount,
                tx: req.body.tx
            });
            yield tx.save();
            console.log(`${req.body.address} deposit`);
            return res.json({
                message: "Successfully deposited", data: {
                    amount: config_1.RBYAmount
                }
            });
        }
        else {
            // // User new deposit
            // const newUser = new User({
            //     address: req.body.address,
            //     depositAmount: req.body.amount,
            // })
            // await newUser.save()
            // const tx = new History({
            //     address: req.body.address,
            //     action: 'deposit',
            //     amount: req.body.amount,
            //     tx: req.body.tx
            // })
            // await tx.save()
            // return res.json({
            //     message: "Successfully registered and deposited", data: {
            //         amount: req.body.amount
            //     }
            // })
        }
    }
    catch (e) {
        console.warn(e);
        return res.status(500).json({ error: `Internal Error -> ${e}` });
    }
}));
// @route    POST api/wallet/fetch
// @desc     User fetch all data
// @access   Public -> Private (need research for security, to expand multi deposit)
// @params   address, amount, tx
WalletRouter.post('/fetch', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userInfo = yield UserModel_1.default.findOne({ address: req.body.address });
        if (userInfo) {
            yield UserModel_1.default.findOneAndUpdate({ address: req.body.address }, { process: false });
            console.log(`${req.body.address} fetch data`);
            return res.json({
                message: "User data", data: {
                    deposit: userInfo.deposit,
                    playing: userInfo.playing,
                    claimable: userInfo.claimableAmount,
                    totalDeposit: userInfo.totalDeposited,
                    totalClaim: userInfo.totalClaimed,
                    process: false
                }
            });
        }
        else {
            // New user
            const newUser = new UserModel_1.default({
                address: req.body.address
            });
            yield newUser.save();
            const tx = new HistoryModel_1.default({
                address: req.body.address,
                action: 'register',
                amount: 0,
            });
            yield tx.save();
            console.log(`${req.body.address} is registered`);
            return res.json({
                message: "New User", data: {
                    deposit: false,
                    playing: false,
                    claimable: 0,
                    totalDeposit: 0,
                    totalClaim: 0,
                    process: false
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
            if (userInfo.totalDeposited == 0) {
                console.warn(`${req.body.address} has never deposit`);
                return res.status(400).json({ error: 'You have never deposit' });
            }
            if (!userInfo.playing) {
                console.warn(`${req.body.address} has not played yet`);
                return res.status(400).json({ error: 'You did not played yet' });
            }
            if (userInfo.process) {
                console.warn(`${req.body.address} is not finish game yet`);
                return res.status(400).json({ error: 'Your game is not finished yet' });
            }
            let signature = '';
            if (userInfo.claimableAmount) {
                // Create tx to send sol to user
                signature = yield (0, exports.sendSolToUser)(req.body.address, userInfo.claimableAmount);
            }
            let totalClaimed = 0;
            totalClaimed += userInfo.totalClaimed + userInfo.claimableAmount;
            yield UserModel_1.default.findOneAndUpdate({ address: req.body.address }, { totalClaimed: userInfo.totalClaimed + userInfo.claimableAmount, playing: false, claimableAmount: 0 });
            yield GameModel_1.default.findOneAndUpdate({}, {
                totalPlaying: (gameInfo.totalPlaying) + 1,
                totalClaimable: gameInfo.totalClaimable - userInfo.claimableAmount,
                totalClaimed: gameInfo.totalClaimed + userInfo.claimableAmount
            });
            const tx = new HistoryModel_1.default({
                address: req.body.address,
                action: 'claim',
                amount: userInfo.claimableAmount,
                tx: signature
            });
            yield tx.save();
            console.log(`${req.body.address} claimed`);
            return res.json({
                message: "Successfully claimed", data: {
                    signature: signature
                }
            });
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
WalletRouter.get('/tokenaccount', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.json(yield (0, exports.getTokenAccount)());
    }
    catch (e) {
        console.log(e);
    }
}));
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
exports.default = WalletRouter;

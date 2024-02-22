"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const StakingSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true },
    amount: { type: String, required: true },
    chainId: { type: Number, required: true },
    claimTime: { type: Number, required: true },
    count: { type: String, required: true },
    date: { type: Number, required: true },
    duration: { type: Number, required: true },
    reward: { type: String, default: "0" },
    unstaken: { type: Boolean, default: true },
});
const StakingModel = mongoose_1.default.model("staking", StakingSchema);
exports.default = StakingModel;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    address: { type: String, required: true },
    depositAmount: { type: Number, default: 0 },
    playingAmount: { type: Number, default: 0 },
    claimableAmount: { type: Number, default: 0 },
    totalDeposited: { type: Number, default: 0 },
    totalClaimed: { type: Number, default: 0 },
    process: { type: Boolean, default: false },
    risk: { type: String }
});
const UserModel = mongoose_1.default.model("user", UserSchema);
exports.default = UserModel;

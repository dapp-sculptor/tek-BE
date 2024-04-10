"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TxSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true },
    chainId: { type: Number, required: true },
    action: { type: String, required: true },
    amount: { type: String },
    hash: { type: String },
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
});
const TxModel = mongoose_1.default.model("tx", TxSchema);
exports.default = TxModel;

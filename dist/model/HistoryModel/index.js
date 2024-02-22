"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const HistorySchema = new mongoose_1.default.Schema({
    address: { type: String, required: true },
    action: { type: String, required: true, enum: ['new deposit', 'deposit', 'withdraw', 'play', 'claim', 'finish'] },
    amount: { type: Number, required: true },
    tx: { type: String }
});
const HistoryModel = mongoose_1.default.model("history", HistorySchema);
exports.default = HistoryModel;

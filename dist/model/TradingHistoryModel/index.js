"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const TradingSchema = new mongoose_1.default.Schema({
    coin: { type: String, required: true },
    profit: { type: String, required: true },
    date: { type: Date, default: Date.now },
});
const TradingModel = mongoose_1.default.model("trading", TradingSchema);
exports.default = TradingModel;

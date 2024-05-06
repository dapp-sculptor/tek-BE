"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const DataSchema = new mongoose_1.default.Schema({
    address: { type: String, required: true, unique: true },
    count: { type: Number, },
    claimableAmount: { type: Number, },
    winnerState: { type: Boolean, },
});
const DataModel = mongoose_1.default.model("data", DataSchema);
exports.default = DataModel;

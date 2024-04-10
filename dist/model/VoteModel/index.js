"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const VoteSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true },
    chainId: { type: Number, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    startTime: { type: Number, required: true },
    duration: { type: Number, required: true },
    level: { type: Number, required: true },
    count: { type: Number, required: true },
    totalUser: { type: Number, required: true },
    yes: [String],
    no: [String],
});
const VoteModel = mongoose_1.default.model("vote", VoteSchema);
exports.default = VoteModel;

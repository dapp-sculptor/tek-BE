"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MsgSchema = new mongoose_1.default.Schema({
    userId: { type: String, require: true },
    message: { type: String, require: true },
    time: { type: Date, default: Date.now() },
});
const MsgModel = mongoose_1.default.model("msg", MsgSchema);
exports.default = MsgModel;

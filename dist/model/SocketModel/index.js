"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const SocketSchema = new mongoose_1.default.Schema({
    userId: { type: String, required: true },
    evm: { type: String, required: true },
    tron: { type: String, required: true },
    socketId: { type: String, required: true },
});
const SocketModel = mongoose_1.default.model("socket", SocketSchema);
exports.default = SocketModel;

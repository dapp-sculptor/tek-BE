"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const GameSchema = new mongoose_1.default.Schema({
    totalPlaying: { type: Number, default: 0 },
    totalClaimable: { type: Number, default: 0 },
    totalClaimed: { type: Number, default: 0 }
});
const GameModel = mongoose_1.default.model("game", GameSchema);
exports.default = GameModel;

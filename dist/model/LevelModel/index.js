"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const LevelSchema = new mongoose_1.default.Schema({
    userId: { type: String, require: true, unique: true },
    userLevel: {
        ethereum: {
            type: Number,
            default: 0,
        },
        polygon: {
            type: Number,
            default: 0,
        },
        binance: {
            type: Number,
            default: 0,
        },
        tron: {
            type: Number,
            default: 0,
        },
    },
    referLevel: {
        ethereum: {
            type: Number,
            default: 0,
        },
        polygon: {
            type: Number,
            default: 0,
        },
        binance: {
            type: Number,
            default: 0,
        },
        tron: {
            type: Number,
            default: 0,
        },
    },
});
const LevelModel = mongoose_1.default.model("level", LevelSchema);
exports.default = LevelModel;

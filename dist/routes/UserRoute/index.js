"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = __importDefault(require("fs"));
// Create a new instance of the Express Router
const UserRouter = (0, express_1.Router)();
// @route    POST api/users/signup
// @desc     Register user
// @access   Public
UserRouter.post("/amount", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address } = req.body;
        const data = JSON.parse(fs_1.default.readFileSync("./routes/result.json", `utf8`));
        if (address in data) {
            const info = data[address];
            res.json(info.amount);
        }
        else {
            console.error(`{${address}} => User not found`);
            return res.status(404).send({ error: 'User not found' });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ error });
    }
}));
exports.default = UserRouter;

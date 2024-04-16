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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const data_1 = require("../data");
// Create a new instance of the Express Router
const UserRouter = (0, express_1.Router)();
// @route    POST api/users/signup
// @desc     Register user
// @access   Public
UserRouter.post("/amount", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { address } = req.body;
        if (address in data_1.data) {
            // @ts-ignore
            const info = data_1.data[address];
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

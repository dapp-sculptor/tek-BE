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
const model_1 = __importDefault(require("../../model"));
// Create a new instance of the Express Router
const UserRouter = (0, express_1.Router)();
// @route    POST api/users/signup
// @desc     Register user
// @access   Public
UserRouter.get("/:address", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    console.log('here');
    try {
        const { address } = req.params;
        const query = { address: { $regex: new RegExp(address, 'i') } };
        console.log(query);
        const result = yield model_1.default.findOne(query);
        return res.json({ claimableAmount: (_a = result === null || result === void 0 ? void 0 : result.claimableAmount) !== null && _a !== void 0 ? _a : 0, winnerState: (_b = result === null || result === void 0 ? void 0 : result.winnerState) !== null && _b !== void 0 ? _b : false });
    }
    catch (error) {
        console.error(error);
        return res.status(500).send({ error });
    }
}));
exports.default = UserRouter;

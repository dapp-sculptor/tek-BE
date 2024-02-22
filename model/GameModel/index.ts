import mongoose from "mongoose";

const GameSchema = new mongoose.Schema({
    totalPlaying: { type: Number, default: 0 },
    totalClaimable: { type: Number, default: 0 },
    totalDeposited: { type: Number, default: 0 },
    totalClaimed: { type: Number, default: 0 }
});

const GameModel = mongoose.model("game", GameSchema);

export default GameModel;

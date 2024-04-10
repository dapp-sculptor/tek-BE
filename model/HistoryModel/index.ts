import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
    address: { type: String, required: true },
    action: { type: String, required: true, enum: ['register','deposit', 'withdraw', 'play', 'claim', 'finish'] },
    amount: { type: Number},
    tx: { type: String }
});

const HistoryModel = mongoose.model("history", HistorySchema);

export default HistoryModel;

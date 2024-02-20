import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema({
    address: { type: String, required: true },
    action: { type: String, required: true, enum: ['new deposit', 'deposit', 'withdraw', 'play', 'claim', 'finish'] },
    amount: { type: Number, required: true },
    tx: { type: String }
});

const HistoryModel = mongoose.model("history", HistorySchema);

export default HistoryModel;

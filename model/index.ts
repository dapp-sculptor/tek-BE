import mongoose from "mongoose";

const DataSchema = new mongoose.Schema({
    address: { type: String, required: true, unique: true },
    count: { type: Number,  },
    claimableAmount: { type: Number,  },
    winnerState: { type: Boolean,  },
});

const DataModel = mongoose.model("data", DataSchema);

export default DataModel;
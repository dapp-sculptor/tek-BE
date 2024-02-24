import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  address: { type: String, required: true },
  deposit: { type: Boolean, default: false },
  playing: { type: Boolean, default: false },
  claimableAmount: { type: Number, default: 0 },
  totalDeposited: { type: Number, default: 0 },
  totalClaimed: { type: Number, default: 0 },
  process: { type: Boolean, default: false },
  risk: { type: String }
});

const UserModel = mongoose.model("user", UserSchema);

export default UserModel;

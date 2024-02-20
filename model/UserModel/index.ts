import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  address: { type: String, required: true },
  depositAmount: { type: Number, default: 0 },
  playingAmount: { type: Number, default: 0 },
  claimableAmount: { type: Number, default: 0 },
  totalDeposited: { type: Number, default: 0 },
  totalClaimed: { type: Number, default: 0 },
  process: { type: Boolean, default: false }
});

const UserModel = mongoose.model("user", UserSchema);

export default UserModel;

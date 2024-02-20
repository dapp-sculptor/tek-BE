import mongoose from "mongoose";

const ListSchema = new mongoose.Schema({
  whiteList: { type: String, required: true }
});

const ListModel = mongoose.model("list", ListSchema);

export default ListModel;

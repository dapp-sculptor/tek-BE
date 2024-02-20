import mongoose from "mongoose";

const ListSchema = new mongoose.Schema({
  whiteList: [String],
});

const ListModel = mongoose.model("list", ListSchema);

export default ListModel;

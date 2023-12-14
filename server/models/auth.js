const mongoose = require("mongoose");

const ImgSchema = mongoose.Schema({
  fileName: String,
  mimeType: String,
  path: String,
  size: Number,
});

const Schema = mongoose.Schema({
  user: {
    type: String,
    required: [true, "password not provided"],
  },
  pass: {
    type: String,
    required: [true, "password not provided"],
  },
  email: {
    type: String,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  imgData: ImgSchema,
});

const DataSchema = mongoose.model("authTable", Schema, "authTable");

module.exports = { DataSchema };

const mongoose = require("mongoose");

const ImgSchema = mongoose.Schema({
  fileName: String,
  mimeType: String,
  path: String,
  size: Number,
});

const Schema = mongoose.Schema({
  studentID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  subjectID: mongoose.Schema.Types.ObjectId,
  marks: {
    type: Number,
    required: true,
  },
  imgData: ImgSchema,
});

module.exports = mongoose.model("marksTable", Schema, "marksTable");

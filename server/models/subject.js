const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  name: String,
});

module.exports = mongoose.model("subjectTable", Schema, "subjectTable");

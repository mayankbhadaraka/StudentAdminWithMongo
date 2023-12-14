const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  phone: {
    type: Number,
  }
});

module.exports = mongoose.model("studentTable", Schema, "studentTable");

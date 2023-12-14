const mongoose = require("mongoose");

const Schema = mongoose.Schema({
  user: {
    type: String,
  },
  pass: {
    type: String,
  },
  email:{
    type:String
  }
});

module.exports = mongoose.model("adminAuthTable", Schema, "adminAuthTable");
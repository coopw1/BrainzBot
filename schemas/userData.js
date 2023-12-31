const { Schema, model } = require("mongoose");

let userData = new Schema({
  userID: String,
  ListenBrainzToken: String,
});

module.exports = model("userData", userData);

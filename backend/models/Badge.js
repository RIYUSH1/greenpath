// models/Badge.js
const mongoose = require("mongoose");

const BadgeSchema = new mongoose.Schema({
  key: String,
  name: String,
  description: String,
  icon: String,
});

module.exports = mongoose.model("Badge", BadgeSchema);

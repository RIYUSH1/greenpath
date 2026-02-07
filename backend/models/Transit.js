const mongoose = require("mongoose");

const TransitSchema = new mongoose.Schema(
  {
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    mode: { type: String, required: true },
    distance: { type: Number },
    duration: { type: String },
    co2: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional user ref
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transit", TransitSchema);

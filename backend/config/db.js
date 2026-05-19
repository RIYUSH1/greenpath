const mongoose = require("mongoose");

async function connectDB(uri) {
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }
  const trimmed = uri.trim();
  if (!trimmed.startsWith("mongodb://") && !trimmed.startsWith("mongodb+srv://")) {
    throw new Error("Invalid scheme, expected connection string to start with: mongodb:// or mongodb+srv://");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(trimmed);
  console.log("MongoDB connected");
}

module.exports = { connectDB };


const User = require("../models/User");

// GET all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // exclude passwords
    res.json({ ok: true, users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ ok: false, message: "Server error" });
  }
};

module.exports = { getAllUsers };

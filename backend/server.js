// server.js
require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const cron = require("node-cron");

// ✅ Import API Route Files
const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");
const tripsRoutes = require("./routes/trips");
const transitRoutes = require("./routes/transit");
const dashboardRoutes = require("./routes/dashboard");

// ✅ External ORS Route
const orsRoutes = require("./routes/external_ors");

// ✅ NEW Leaderboard Route
const leaderboardRoutes = require("./routes/leaderboard");

// ✅ NEW: AQI proxy route
const aqiRoutes = require("./routes/aqi");

// ✅ MongoDB Connect
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/greenways";
mongoose.set("strictQuery", true);
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ✅ Initialize Express + Socket.io
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// ✅ Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/transit", transitRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/external", orsRoutes);

// ✅ New Leaderboard Route
app.use("/api/leaderboard", leaderboardRoutes);

// ✅ NEW: AQI proxy mount
app.use("/api/aqi", aqiRoutes);

// ✅ Health Check Route
app.get("/api/health", (req, res) =>
  res.json({ ok: true, time: new Date().toISOString() })
);

// ✅ Live Transit Updates
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  const id = setInterval(() => {
    socket.emit("transit:update", { bus: Math.floor(Math.random() * 10) + " mins" });
  }, 15000);

  socket.on("disconnect", () => {
    clearInterval(id);
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ✅ Cron Task Example
cron.schedule("0 7 * * *", () => console.log("⏰ Daily job executed at 07:00"));

// ✅ Serve Frontend (Production Only)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "public")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

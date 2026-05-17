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
const safetyRoutes = require("./routes/safety");
const routeProxyRoutes = require("./routes/route_proxy");
const nightSafetyRoutes = require("./routes/nightSafety.routes.js");

// ✅ MongoDB Connect
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/greenpath";
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
const io = new Server(server, { 
  cors: { 
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"]
  } 
});

// ✅ Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use(express.json());

app.use("/api/night-safety", nightSafetyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/transit", transitRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/external", orsRoutes);
app.use("/api/safety", safetyRoutes);

// ✅ New Leaderboard Route
app.use("/api/leaderboard", leaderboardRoutes);

// ✅ NEW: AQI proxy mount
app.use("/api/route", routeProxyRoutes);
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

// ✅ Serve Frontend Static Files (Production Only)
// NOTE: This is only used if frontend is co-located. On Render, frontend is on Vercel.
// The catch-all is guarded to never intercept /api/* routes.
if (process.env.NODE_ENV === "production" && process.env.SERVE_FRONTEND === "true") {
  app.use(express.static(path.join(__dirname, "public")));
  app.get(/^(?!\/api).*$/, (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });
}

// ✅ Start Server
const PORT = process.env.PORT || 5000;

function startServer(port) {
  server.listen(port, "0.0.0.0")
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        const nextPort = Number(port) + 1;
        console.log(`⚠️  Port ${port} is occupied. Retrying on ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error("❌ Server Error:", err);
      }
    })
    .on("listening", () => {
      const addr = server.address();
      const host = addr.address === "0.0.0.0" ? "localhost" : addr.address;
      console.log(`🚀 Production Server running on port ${addr.port}`);
      console.log(`🔗 API Health: http://${host}:${addr.port}/api/health`);
    });
}

// Global Error Handlers for Production Stability
process.on("unhandledRejection", (err) => {
  console.error("❌ UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

startServer(PORT);

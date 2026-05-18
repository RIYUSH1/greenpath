// server.js — GreenPath Backend Entry Point
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

// ── Import API Route Files ────────────────────────────────────────────────────
const authRoutes        = require("./routes/auth");
const usersRoutes       = require("./routes/users");
const tripsRoutes       = require("./routes/trips");
const transitRoutes     = require("./routes/transit");
const dashboardRoutes   = require("./routes/dashboard");
const orsRoutes         = require("./routes/external_ors");
const leaderboardRoutes = require("./routes/leaderboard");
const aqiRoutes         = require("./routes/aqi");
const safetyRoutes      = require("./routes/safety");
const routeProxyRoutes  = require("./routes/route_proxy");
const nightSafetyRoutes = require("./routes/nightSafety.routes.js");

// ── MongoDB Connection ────────────────────────────────────────────────────────
// Non-fatal: server starts regardless; retries on failure so a temporary
// Atlas blip never crashes the container.
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn("⚠️  MONGO_URI not set. MongoDB-backed routes will return 500 until set.");
} else {
  mongoose.set("strictQuery", true);

  const connectWithRetry = () => {
    mongoose
      .connect(MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // give Atlas 10 s to respond
        socketTimeoutMS: 45000,
      })
      .then(() => console.log("✅ MongoDB connected"))
      .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        console.log("🔄 Retrying MongoDB connection in 5 seconds…");
        setTimeout(connectWithRetry, 5000);
      });
  };

  connectWithRetry();
}

// ── Express + Socket.IO ───────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(process.env.NODE_ENV === "production" ? morgan("combined") : morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/users",        usersRoutes);
app.use("/api/trips",        tripsRoutes);
app.use("/api/transit",      transitRoutes);
app.use("/api/dashboard",    dashboardRoutes);
app.use("/api/external",     orsRoutes);
app.use("/api/safety",       safetyRoutes);
app.use("/api/leaderboard",  leaderboardRoutes);
app.use("/api/route",        routeProxyRoutes);
app.use("/api/aqi",          aqiRoutes);
app.use("/api/night-safety", nightSafetyRoutes);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, time: new Date().toISOString(), env: process.env.NODE_ENV })
);

// ── 404 catch-all (only for unmatched API paths) ─────────────────────────────
app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found" }));

// ── Frontend Static Files (only when SERVE_FRONTEND=true) ────────────────────
// On Render, frontend lives on Vercel — this block is normally inactive.
if (process.env.NODE_ENV === "production" && process.env.SERVE_FRONTEND === "true") {
  const publicDir = path.join(__dirname, "public");
  app.use(express.static(publicDir));
  // Express 4 compatible: use a string with wildcard instead of regex
  app.get("/*", (req, res) => {
    // Never intercept /api routes
    if (req.path.startsWith("/api")) return;
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

// ── Socket.IO: Live Transit Updates ──────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  const id = setInterval(() => {
    socket.emit("transit:update", { bus: `${Math.floor(Math.random() * 10) + 1} mins` });
  }, 15000);

  socket.on("disconnect", () => {
    clearInterval(id);
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ── Cron Task ─────────────────────────────────────────────────────────────────
cron.schedule("0 7 * * *", () => console.log("⏰ Daily cron job executed at 07:00"));

// ── Global Error Handlers ─────────────────────────────────────────────────────
// Unhandled promise rejections (ORS timeouts, MapTiler failures, etc.)
// must NEVER crash the server — log only.
process.on("unhandledRejection", (reason) => {
  console.error("⚠️  Unhandled Rejection:", reason?.message || reason);
});

// Uncaught synchronous exceptions are fatal — log then exit so the container
// restarts cleanly rather than hanging in an unknown state.
process.on("uncaughtException", (err) => {
  console.error("❌ UNCAUGHT EXCEPTION — shutting down:", err.name, err.message);
  process.exit(1);
});

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || "5000", 10);

function startServer(port) {
  server
    .listen(port, "0.0.0.0")
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        const next = port + 1;
        console.warn(`⚠️  Port ${port} in use — retrying on ${next}…`);
        startServer(next);
      } else {
        console.error("❌ Server error:", err);
        process.exit(1);
      }
    })
    .on("listening", () => {
      const addr = server.address();
      console.log(`🚀 GreenPath API running on port ${addr.port} [${process.env.NODE_ENV}]`);
      console.log(`🔗 Health: http://localhost:${addr.port}/api/health`);
    });
}

startServer(PORT);

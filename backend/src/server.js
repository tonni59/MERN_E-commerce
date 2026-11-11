
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";

import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Render runs the app behind a reverse proxy.
app.set("trust proxy", 1);

// --------------------------------------------------
// CORS CONFIGURATION
// --------------------------------------------------

const normalizeOrigin = (origin) => {
  if (!origin) return null;

  return origin.trim().replace(/\/+$/, "");
};

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.ADMIN_URL,
]
  .map(normalizeOrigin)
  .filter(Boolean);

// Allow localhost only during local development.
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push(
    "http://localhost:3000",
    "http://localhost:3001",
  );
}

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without an Origin header
      // (e.g. Thunder Client or server-to-server requests).
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.warn("Blocked CORS origin:", origin);
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// --------------------------------------------------
// SECURITY & MIDDLEWARE
// --------------------------------------------------

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --------------------------------------------------
// RATE LIMITING
// --------------------------------------------------

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication requests. Please try again later.",
  },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// --------------------------------------------------
// STATIC UPLOADS
// --------------------------------------------------

const uploadDir = path.resolve(
  process.cwd(),
  process.env.UPLOAD_DIR || "uploads",
);

app.use("/uploads", express.static(uploadDir));

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use("/api/auth", authLimiter, authRoutes);

app.use("/api", apiLimiter);

app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// --------------------------------------------------
// 404 HANDLER
// --------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error("API Error:", err);

  const status =
    err.status ||
    (err.name === "ValidationError" ? 400 : 500);

  res.status(status).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? status >= 500
          ? "Internal server error"
          : err.message
        : err.message || "Server error",
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`API server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log("Allowed origins:", allowedOrigins);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();

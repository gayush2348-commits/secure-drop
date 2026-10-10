import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./src/config/db.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.route.js";
import fileRoutes from "./src/routes/files.routes.js";
import adminRoutes from "./src/routes/admin.routes.js";
import rateLimit from "express-rate-limit";
import mongoSanitize from "@exortek/express-mongo-sanitize";

dotenv.config();

const app = express();
app.use(mongoSanitize());

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // max 100 requests
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests, please try again later",
  },
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts, please try again later",
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    message: "SecureDrop API is running",
  });
});

const PORT = process.env.PORT || 8080;
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/admin", adminRoutes);

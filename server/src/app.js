import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  })
);
app.use(express.json({ limit: "20kb" }));
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Taskify API" });
});
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;

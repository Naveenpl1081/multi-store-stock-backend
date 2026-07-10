import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());


app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);


app.use((req, res) => {
  res.status(404).json({ error: { message: "Route not found" } });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: { message: err.message || "Internal server error" },
  });
});

export default app;
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import { seedDatabase } from "./models";
import authRouter from "./routes/auth";
import foodRouter from "./routes/food";
import orderRouter from "./routes/orders";
import userRouter from "./routes/users";
import reportRouter from "./routes/reports";

// Establish Database Connection and run seeds
connectDB().then(() => {
  seedDatabase();
});

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // API Routes
  app.use("/api/auth", authRouter);
  app.use("/api/food-items", foodRouter);
  app.use("/api/orders", orderRouter);
  app.use("/api/users", userRouter);
  app.use("/api/reports", reportRouter);

  // Ping endpoint
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  return app;
}

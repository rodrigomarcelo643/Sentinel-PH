import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import observationWebhook from "./webhooks/observation-webhook.js";
import smsWebhook from "./webhooks/sms-webhook.js";
import authWebhook from "./webhooks/auth-webhook.js";
import authRoutes from "./routes/auth.js";
import { apiRateLimit } from "./middleware/rateLimit.js";
import { sanitizeInput } from "./middleware/validation.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
const app = express();
const PORT = process.env.WEBHOOK_PORT || 3001;

app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:5173",
    ],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global middleware
app.use(apiRateLimit);
app.use(sanitizeInput);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("/webhook", observationWebhook);
app.use("/webhook", smsWebhook);
app.use("/webhook", authWebhook);
app.use("/auth", authRoutes);

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Webhook server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Webhooks available at: http://localhost:${PORT}/webhook/*`);
});

export default app;

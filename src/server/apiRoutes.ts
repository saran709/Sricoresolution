import type { Express } from "express";
import {
  healthHandler,
  createOrderHandler,
  verifyPaymentHandler,
  sendEmailHandler,
} from "./apiHandlers";

export function registerApiRoutes(app: Express) {
  app.get("/api/health", healthHandler);
  app.post("/api/payments/create-order", createOrderHandler);
  app.post("/api/payments/verify", verifyPaymentHandler);
  app.post("/api/email/send", sendEmailHandler);
}

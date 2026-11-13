import type { Express } from "express";
import {
  healthHandler,
  createOrderHandler,
  verifyPaymentHandler,
  sendEmailHandler,
} from "./apiHandlers";
import {
  validateQuotaHandler,
  validateActionPermissionHandler,
  validatePermissionMutationHandler,
} from "./rbacHandlers";
import { apiTimingMiddleware, createRateLimitMiddleware } from "./apiMiddleware";

const paymentRateLimit = createRateLimitMiddleware({
  keyPrefix: "payments",
  windowMs: 60_000,
  maxRequests: 30,
});

const emailRateLimit = createRateLimitMiddleware({
  keyPrefix: "email",
  windowMs: 60_000,
  maxRequests: 20,
});

const rbacRateLimit = createRateLimitMiddleware({
  keyPrefix: "rbac",
  windowMs: 60_000,
  maxRequests: 120,
});

export function registerApiRoutes(app: Express) {
  app.use("/api", apiTimingMiddleware);

  app.get("/api/health", healthHandler);
  app.post("/api/payments/create-order", paymentRateLimit, createOrderHandler);
  app.post("/api/payments/verify", paymentRateLimit, verifyPaymentHandler);
  app.post("/api/email/send", emailRateLimit, sendEmailHandler);

  app.post("/api/rbac/validate-quota", rbacRateLimit, validateQuotaHandler);
  app.post("/api/rbac/validate-action", rbacRateLimit, validateActionPermissionHandler);
  app.post("/api/rbac/permissions/validate", rbacRateLimit, validatePermissionMutationHandler);

  // Return structured JSON 404 for unknown API endpoints instead of serving SPA index.html
  app.all("/api/*", (_req, res) => {
    return res.status(404).json({ error: "API endpoint not found" });
  });
}

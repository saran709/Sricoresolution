import { createOrderHandler } from "../../src/server/apiHandlers";
import { withServerlessGuard } from "../../src/server/apiMiddleware";

export default withServerlessGuard(
  ["POST"],
  { keyPrefix: "payments", windowMs: 60_000, maxRequests: 30 },
  createOrderHandler
);

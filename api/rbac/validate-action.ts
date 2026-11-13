import { validateActionPermissionHandler } from "../../src/server/rbacHandlers";
import { withServerlessGuard } from "../../src/server/apiMiddleware";

export default withServerlessGuard(
  ["POST"],
  { keyPrefix: "rbac", windowMs: 60_000, maxRequests: 120 },
  validateActionPermissionHandler
);

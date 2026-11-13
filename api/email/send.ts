import { sendEmailHandler } from "../../src/server/apiHandlers";
import { withServerlessGuard } from "../../src/server/apiMiddleware";

export default withServerlessGuard(
  ["POST"],
  { keyPrefix: "email", windowMs: 60_000, maxRequests: 20 },
  sendEmailHandler
);

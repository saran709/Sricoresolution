import { healthHandler } from "../src/server/apiHandlers";
import { withServerlessGuard } from "../src/server/apiMiddleware";

export default withServerlessGuard(["GET"], null, healthHandler);

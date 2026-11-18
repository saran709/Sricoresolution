import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { registerApiRoutes } from "./src/server/apiRoutes";
import { gzipCompressionMiddleware } from "./src/server/apiMiddleware";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  // Global security & baseline proxy headers (iframe-compatible for AI Studio preview)
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    next();
  });

  if (process.env.NODE_ENV === "production") {
    app.use(gzipCompressionMiddleware);
  } else {
    app.use("/api", gzipCompressionMiddleware);
  }
  app.use(express.json({ limit: "1mb" }));

  // Register unified API handlers shared with Vercel serverless entrypoints
  registerApiRoutes(app);

  // Vite middleware for development vs immutable static asset serving in production
  const distPath = path.join(process.cwd(), "dist");
  let useViteDevMiddleware = process.env.NODE_ENV !== "production";

  if (useViteDevMiddleware) {
    try {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (viteError) {
      if (fs.existsSync(path.join(distPath, "index.html"))) {
        console.warn("Vite package unavailable; serving prebuilt dist assets instead.", viteError);
        useViteDevMiddleware = false;
      } else {
        throw viteError;
      }
    }
  }

  if (!useViteDevMiddleware) {
    app.use(
      "/assets",
      express.static(path.join(distPath, "assets"), {
        maxAge: "1y",
        immutable: true,
        etag: true,
      })
    );

    app.use(
      express.static(distPath, {
        maxAge: "1h",
        etag: true,
        setHeaders(res, filePath) {
          if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache");
          } else if (/\.(?:png|jpe?g|webp|svg|ico|woff2?)$/i.test(filePath)) {
            res.setHeader(
              "Cache-Control",
              "public, max-age=86400, stale-while-revalidate=604800"
            );
          } else if (/(?:robots\.txt|sitemap\.xml|ads\.txt)$/i.test(filePath)) {
            res.setHeader("Cache-Control", "public, max-age=3600");
          }
        },
      })
    );

    app.get("*", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();

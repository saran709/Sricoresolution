import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import { registerApiRoutes } from "./src/server/apiRoutes";

dotenv.config();

// We will use standard Firebase client for simplicity on the server if Admin isn't available,
// but for true security Admin SDK is preferred. For now we will create an API 
// that can be called by the frontend.

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  // Register the same API handlers used by the Vercel function entrypoints.
  registerApiRoutes(app);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

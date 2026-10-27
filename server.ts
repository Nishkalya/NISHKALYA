import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.disable("x-powered-by");

  // Lightweight in-memory rate limiter per IP (120 requests per 60s window for dynamic routes)
  const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
  const RATE_LIMIT_WINDOW_MS = 60_000;
  const RATE_LIMIT_MAX = 120;

  // Apply comprehensive HTTP security headers, CORS validation, and rate limiting
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-XSS-Protection", "0");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");

    // Strict CORS validation: only reflect trusted same-origin or AI Studio preview origins
    const origin = req.headers.origin;
    if (origin) {
      try {
        const parsedOrigin = new URL(origin);
        const host = req.headers.host || "";
        const isAllowedOrigin =
          parsedOrigin.host === host ||
          parsedOrigin.hostname === "nishkalya.studio" ||
          parsedOrigin.hostname.endsWith(".nishkalya.studio") ||
          parsedOrigin.hostname.endsWith(".run.app") ||
          parsedOrigin.hostname === "localhost" ||
          parsedOrigin.hostname === "127.0.0.1";

        if (isAllowedOrigin) {
          res.setHeader("Access-Control-Allow-Origin", origin);
          res.setHeader("Vary", "Origin");
          res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        }
      } catch {
        // Ignore malformed Origin header
      }
    }

    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }

    // Rate limit non-static asset requests
    if (!req.path.startsWith("/assets/") && !req.path.startsWith("/node_modules/") && !req.path.startsWith("/src/")) {
      const forwarded = req.headers["x-forwarded-for"];
      const clientIp = (typeof forwarded === "string" ? forwarded.split(",")[0] : req.socket.remoteAddress || "unknown").trim();
      const now = Date.now();
      const entry = rateLimitMap.get(clientIp);
      if (!entry || now > entry.resetAt) {
        rateLimitMap.set(clientIp, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      } else {
        entry.count += 1;
        if (entry.count > RATE_LIMIT_MAX) {
          res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
          return res.status(429).send("Too Many Requests. Please try again shortly.");
        }
      }
    }

    next();
  });

  // Helper to safely resolve the request's origin (preventing Host / X-Forwarded-Proto header injection)
  const getBaseUrl = (req: express.Request) => {
    const rawProto = Array.isArray(req.headers['x-forwarded-proto'])
      ? req.headers['x-forwarded-proto'][0]
      : req.headers['x-forwarded-proto'];
    const protocol = rawProto === 'http' || rawProto === 'https'
      ? rawProto
      : (req.secure ? 'https' : 'http');
    const rawHost = (req.headers.host || req.hostname || 'nishkalya.studio').trim();
    const safeHost = /^[a-zA-Z0-9.\-:]+$/.test(rawHost) ? rawHost : 'nishkalya.studio';
    return `${protocol}://${safeHost}`;
  };

  // Serve Dynamic sitemap.xml
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = getBaseUrl(req);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>2026-05-28</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/?view=projects</loc>
    <lastmod>2026-05-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(sitemap.trim());
  });

  // Serve Dynamic robots.txt
  app.get("/robots.txt", (req, res) => {
    const baseUrl = getBaseUrl(req);
    const robots = `# www.robotstxt.org
# Allow all crawlers
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header("Content-Type", "text/plain");
    res.send(robots.trim());
  });

  // Google Site Verification dynamic mapping
  app.get("/google8d65cfd211e5d4d2.html", (_req, res) => {
    res.header("Content-Type", "text/html");
    res.send("google-site-verification: google8d65cfd211e5d4d2.html");
  });

  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom", // Use custom to control the index.html routing
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Serve static files safely without auto-triggering index.html
    app.use(express.static(distPath, { index: false }));
  }

  // Fallback for HTML request / page routes
  app.all("*", async (req, res, next) => {
    const isHtmlRequest = req.method === 'GET' && (req.headers.accept?.includes('text/html') || Object.keys(req.query).length === 0);
    
    // Skip if it looks like an asset/file request
    if (req.path.includes('.') && !req.path.endsWith('.html')) {
       return next();
    }

    try {
      let html = "";
      const baseUrl = getBaseUrl(req);

      if (process.env.NODE_ENV !== "production") {
        const rawHtmlPath = path.resolve(process.cwd(), 'index.html');
        if (fs.existsSync(rawHtmlPath)) {
          html = fs.readFileSync(rawHtmlPath, 'utf8');
          // Let Vite rewrite scripts etc.
          html = await vite.transformIndexHtml(req.originalUrl, html);
        } else {
          return res.status(404).send("index.html not found");
        }
      } else {
        const distHtmlPath = path.join(process.cwd(), 'dist', 'index.html');
        if (fs.existsSync(distHtmlPath)) {
          html = fs.readFileSync(distHtmlPath, 'utf8');
        } else {
          return res.status(404).send("Production asset index.html not found");
        }
      }

      // Dynamic Replacement of ALL instances of nishkalya.studio to whichever host/origin is serving the request
      html = html.replace(/https:\/\/nishkalya\.studio/g, baseUrl);

      res.status(200).set({ 'Content-Type': 'text/html' }).send(html);
    } catch (e) {
      if (process.env.NODE_ENV !== "production" && vite) {
        vite.ssrFixStacktrace(e);
      }
      next(e);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Dynamic full-stack engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Error during initialization:", err);
});

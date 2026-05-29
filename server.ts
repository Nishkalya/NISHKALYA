import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Helper to dynamically resolve the request's origin (including protocol and host name)
  const getBaseUrl = (req: express.Request) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || req.hostname || 'nishkalya.studio';
    return `${protocol}://${host}`;
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

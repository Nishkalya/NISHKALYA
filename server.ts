import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const CANONICAL_DOMAIN = "nishkalya.studio";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Helper to dynamically resolve the request's origin (including protocol and host name)
  const getBaseUrl = (req: express.Request) => {
    const protocol = req.headers['x-forwarded-proto'] || (req.secure ? 'https' : 'http');
    const host = req.headers.host || req.hostname || CANONICAL_DOMAIN;
    return `${protocol}://${host}`;
  };

  // Redirect non-canonical domains to canonical domain (SEO)
  app.use((req, res, next) => {
    const host = req.headers.host || '';
    const isCanonical = host === CANONICAL_DOMAIN || host === `www.${CANONICAL_DOMAIN}`;
    const isLocalDev = host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0');

    if (!isCanonical && !isLocalDev && process.env.NODE_ENV === 'production') {
      const redirectUrl = `https://${CANONICAL_DOMAIN}${req.originalUrl}`;
      return res.redirect(301, redirectUrl);
    }
    next();
  });

  // Add X-Robots-Tag and Link canonical header for SEO
  app.use((req, res, next) => {
    res.header('X-Robots-Tag', 'index, follow');
    res.header('Link', `<https://${CANONICAL_DOMAIN}/>; rel="canonical"`);
    next();
  });

  // Serve Dynamic Sitemap
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

  // Dynamic Robots.txt - Block non-canonical domains like bolt.host
  app.get("/robots.txt", (req, res) => {
    const host = req.headers.host || '';
    const isCanonical = host === CANONICAL_DOMAIN || host === `www.${CANONICAL_DOMAIN}`;
    const isLocalDev = host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0');

    if (!isCanonical && !isLocalDev && process.env.NODE_ENV === 'production') {
      // Block all crawlers on non-canonical domains (like bolt.host)
      res.header("Content-Type", "text/plain");
      res.send(`# Non-canonical domain - blocking crawlers
User-agent: *
Disallow: /
`);
      return;
    }

    // Allow crawlers on canonical/domain
    const baseUrl = getBaseUrl(req);
    const robots = `# www.robotstxt.org
# Allow all crawlers on canonical domain
User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header("Content-Type", "text/plain");
    res.send(robots.trim());
  });

  // Dynamic Site Verification to support any validation process
  app.get("/google8d65cfd211e5d4d2.html", (_req, res) => {
    res.header("Content-Type", "text/html");
    res.send("google-site-verification: google8d65cfd211e5d4d2.html");
  });

  if (process.env.NODE_ENV !== "production") {
    // Vite Dev Server middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    
    // Serve static assets without auto-serving index.html
    app.use(express.static(distPath, { index: false }));
    
    // Serve dynamic parsed index.html
    app.all('*', (req, res) => {
      const baseUrl = getBaseUrl(req);
      const htmlPath = path.join(distPath, 'index.html');
      
      if (fs.existsSync(htmlPath)) {
        let html = fs.readFileSync(htmlPath, 'utf-8');
        // Dynamically replace hardcoded studio URLs with the request's actual host mapping
        html = html.replace(/https:\/\/nishkalya\.studio/g, baseUrl);
        res.send(html);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Full-stack engine running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("[Server] Error during initialization:", err);
});

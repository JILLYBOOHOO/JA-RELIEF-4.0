const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const app = express();

// Enable Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://accounts.google.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://api.qrserver.com", "https://ui-avatars.com", "https://upload.wikimedia.org", "https://maps.googleapis.com"],
      connectSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      frameSrc: ["'self'", "https://accounts.google.com"]
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable Gzip Compression
app.use(compression());

// The path to your latest Angular build output (v17)
const DIST_FOLDER = path.join(process.cwd(), 'dist/ja-relief-prod-v17');

// Serve static files with long-lived caching
app.use(express.static(DIST_FOLDER, {
  maxAge: '1y',
  index: false,
  setHeaders: (res, filePath) => {
    // Ensure CSS is served with correct MIME type
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
    if (filePath.endsWith('.js') || filePath.endsWith('.css') || filePath.endsWith('.woff2')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Support Angular client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_FOLDER, 'index.html'));
});

// Use Railway/Heroku PORT or default to 8080
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Vanguard Prod Server (v11) running on port ${PORT} with Helmet + Gzip + 1yr Cache.`);
});

const express = require('express');
const app = express();
// Rate limiting - max 10 requests per minute per user
const rateLimit = {};
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  if (!rateLimit[ip]) rateLimit[ip] = [];
  rateLimit[ip] = rateLimit[ip].filter(t => now - t < 60000);
  if (rateLimit[ip].length >= 10) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  rateLimit[ip].push(now);
  next();
});
const path = require('path');

app.use(express.static('public'));
app.use(express.json());

// ── DOWNLOAD TEST ──────────────────────────────────────────
// Sends a chunk of random bytes → browser measures speed
app.get('/download', (req, res) => {
  const SIZE = 3 * 1024 * 1024; // 3 MB chunk
  const buffer = Buffer.alloc(SIZE, 'x');
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Length', SIZE);
  res.setHeader('Cache-Control', 'no-store');
  res.end(buffer);
});

// ── UPLOAD TEST ─────────────────────────────────────────────
// Receives data from browser → browser measures speed
app.post('/upload', (req, res) => {
  let received = 0;
  req.on('data', chunk => { received += chunk.length; });
  req.on('end', () => {
    res.json({ received });
  });
});

// ── PING TEST ────────────────────────────────────────────────
app.get('/ping', (req, res) => {
  res.json({ pong: true, time: Date.now() });
});

app.listen(3000, () => console.log('Server running on port 3000'));
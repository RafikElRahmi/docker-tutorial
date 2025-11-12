const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Resource limits example',
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime(),
  });
});

// Allocate memory (be careful!)
app.get('/memory/:mb', (req, res) => {
  const mb = parseInt(req.params.mb, 10);
  const bytes = mb * 1024 * 1024;
  const buffer = Buffer.alloc(bytes);
  res.json({ message: `Allocated ${mb}MB`, size: buffer.length });
});

// CPU-intensive task
app.get('/cpu/:seconds', (req, res) => {
  const seconds = parseInt(req.params.seconds, 10);
  const end = Date.now() + seconds * 1000;
  while (Date.now() < end) {
    Math.random() * Math.random();
  }
  res.json({ message: `CPU busy for ${seconds} seconds` });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

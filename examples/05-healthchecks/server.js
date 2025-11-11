const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

let healthy = true;
let requestCount = 0;

app.get('/', (req, res) => {
  requestCount++;
  res.json({
    message: 'Health check example',
    healthy,
    requestCount,
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  if (healthy) {
    res.status(200).json({ status: 'healthy', uptime: process.uptime() });
  } else {
    res.status(503).json({ status: 'unhealthy' });
  }
});

// Endpoint to simulate failure
app.post('/fail', (req, res) => {
  healthy = false;
  res.json({ message: 'Application marked as unhealthy' });
});

// Endpoint to recover
app.post('/recover', (req, res) => {
  healthy = true;
  res.json({ message: 'Application marked as healthy' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
});

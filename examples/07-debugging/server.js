const express = require('express');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Debugging example',
    hostname: os.hostname(),
    platform: os.platform(),
    uptime: process.uptime(),
    env: {
      node_env: process.env.NODE_ENV,
      port: process.env.PORT,
    },
  });
});

app.get('/error', (req, res) => {
  console.error('Simulated error at', new Date().toISOString());
  res.status(500).json({ error: 'Something went wrong!' });
});

app.get('/slow', async (req, res) => {
  await new Promise(r => setTimeout(r, 5000));
  res.json({ message: 'Slow response' });
});

app.listen(PORT, () => {
  console.log(`Server running on ${os.hostname()}:${PORT}`);
  console.log(`Platform: ${os.platform()}`);
  console.log(`Node version: ${process.version}`);
});

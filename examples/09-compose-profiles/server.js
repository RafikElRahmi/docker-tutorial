const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Compose profiles example',
    timestamp: new Date().toISOString(),
  });
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP http_requests_total Total HTTP requests
# TYPE http_requests_total counter
http_requests_total 42
`);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

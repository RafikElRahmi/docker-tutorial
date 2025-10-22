const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: process.env.WELCOME_MESSAGE || 'Hello!',
    app_name: process.env.APP_NAME,
    app_version: process.env.APP_VERSION,
    node_env: process.env.NODE_ENV,
  });
});

app.get('/config', (req, res) => {
  res.json({
    port: PORT,
    environment: process.env.NODE_ENV,
    app_name: process.env.APP_NAME,
    build_arg: process.env.BUILD_TIMESTAMP || 'not set',
  });
});

app.listen(PORT, () => {
  console.log(`${process.env.APP_NAME} v${process.env.APP_VERSION} running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

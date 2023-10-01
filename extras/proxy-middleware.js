
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use(
  '/blocknumber',
  createProxyMiddleware({
    target: 'https://ocbc.tokenmint.eu/rpc/mumbai',
    changeOrigin: true,
  }),
);

app.listen(8080);

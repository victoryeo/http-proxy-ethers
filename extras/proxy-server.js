const http = require("http");
const httpProxy = require("http-proxy");
const express = require("express");
const { ethers } = require("ethers");

// Create an instance of the proxy server
const proxy = httpProxy.createProxyServer({})

// Handle errors
proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err);
  res.statusCode = 500;
  res.end("Proxy Error");
});

proxy.on("proxyReq", function(proxyReq, req, res, options) {
  console.log(
    `Proxy connection from ${
      req.socket.remoteAddress
    } with url: ${JSON.stringify(req.url)}`
  );
  //proxyReq.setHeader('X-Special-Proxy-Header', 'ocbc');
});

// Create a target HTTP server
const server = http.createServer((req, res) => {
  // Log the request
  console.log(`Proxying request for: ${req.url}`);
  // Proxy the request to the target server
  proxy.web(req, res, {
    changeOrigin: true,
    secure: false,
    target: "http://localhost:9008"
  //  target: "https://ocbc.tokenmint.eu/rpc/mumbai", //the target server's URL
  });
});

// Set the proxy server to listen on a specific port
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});

server.on("connect", (req, socket, head) => {
  // This is where you could find out that ethers provider will connect RPC via proxy agent
  console.log(`${JSON.stringify(req.url)}`)
  console.log(
    `Proxy connection from ${
      socket.remoteAddress
    } with headers: ${JSON.stringify(req.rawHeaders)}`
  );
});

// target server
http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
  res.end();
}).listen(9008);
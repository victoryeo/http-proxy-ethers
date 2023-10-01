const http = require("http");
const httpProxy = require("http-proxy");
const express = require("express");
const { ethers } = require("ethers");

// Create an instance of the proxy server
const proxy = httpProxy.createProxyServer();

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  // Log the request
  console.log(`Proxying request for: ${req.url}`);

  // Proxy the request to the target server
  proxy.web(req, res, {
    changeOrigin: true,
    secure: false,
    target: "https://ocbc.tokenmint.eu/rpc/mumbai", // Replace with the target server's URL
  });
});

// Handle errors
proxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err);
  res.statusCode = 500;
  res.end("Proxy Error");
});

// Set the proxy server to listen on a specific port
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});

server.on("connect", (res, socket) => {
  // This is where you could find out that ethers provider will connect RPC via proxy agent
  console.log(
    `Proxy connection from ${
      socket.remoteAddress
    } with headers: ${JSON.stringify(res.rawHeaders)}`
  );
});

// // server.get("/", (req, res) => {
// //   res.send({ message: "Hello API" });
// // });

// const app = express();

// // Define a route for your API endpoint
// app.get("/api/resource", (req, res) => {
//   const provider = new ethers.JsonRpcProvider(
//     "https://ocbc.tokenmint.eu/rpc/mumbai"
//   );

//   console.log("console provider", provider);

//   res.json({ message: "This is your API response." });
// });

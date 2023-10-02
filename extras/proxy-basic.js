const http = require('node:http');
const { createProxy } = require('proxy');

let server = http.createServer();

server = createProxy(server);

server.listen(8080, () => {
  let port = server.address().port;
  console.log('HTTP(s) proxy server listening on port %d', port);
});

server.on('connect', (res, socket) => {
  // This is where you could find out that ethers provider will connect RPC via proxy agent
  console.log(`Proxy connection from ${socket.remoteAddress} with headers: ${JSON.stringify(res.rawHeaders)}`);
});
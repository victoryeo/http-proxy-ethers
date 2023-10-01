const {
  ethers,
  JsonRpcProvider,
  FetchRequest,
  ContractFactory,
  Wallet,
} = require("ethers");
const fetch = require("cross-fetch");
const { HttpsProxyAgent } = require("https-proxy-agent");
const http = require("node:http");
const { createProxy } = require("proxy");
const express = require("express");
const StorageContract = require("../abi/Storage.json");

const API_GW_ETH_RPC = "https://ocbc.tokenmint.eu/rpc/mumbai";

const HTTP_PROXY_PORT = 3128;
const HTTP_PROXY_HOST = "localhost";
const HTTP_PROXY = `https://ocbc.tokenmint.eu:443`;

const getUrl = async (req, _signal) => {
  let signal;

  if (_signal) {
    const controller = new AbortController();
    signal = controller.signal;
    _signal.addListener(() => {
      controller.abort();
    });
  }

  const init = {
    method: req.method,
    headers: req.headers,
    body: req.body || undefined,
    signal,
  };

  // This is what we want
  init.agent = new HttpsProxyAgent(HTTP_PROXY);

  // Inherited from https://github.com/ethers-io/ethers.js/blob/main/src.ts/utils/geturl-browser.ts
  const resp = await fetch(req.url, init);

  const headers = {};
  resp.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const respBody = await resp.arrayBuffer();
  const body = respBody == null ? null : new Uint8Array(respBody);

  return {
    statusCode: resp.status,
    statusMessage: resp.statusText,
    headers,
    body,
  };
};

FetchRequest.registerGetUrl(getUrl);
const provider = new JsonRpcProvider(API_GW_ETH_RPC);

const sleep = (sec) => new Promise((r) => setTimeout(r, sec * 1000));

// Sleep until proxy server is booted up
sleep(2).then(() => provider.getBlockNumber().then(console.log));

/**
 * (Optional) Define new http proxy server (like squid)
 */
let server = http.createServer(async (req, res) => {
  console.log("console inside /deploy");
  const provider = new JsonRpcProvider(API_GW_ETH_RPC);
  console.log("console provider", provider);
  const wallet = new Wallet(
    "0e895bd8dcb30ef51bfb93338fc19dc482dc8efadf7d1a979c1be5f70e9b96b7",
    provider
  );
  const factory = new ContractFactory(
    StorageContract.abi,
    StorageContract.bytecode,
    wallet
  );
  console.log("console factory", factory);

  const contract = await factory.deploy({ gasPrice: "1550000000" });

  console.log("console address", contract.address);
  const tx = await contract.deployTransaction;
  console.log("console tx", tx);

  // res.json({ message: "This is your API response." });
});

server = createProxy(server);

server.listen(3128, () => {
  var port = server.address().port;
  console.log("HTTP(s) proxy server listening on port %d", port);
});

server.on("connect", (res, socket) => {
  // This is where you could find out that ethers provider will connect RPC via proxy agent
  console.log(
    `Proxy connection from ${
      socket.remoteAddress
    } with headers: ${JSON.stringify(res.rawHeaders)}`
  );
});

const app = express();

// Define a route for your API endpoint
app.get("/deploy", async (req, res) => {
  console.log("console inside /deploy");
  const provider = new JsonRpcProvider(API_GW_ETH_RPC);
  console.log("console provider", provider);
  const wallet = new Wallet(
    "0e895bd8dcb30ef51bfb93338fc19dc482dc8efadf7d1a979c1be5f70e9b96b7",
    provider
  );
  const factory = new ContractFactory(
    StorageContract.abi,
    StorageContract.bytecode,
    wallet
  );

  const contract = await factory.deploy(deployArgs);

  console.log(contract.address);
  console.log(await contract.deployTransaction);

  res.json({ message: "This is your API response." });
});

const express = require("express");
const { HttpsProxyAgent } = require("https-proxy-agent");
const {
  JsonRpcProvider,
  FetchRequest,
  ContractFactory,
  Wallet,
} = require("ethers");
const fetch = require('cross-fetch');
const { SocksProxyAgent } = require('socks-proxy-agent');
const tunnel = require('tunnel');
const StorageContract = require("./abi/Storage.json");
const http = require('http');

const ETH_RPC = "https://ocbc.tokenmint.eu/rpc/mumbai";
// Tor browser user agent
const torBrowserAgent = 'Mozilla/5.0 (Windows NT 10.0; rv:91.0) Gecko/20100101 Firefox/91.0';
// Default tor port for Tor Browser
const torPort = 9150;

const HTTP_PROXY_PORT = 8082;
const HTTP_PROXY_HOST = "localhost";
const HTTP_PROXY = `http://${HTTP_PROXY_HOST}:${HTTP_PROXY_PORT}`;
console.log("console HTTP_PROXY", HTTP_PROXY);

const sleep = (sec) => new Promise((r) => setTimeout(r, sec * 1000));

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

  // This is what we want, use HTTP PROXY
  init.agent = new HttpsProxyAgent(HTTP_PROXY);

  // Inherited from https://github.com/ethers-io/ethers.js/blob/main/src.ts/utils/geturl-browser.ts
  const resp = await fetch(req.url, init);

  const headers = {};
  resp.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });

  const respBody = await resp.arrayBuffer();
  const body = (respBody == null) ? null: new Uint8Array(respBody);

  return {
    statusCode: resp.status,
    statusMessage: resp.statusText,
    headers,
    body,
  };
};

FetchRequest.registerGetUrl(getUrl);
//const provider = new JsonRpcProvider(ETH_RPC);
//sleep(2).then(() => provider.getBlockNumber().then(console.log));

/*
const fetchReq = new FetchRequest(ETH_RPC);
fetchReq.agent = new HttpsProxyAgent(HTTP_PROXY);
const provider = new JsonRpcProvider(fetchReq);
provider.getBlockNumber().then(console.log) */

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req, res) => {
  console.log("http ver", req.httpVersion);
  res.send("Hello, World!\n");
});

app.get("/blocknumber", async (req, res) => {
  
  const provider = new JsonRpcProvider(
    ETH_RPC, 80001 //chainID
  );
  console.log("console provider", provider)
  const fees = await provider.getFeeData();
  console.log("console fees", fees);
  const [ blockNumber, getBlock ] = await Promise.all([
    provider.getBlockNumber(),
    provider.getBlock('latest')
  ]);  
  console.log("Block number", blockNumber);
  console.log(getBlock);
  res.json({ blockNumber: blockNumber });
})

app.post("/google", async (req, res) => {
  
  console.log("request body", req.body)

  let options = {
    host: HTTP_PROXY_HOST,
    port: 8082,
    path: "http://www.google.com",
    headers: {
      Host: "www.google.com"
    }
  };
  let result;
  http.get(options, (msg) => {
    console.log(msg.httpVersion);
    result = msg.httpVersion
    res.json({ message: result })
  });
})

app.get("/deploy", async (req, res) => {
  try {
    console.log("console inside /deploy");
    const provider = new JsonRpcProvider(ETH_RPC);
    //console.log("console provider", await provider.getBlockNumber());
    const wallet = new Wallet(
      "0e895bd8dcb30ef51bfb93338fc19dc482dc8efadf7d1a979c1be5f70e9b96b7",
      provider
    );
    const factory = new ContractFactory(
      StorageContract.abi,
      StorageContract.bytecode,
      wallet
    );

    const contract = await factory.deploy();

    console.log("console contract", contract.target);
    await contract.deployTransaction;

    res.json({ contract_address: contract.target });
  } catch (err) {
    console.log("console err", err);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.on("connection", (socket) => {
  console.log(
    `Proxy connection from ${
      socket.remoteAddress
    } with headers: ${JSON.stringify(res.rawHeaders)}`
  );
});

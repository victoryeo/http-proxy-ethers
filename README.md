## problem
ethersjs v6.7 does not support http proxy, we want to add http agent for fetch to support proxy  
  
see:
https://github.com/ethers-io/ethers.js/pull/4337#issuecomment-1712444903

## fix
run a http proxy server  
run an localhost app server  
call localhost app server endpoint,   
it will forward to http proxy that calls target server to deploy a smart contract

#### steps
node extras/proxy-basic.js  
node app-server.js  
curl -X GET http://localhost:3000/blocknumber    
curl -X GET http://localhost:3000/deploy  
curl -X POST http://localhost:3000/google

## idea
run a http proxy server  
run an localhost app server  
calls localhost app server endpoint,   
it will forward to http proxy that calls target server to deploy a smart contract

#### steps
node extras/proxy-basic.js  
node app-server.js  
curl -X GET http://localhost:3000/blocknumber    
curl -X GET http://localhost:3000/deploy  
curl -X POST http://localhost:3000/google

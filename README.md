## idea
run a http proxy server  
run an localhost app server 
calls localhost app server endpoint, it will forward to http proxy that calls target server to deploy a smart contract

#### steps
node extras/proxy-server.js  
node server.js  
curl -X GET http://localhost:3000/deploy  


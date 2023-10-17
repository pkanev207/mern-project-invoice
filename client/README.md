# Nginx

Reverse proxy is a web server that sits in front of other web servers  

In .env we shall add websocket configuration to allow for hot reloading
because the current version of react scripts fails to hot reload
whe we are using reverse proxy in development mode:  
WDS_SOCKET_PORT=0

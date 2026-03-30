const http = require('http');
const app = require('./app');
const { initWebSocket } = require('./websocket/socketserver');
const { removeDeadNodes } = require('./services/nodeservice');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initWebSocket(server);

// check every 5 sec
setInterval(() => {
    removeDeadNodes();
}, 5000);

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
const WebSocket = require('ws');

let wss;

function initWebSocket(server) {
    wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log("Client connected");

        ws.send(JSON.stringify({ message: "Connected to log server" }));

        ws.on('close', () => {
            console.log("Client disconnected");
        });
    });
}

function broadcastLog(message) {
    if (!wss) return;

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ log: message }));
        }
    });
}

module.exports = { initWebSocket, broadcastLog };
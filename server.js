const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        if (data.type === 'register') {
            clients[data.username] = ws;
        } else if (data.type === 'message') {
            const recipient = clients[data.receiver];
            if (recipient) {
                recipient.send(JSON.stringify({
                    sender: data.sender,
                    message: data.message
                }));
            }
        }
    });
});

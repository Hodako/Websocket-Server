const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Map();

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'login':
                clients.set(data.username, ws);
                break;
            case 'message':
                const receiverWs = clients.get(data.receiver);
                if (receiverWs) {
                    receiverWs.send(JSON.stringify({
                        type: 'message',
                        sender: data.sender,
                        message: data.message
                    }));
                }
                break;
            case 'offer':
            case 'answer':
            case 'candidate':
                const peerWs = clients.get(data.peer);
                if (peerWs) {
                    peerWs.send(JSON.stringify(data));
                }
                break;
            default:
                break;
        }
    });

    ws.on('close', () => {
        for (let [username, clientWs] of clients.entries()) {
            if (clientWs === ws) {
                clients.delete(username);
                break;
            }
        }
    });
});

console.log('WebSocket server is running on ws://localhost:8080');

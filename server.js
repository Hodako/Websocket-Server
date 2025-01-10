const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let clients = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        
        switch (data.type) {
            case 'login':
                clients[data.name] = ws;
                ws.name = data.name;
                break;
            case 'call':
                if (clients[data.target]) {
                    clients[data.target].send(JSON.stringify({
                        type: 'call',
                        name: data.name,
                        offer: data.offer
                    }));
                }
                break;
            case 'answer':
                if (clients[data.target]) {
                    clients[data.target].send(JSON.stringify({
                        type: 'answer',
                        answer: data.answer
                    }));
                }
                break;
            case 'candidate':
                if (clients[data.target]) {
                    clients[data.target].send(JSON.stringify({
                        type: 'candidate',
                        candidate: data.candidate
                    }));
                }
                break;
        }
    });

    ws.on('close', () => {
        delete clients[ws.name];
    });
});

server.listen(8080, () => {
    console.log('WebSocket server is listening on port 8080');
});

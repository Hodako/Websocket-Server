const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const PORT = 8080;
const server = new WebSocket.Server({ port: PORT });

console.log(`WebSocket server is running on ws://localhost:${PORT}`);

// Store connected clients: { username: WebSocket }
const clients = new Map();

// Broadcast function
function broadcastMessage(data, sender) {
  clients.forEach((ws, username) => {
    if (username !== sender) {
      ws.send(JSON.stringify(data));
    }
  });
}

server.on("connection", (ws) => {
  let currentUser = null;

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "register": {
          // User registers with a username
          const { username } = data;
          if (!username || clients.has(username)) {
            ws.send(JSON.stringify({ type: "error", message: "Username taken or invalid." }));
            return;
          }

          currentUser = username;
          clients.set(username, ws);

          console.log(`${username} connected`);
          ws.send(JSON.stringify({ type: "success", message: "Registered successfully." }));
          break;
        }

        case "message": {
          // Text messages between users
          const { to, content } = data;
          if (!to || !clients.has(to)) {
            ws.send(JSON.stringify({ type: "error", message: "User not found." }));
            return;
          }

          const targetWs = clients.get(to);
          targetWs.send(JSON.stringify({ type: "message", from: currentUser, content }));
          break;
        }

        case "webrtc-offer": {
          // Forward WebRTC offer to the recipient
          const { to, offer } = data;
          if (!to || !clients.has(to)) {
            ws.send(JSON.stringify({ type: "error", message: "User not found." }));
            return;
          }

          const targetWs = clients.get(to);
          targetWs.send(JSON.stringify({ type: "webrtc-offer", from: currentUser, offer }));
          break;
        }

        case "webrtc-answer": {
          // Forward WebRTC answer to the recipient
          const { to, answer } = data;
          if (!to || !clients.has(to)) {
            ws.send(JSON.stringify({ type: "error", message: "User not found." }));
            return;
          }

          const targetWs = clients.get(to);
          targetWs.send(JSON.stringify({ type: "webrtc-answer", from: currentUser, answer }));
          break;
        }

        case "ice-candidate": {
          // Forward ICE candidate to the recipient
          const { to, candidate } = data;
          if (!to || !clients.has(to)) {
            ws.send(JSON.stringify({ type: "error", message: "User not found." }));
            return;
          }

          const targetWs = clients.get(to);
          targetWs.send(JSON.stringify({ type: "ice-candidate", from: currentUser, candidate }));
          break;
        }

        default:
          ws.send(JSON.stringify({ type: "error", message: "Unknown message type." }));
      }
    } catch (error) {
      console.error("Error handling message:", error);
      ws.send(JSON.stringify({ type: "error", message: "Invalid message format." }));
    }
  });

  ws.on("close", () => {
    if (currentUser) {
      console.log(`${currentUser} disconnected`);
      clients.delete(currentUser);
    }
  });
});

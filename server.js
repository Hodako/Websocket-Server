
const WebSocket = require("ws");
const mysql = require("mysql");

// MySQL connection
const db = mysql.createConnection({
  host: "sql.freedb.tech",
  port: 3306,
  user: "freedb_azizul",
  password: "PX*22DY7$mh2mTy",
  database: "freedb_ko_database",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database");
});

// WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

const users = {}; // Store users and their WebSocket connections

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "login") {
      users[data.username] = ws;
      ws.username = data.username;
      ws.send(JSON.stringify({ type: "login", success: true }));
    } else if (data.type === "message") {
      const recipient = users[data.to];
      if (recipient) {
        recipient.send(
          JSON.stringify({
            type: "message",
            from: ws.username,
            message: data.message,
          })
        );
      } else {
        ws.send(JSON.stringify({ type: "error", message: "User not found" }));
      }
    }
  });

  ws.on("close", () => {
    if (ws.username) {
      delete users[ws.username];
    }
  });
});

console.log("WebSocket server is running on ws://localhost:8080");

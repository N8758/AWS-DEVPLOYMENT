const http = require("http");
const app = require("./app");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const { initializeSocket } = require("./socket");

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

initializeSocket(io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
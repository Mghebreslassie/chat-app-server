const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.static("public"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/", (req, res) => {
  res.sendFile("index.html");
});
let messages = [];
io.on("connection", (socket) => {
  console.log(socket.id);
  socket.on("join_room", (data) => {
    socket.join(data.roomName);
    io.in(data.roomName).emit("recieve_message", messages);
  });
  socket.on("send_message", (data) => {
    messages.push(data);
    console.log(data);
    io.in(data.roomName).emit("recieve_message", messages);
  });
  socket.on("disconnect", () => {
    console.log("user has left chat");
    messages = [];
    try {
      socket.disconnect();
      socket.removeAllListeners();
      socket = null;
    } catch {}
  });
});
server.listen(PORT, () => {
  console.log("live on port ", PORT);
});

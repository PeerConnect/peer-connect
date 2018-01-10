const express = require("express");
const path = require("path");
const socket = require("socket.io");

// App setup
const PORT = 8080;
const app = express();
const server = app.listen(PORT, () =>
  console.log(`App listening on port ${PORT}...`)
);

// Serve static files
app.use(express.static(path.join(__dirname, "/")));

// Allow for cross origin resource sharing
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Sockets setup
const io = socket(server);
// Store list of all clients actively using app
const activeClients = {};
// number of clients, number of intiators
let numClients = 0
let numInitiators = 0

io.on("connection", socket => {
  console.log(`socket connection started. ID: ${socket.id}`);
  activeClients[socket.id] = {data: socket, initiator: false};
  numClients++
  io.sockets.emit('peer_count', { numClients, numInitiators })
  console.log(`numClients: ${numClients}`)

  socket.on("disconnect", () => {
    console.log(`disconnecting ${socket.id}`);
    if (activeClients[socket.id].initiator) numInitiators--
    delete activeClients[socket.id]
    numClients--
    console.log(`numClients: ${numClients}`)
  });

  socket.on('now_initiator', (message) => {
    id = message.id
    numInitiators++
    activeClients[id].initiator = true
  })

  // on receiving a message, broadcast it to every socket
  socket.on("WRTC_msg", message => {
    io.sockets.emit("messaged", {message: message});
  });
});

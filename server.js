const express = require("express");
const path = require("path");
const socket = require("socket.io");
// const Peer = require("simple-peer");
// const wrtc = require("wrtc");

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
const activeClients = [];
let numClients;

io.on("connection", socket => {
  console.log(`socket connection started. ID: ${socket.id}`);
  activeClients.push(socket);
  console.log(`activeClients: ${activeClients}`);

  socket.on("disconnect", () => {
    console.log(`disconnecting ${socket.id}`);
    activeClients.splice(activeClients.indexOf(socket.id), 1);
    console.log(`activeClients: ${activeClients}`);
  });

  socket.on("create", () => {
    console.log("socket.on CREATE");
    // keep track of how many clients are active
    numClients = activeClients.length;

    // create new peer
    // const p = new Peer({
    //   initiator: numClients === 1 ? true : false,
    //   wrtc: wrtc
    // });

    if (numClients === 1) {
      // if client is first to connect
      socket.emit("created", numClients);
    } else {
      // socket.emit("new_peer", numClients, socket.id);
      io.sockets.emit("new_peer", { peer: socket.id });
    }

    // on receiving a message, broadcast it to every socket
    socket.on("message", message => {
      // log the message on the console
      console.log("Client said:", message);
      activeClients[1].emit("message", message);
    });
  });
});

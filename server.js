const express = require("express");
const path = require("path");
const socket = require("socket.io");

// App setup
const PORT = process.env.PORT || 8080;
const app = express();
const server = app.listen(PORT, () =>
  console.log(`App listening on port ${PORT}...`)
);

// test

// PeerConnect configuration
const peerConfig = require('./peer-config.js');

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
const clients = [];
// number of clients, number of intiators
let numClients = 0
let numInitiators = 0

// server socket
io.on("connection", socket => {
  console.log(`socket connection started. ID: ${socket.id}`);

  activeClients[socket.id] = {
    initiator: false,
    offer: null,
    answer: null,
    sendingData: false,
  };

  numClients++
  // create base initiator if no avaliable initiator
  console.log('OUR INIT: ', numInitiators);
  if (numInitiators < peerConfig.threshold) {
    socket.emit('create_base_initiator', peerConfig)
  }
  // initiators avaliable, create receiver
  // if (numInitiators >= peerConfig.threshold) {
  else {
    // iterate through activeClients to find initiator avaliable initiator and make that initiator unavaliable (initiator key set to false). Update numInitiators and emit to receiver and send initiator data
    for (let id in activeClients) {
      if (activeClients[id].initiator) {
        const initiatorData = {
          offer: activeClients[id].offer,
          peerId: id
        }
        activeClients[id].initiator = false
        numInitiators--
        socket.emit('create_receiver_peer', initiatorData, peerConfig)
        break;
      }
    }
  }

  // Initiator sent offer object to server. Store offer object to the client's respective object inside activeClients. Set this client to an initiator and update numInitiators count.
  socket.on('offer_to_server', message => {
    numInitiators++
    activeClients[socket.id].initiator = true
    activeClients[socket.id].offer = message.offer
    console.log(`numClients, numInitiators: ${numClients}, ${numInitiators}`)
  })

  // Receiver sent answer object to server. Send this answer object to the specific initiator that provided the offer object to the receiver.
  socket.on('answer_to_server', message => {
    socket.to(message.peerId).emit('answer_to_initiator', message.answer)
  })

  // if diconnected user was an initiator, update accordingly with numClients as well
  socket.on("disconnect", () => {
    console.log(`disconnecting ${socket.id}`);
    if (activeClients[socket.id].initiator) numInitiators--
    delete activeClients[socket.id]
    numClients--
    console.log(`numClients, numInitiators: ${numClients}, ${numInitiators}`)
  });
});

const express = require("express");
const path = require("path");
const socket = require("socket.io");

// App setup
const PORT = process.env.PORT || 8080;
const app = express();
const server = app.listen(PORT, () =>
  console.log(`App listening on port ${PORT}...`)
);

// PeerConnect configuration
const peerConfig = {
  // how many peers must be connected before loading assets from peers
  // if threshold = 3, fourth client will load from peers
  threshold: 1,
  // asset types to load from peers
  assetTypes: ['jpg'],
  // load images above the fold from server if foldLoading: true
  foldLoading: true
};

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

function PeerConnect(config, server) {
  // DEFAULT CONFIGURABLES
  this.configuration = {
    threshold: config.threshold || 1,
    assetTypes: config.assetTypes || ['jpg', 'jpeg'],
    foldLoading: config.foldLoading || true,
  };

  // NON-CONFIGURABLES
  // Sockets setup
  this.io = socket(server);
  // Store list of all clients actively using app
  this.activeClients = {};
  // number of clients, number of intiators
  this.numClients = 0
  this.numInitiators = 0

  // server socket
  io.on("connection", socket => {
    console.log(`socket connection started. ID: ${socket.id}`);

    this.activeClients[socket.id] = {
      initiator: false,
      offer: null,
      answer: null,
      sendingData: false,
    };

    this.numClients++
    // create base initiator if no avaliable initiator
    console.log('OUR INIT: ', this.numInitiators);
    if (this.numInitiators < this.configuration.threshold) {
      socket.emit('create_base_initiator', config)
    }
    // initiators avaliable, create receiver
    // if (this.numInitiators >= this.threshold) {
    else {
      // iterate through this.activeClients to find initiator avaliable initiator and make that initiator unavaliable (initiator key set to false). Update this.numInitiators and emit to receiver and send initiator data
      for (let id in this.activeClients) {
        if (this.activeClients[id].initiator) {
          const initiatorData = {
            offer: this.activeClients[id].offer,
            peerId: id
          }
          this.activeClients[id].initiator = false
          this.numInitiators--
          socket.emit('create_receiver_peer', initiatorData, config)
          break;
        }
      }
    }

    // Initiator sent offer object to server. Store offer object to the client's respective object inside this.activeClients. Set this client to an initiator and update this.numInitiators count.
    socket.on('offer_to_server', message => {
      this.numInitiators++
      this.activeClients[socket.id].initiator = true
      this.activeClients[socket.id].offer = message.offer
      console.log(`this.numClients, this.numInitiators: ${this.numClients}, ${this.numInitiators}`)
    })

    // Receiver sent answer object to server. Send this answer object to the specific initiator that provided the offer object to the receiver.
    socket.on('answer_to_server', message => {
      socket.to(message.peerId).emit('answer_to_initiator', message.answer)
    })

    // if diconnected user was an initiator, update accordingly with this.numClients as well
    socket.on("disconnect", () => {
      console.log(`disconnecting ${socket.id}`);
      if (this.activeClients[socket.id].initiator) this.numInitiators--
      delete this.activeClients[socket.id]
      this.numClients--
      console.log(`this.numClients, this.numInitiators: ${this.numClients}, ${this.numInitiators}`)
    });
  });
}

PeerConnect(peerConfig, server);

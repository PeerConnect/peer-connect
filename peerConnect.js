const socket = require("socket.io");
const fetch = require("node-fetch");

function PeerConnect(config, server) {
  // DEFAULT CONFIGURABLES
  this.threshold = config.threshold || 1;
  this.assetTypes = config.assetTypes || ['jpg', 'jpeg'];
  this.foldLoading = config.foldLoading !== false; // default true
  this.geolocate = config.geolocate; // defaults to undefined

  // NON-CONFIGURABLES
  // Sockets setup
  this.io = socket(server);
  // Store list of all clients actively using app
  this.activeClients = {};
  // number of clients, number of intiators
  this.serverStats = {
    numClients: 0,
    numInitiators: 0
  };
  this.pingTime;

  // server socket
  this.io.on("connection", socket => {
    console.log(`socket connection started. ID: ${socket.id}`);
    this.serverStats.numClients+=1;
    this.activeClients[socket.id] = {
      initiator: false,
      offer: null,
      location: null
    };

    // creation of peers handled here
    if (this.geolocate) {
      // cip is the client's ip address
      // if localhost use static ip
      this.staticIP = '45.59.229.42';
      this.cip = socket.client.request.headers['x-forwarded-for'] || socket.client.conn.remoteAddress;
      if (this.cip[0] === ':') this.cip = this.staticIP;
      // fetch request to IP API to determine location (longitude, latitude)
      // save location to activeClients
      fetch(`http://freegeoip.net/json/${cip}`)
      .then(res => res.json())
      .then(json => {
        const location = {
          lgn: json.longitude,
          lat: json.latitude,
          city: json.city,
          zipCode: json.zip_code,
          regionCode: json.region_code,
          country: json.country_code
        };
        this.activeClients[socket.id].location = location;
        // create base initiator if no avaliable initiator
        // initiators avaliable, create receiver
        if (this.serverStats.numInitiators < this.threshold) {
          createBaseInitiator(socket, config);
        } else {
          createReceiverPeer(socket, this.activeClients, config, this.serverStats);
        }
      })
      .catch(err => {
        // if API fetch fails, turn of geolocate and create new initiator
        console.log(err);
        config.geolocate = false;
        createBaseInitiator(socket, config)
      })
    } else {
      if (this.serverStats.numInitiators < this.threshold) {
        createBaseInitiator(socket, config);
      } else {
        createReceiverPeer(socket, this.activeClients, config, this.serverStats);
      }
    }
    // Initiator sent offer object to server. Store offer object to the client's respective object inside this.activeClients. Set this client to an initiator and update this.numInitiators count.
    socket.on('offer_to_server', message => {
      pingTime = new Date()
      socket.emit('speed_ping_client')
      this.serverStats.numInitiators+=1;
      this.activeClients[socket.id].initiator = true;
      this.activeClients[socket.id].offer = message.offer;
      console.log(`numClients, numInitiators: ${this.serverStats.numClients}, ${this.serverStats.numInitiators}`);
    });

    socket.on('speed_ping_answer', () => {
      const currTime = new Date()
      console.log(currTime, pingTime)
      console.log(currTime - pingTime)
    })
    // Receiver sent answer object to server. Send this answer object to the specific initiator that provided the offer object to the receiver.
    socket.on('answer_to_server', message => {
      socket.to(message.peerId).emit('answer_to_initiator', message.answer, this.activeClients[socket.id].location);
    });
    // if diconnected user was an initiator, update accordingly with this.numClients as well
    socket.on("disconnect", () => {
      console.log(`disconnecting ${socket.id}`);
      if (this.activeClients[socket.id].initiator) {
        this.serverStats.numInitiators-=1;
      };
      delete this.activeClients[socket.id];
      this.serverStats.numClients-=1;
      console.log(`numClients, numInitiators: ${this.serverStats.numClients}, ${this.serverStats.numInitiators}`);
    });
    socket.on('error', err => console.log(err));
  });
};

// create initiators after ip geolocation api call
function createBaseInitiator(socket, config) {
  socket.emit('create_base_initiator', config.assetTypes, config.foldLoading);
};
function createReceiverPeer(socket, activeClients, config, serverStats) {
  // checks if geolocate config is on
  if (config.geolocate) {
    // current client's location
    const clientLocation = activeClients[socket.id].location;
    // placeholder for the closest peer
    const closestPeer = {
      id: '',
      distance: Infinity
    };
    // iterate through this.activeClients to find closest initiator avaliable
    // make that initiator unavaliable (initiator key set to false).
    let tempLocation = null;
    let tempDistance = 0;
    for (let id in activeClients) {
      if (activeClients[id].initiator) {
        tempLocation = activeClients[id].location;
        tempDistance = distance(clientLocation.lat, clientLocation.lgn, tempLocation.lat, tempLocation.lgn);
        if (tempDistance <= closestPeer.distance) {
          closestPeer.id = id;
          closestPeer.distance = tempDistance;
        };
      };
    };
    const selectedInitiator = activeClients[closestPeer.id];
    const initiatorData = {
      offer: selectedInitiator.offer,
      peerId: closestPeer.id,
      location: selectedInitiator.location
    };
    this.activeClients[closestPeer.id].initiator = false;
    // Updates this.numInitiators and emit to receiver and send initiator data
    serverStats.numInitiators-=1;
    socket.emit('create_receiver_peer', initiatorData, config.assetTypes, config.foldLoading);
  } else {
    // loops through activeClients and randomly finds avaliable initiator
    const intiatorsArr = [];
    for (let id in activeClients) {
      if (activeClients[id].initiator) intiatorsArr.push(id);
    }
    const selectedInitiatorId = intiatorsArr[Math.floor(Math.random()*intiatorsArr.length)];
    const initiatorData = {
      offer: activeClients[selectedInitiatorId].offer,
      peerId: selectedInitiatorId
    };
    activeClients[selectedInitiatorId].initiator = false;
    // Updates this.numInitiators and emit to receiver and send initiator data
    serverStats.numInitiators-=1;
    socket.emit('create_receiver_peer', initiatorData, config.assetTypes, config.foldLoading);
  };
};

// function to calculate distance using two sets of coordindates
// source: https://www.geodatasource.com/developers/javascript
function distance(lat1, lon1, lat2, lon2) {
	const radlat1 = Math.PI * lat1/180;
	const radlat2 = Math.PI * lat2/180;
	const theta = lon1-lon2;
	const radtheta = Math.PI * theta/180;
	let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist);
	dist = dist * 180/Math.PI;
	dist = dist * 60 * 1.1515;
	return dist;
};

module.exports = PeerConnect;

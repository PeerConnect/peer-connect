/* eslint no-use-before-define: ["error", { "functions": false }] */

const socket = require('socket.io');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const appDir = path.dirname(require.main.filename);

/**
* Peer Connect object
* @constructor
* @param {object} server - Put your server in here.
* @param {object} app - Put your app in here.
* @param {object} peerConfig - The config object.
*/
function PeerConnectServer(server, app, peerConfig) {
  ImageConnect(server, peerConfig);
  if (peerConfig.peerVideos) VideoConnect(app, peerConfig);
}

/**
* Function that handles images
*/
function ImageConnect(server, peerConfig) {
  /**
  * Config object defaults to true if not specified.
  */
  this.peerConfig = { ...peerConfig }; // eslint rules: parameters should be immutable
  this.peerConfig.threshold = this.peerConfig.threshold || 1;
  this.peerConfig.foldloading = this.peerConfig.foldLoading !== false;
  this.peerConfig.geolocate = this.peerConfig.geolocate !== false;
  this.peerConfig.peerVideos = this.peerConfig.peerVideos !== false;
  this.peerConfig.peerImages = this.peerConfig.peerImages !== false;

  const imageTypes = ['jpeg', 'jpg', 'png', 'gif'];

  /** Filter out the excluded assetTypes */
  this.peerConfig.excludeFormats = this.peerConfig.excludeFormats
    .map(str => str.toLowerCase());

  if (!this.peerConfig.peerImages) {
    this.peerConfig.assetTypes = [];
  } else {
    this.peerConfig.assetTypes = imageTypes
      .filter(type => !this.peerConfig.excludeFormats.includes(type));
  }

  /** NON-CONFIGURABLES - Sockets setup */
  this.io = socket(server);
  /** Stores list of all clients actively using app */
  this.activeClients = {};
  /** Information that signaling server holds */
  this.serverStats = {
    numClients: 0,
    numInitiators: 0,
    hasHeights: false,
    imageHeights: [],
  };

  /** Socket.io - 'connection' triggers on client connection */
  this.io.on('connection', (client) => {
    // console.log(`socket connection started. ID: ${client.id}`);
    this.serverStats.numClients += 1;
    this.activeClients[client.id] = {
      id: client.id,
      initiator: false,
      offer: null,
      location: null,
    };

    /** Fs loop for torrents */
    if (this.peerConfig.peerVideos) {
      fs.readdir(appDir + `${peerConfig.torrentRoute.slice(1)}/torrent`, (err, files) => {
        if (err) {
          console.log(err);
        }
        files.forEach(file => {
          client.emit('torrent', `${file}`)
        });
      });
    } else {
      client.emit('load_server_video');
    }

    /** Creation of peers handled here */
    if (this.peerConfig.geolocate && this.peerConfig.peerImages) {

      /** Uses staticIP if localhost uses static ip */
      this.staticIP = '45.59.229.42';
      /** cip is the client's ip address */
      this.cip = client.client.request.headers['x-forwarded-for'] || client.client.conn.remoteAddress;
      if (this.cip[0] === ':') this.cip = this.staticIP;

      /**
      * Fetch request to IP API to determine location (longitude, latitude)
      * Saves location to activeClients
      */
      fetch(`http://freegeoip.net/json/${this.cip}`)
        .then(res => res.json())
        .then((json) => {
          const location = {
            lgn: json.longitude,
            lat: json.latitude,
            city: json.city,
            zipCode: json.zip_code,
            regionCode: json.region_code,
            country: json.country_code,
          };
          this.activeClients[client.id].location = location;

          /**
          * Creates a base initiator if there is no avaliable initiator
          * If initiators are available, create receiver peer
          */
          if (this.serverStats.numInitiators < this.peerConfig.threshold) {
            createBaseInitiator(client, this.peerConfig);
          } else {
            createReceiver(client, this.activeClients, this.peerConfig, this.serverStats);
          }
        })
        .catch((err) => {
        /** if API fetch fails, turn off geolocate and create a new initiator */
          console.log(err);
          createBaseInitiator(client, this.peerConfig);
        });
    } else {
      /** If geolocate is off */
      if (this.serverStats.numInitiators < this.peerConfig.threshold || !this.peerConfig.peerImages) {
        createBaseInitiator(client, this.peerConfig);
      }
      else if (this.serverStats.numInitiators >= this.peerConfig.threshold) {
        createReceiver(client, this.activeClients, this.peerConfig, this.serverStats);
      }
    }

    /**
    * Initiator sent offer object to server.
    * Store offer object to the client's respective object inside this.activeClients.
    * Set this client to an initiator and update this.numInitiators count.
    */
    client.on('offer_to_server', (message, imageHeights, hasHeights) => {
      this.serverStats.numInitiators += 1;
      this.activeClients[client.id].initiator = true;
      this.activeClients[client.id].offer = message.offer;
      if (imageHeights && !this.serverStats.hasHeights) {
        this.serverStats.imageHeights = imageHeights;
        this.serverStats.hasHeights = hasHeights;
      }
      console.log(`numClients, numInitiators: ${this.serverStats.numClients}, ${this.serverStats.numInitiators}`);
    });

    /**
    * Receiver sent answer object to server.
    * Send this answer object to the specific initiator that
    * provided the offer object to the receiver.
    */
    client.on('answer_to_server', (message, imageSliceIndex) => {
      client.to(message.peerId).emit('answer_to_initiator', message.answer, this.activeClients[client.id].location, imageSliceIndex);
    });

    /**
    * If the diconnected client was an initiator,
    * update accordingly with this.numClients as well
    */
    client.on('disconnect', () => {
      console.log(`disconnecting ${client.id}`);
      if (this.activeClients[client.id].initiator) {
        this.serverStats.numInitiators -= 1;
      }
      delete this.activeClients[client.id];
      this.serverStats.numClients -= 1;
      console.log(`numClients, numInitiators: ${this.serverStats.numClients}, ${this.serverStats.numInitiators}`);
    });
    client.on('error', err => console.log(err));
  });
}

/** Creates initiators after ip geolocation api call
* @param {object} client - Socket client
* @param {object} peerConfig - Config preset by user
*/
function createBaseInitiator(client, peerConfig) {
  client.emit('create_base_initiator', peerConfig.assetTypes, peerConfig.foldLoading, this.serverStats.hasHeights);
}

/** Creates receiver peers after ip geolocation api call
* @param {object} client - Socket client
* @param {object} activeClients - list of active clients to connect to
* @param {object} peerConfig - Config preset by user
* @param {object} serverStats - Information object held by server to update
*/
function createReceiver(client, activeClients, peerConfig, serverStats) {
  this.serverStats = serverStats;
  this.activeClients = activeClients;
  /** checks if geolocate peerConfig is on */
  if (peerConfig.geolocate) {
    /** current client's location */
    const clientLocation = this.activeClients[client.id].location;
    /** placeholder for the closest peer */
    const closestPeer = {
      id: '',
      distance: Infinity,
    };

    let tempLocation = null;
    let tempDistance = 0;
    /**
    * Iterate through this.activeClients to find closest initiator avaliable
    * make that initiator unavaliable (initiator key set to false).
    */
    Object.values(this.activeClients).forEach((clientObj) => {
      if (clientObj.initiator) {
        tempLocation = this.activeClients[clientObj.id].location;
        tempDistance = distance(
          clientLocation.lat,
          clientLocation.lgn,
          tempLocation.lat,
          tempLocation.lgn,
        );
        if (tempDistance <= closestPeer.distance) {
          closestPeer.id = clientObj.id;
          closestPeer.distance = tempDistance;
        }
      }
    });
    const selectedInitiator = this.activeClients[closestPeer.id];
    const initiatorData = {
      offer: selectedInitiator.offer,
      peerId: closestPeer.id,
      location: selectedInitiator.location,
    };
    this.activeClients[closestPeer.id].initiator = false;
    /** Updates this.numInitiators and emit to receiver and send initiator data */
    this.serverStats.numInitiators -= 1;
    client.emit('create_receiver_peer', initiatorData, peerConfig.assetTypes, peerConfig.foldLoading, this.serverStats.imageHeights);
  } else {
    /** loops through activeClients and randomly finds avaliable initiator */
    const initiatorsArr = [];
    Object.values(this.activeClients).forEach((clientObj) => {
      if (clientObj.initiator) initiatorsArr.push(clientObj.id);
    });
    const selectedInitiatorId = initiatorsArr[Math.floor(Math.random() * initiatorsArr.length)];
    const initiatorData = {
      offer: this.activeClients[selectedInitiatorId].offer,
      peerId: selectedInitiatorId,
    };
    this.activeClients[selectedInitiatorId].initiator = false;
    /** Updates this.numInitiators and emit to receiver and send initiator data */
    this.serverStats.numInitiators -= 1;
    client.emit('create_receiver_peer', initiatorData, peerConfig.assetTypes, peerConfig.foldLoading);
  }
}

/**
* Function to calculate distance using two sets of coordindates
* Source: https://www.geodatasource.com/developers/javascript
*/
function distance(lat1, lon1, lat2, lon2) {
  const radlat1 = Math.PI * (lat1 / 180);
  const radlat2 = Math.PI * (lat2 / 180);
  const theta = lon1 - lon2;
  const radtheta = Math.PI * (theta / 180);
  let dist = (Math.sin(radlat1) * Math.sin(radlat2));
  dist += (Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta));
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  return dist;
}

function lowerCaseConfig(arr) {
  return
}

/**
* Function that handles torrents and video files
* @constructor
* @param {object} app - app from express()
* @param {object} peerConfig - config preset by user
*/
function VideoConnect (app, peerConfig) {
  const createTorrent = require('create-torrent');
  const fs = require('fs');
  const path = require('path');

  const videoRoute = peerConfig.videoRoute;
  const torrentRoute = peerConfig.torrentRoute;
  const domainName = peerConfig.domainName;

  fs.readdir(appDir + videoRoute.slice(1), (err, files) => {
    if (err) {
      console.log(err);
    }

    /** Creates routes for each mp4 file to serve as webseeds */
    files.forEach(file => {
      app.get(`/video/${file}`, (req, res) => {
        res.sendFile(appDir + route.slice(1) + file);
      });
    });
  });


  /** If torrent folder already exists, just create routes */
  if (fs.existsSync(`${torrentRoute}/torrent`)) {
    fs.readdir(appDir + videoRoute.slice(1), (err, files) => {
      if (err) {
        console.log(err);
      }

      /** Loops through video files and create torrent routes that send torrent files */
      files.forEach(file => {
        app.get(`/torrent/${file.slice(0, -4)}.torrent`, (req, res) => {
          res.sendFile(appDir + `${torrentRoute.slice(1)}/torrent/` + `${file.slice(0, -4)}.torrent`);
        });
      });
    });
    return
  }

  /** Makes torrent directory */
  fs.mkdir(`${torrentRoute}/torrent`);

  fs.readdir(appDir + videoRoute.slice(1), (err, files) => {
    if (err) {
      console.log(err);
    }

    files.forEach(file => {
      /** THIS IS FOR ACTUAL */
      /** Creates torrents with the mp4 links as webseed */
      // createTorrent(appDir + videoRoute.slice(1) + '/' + file, { urlList: [`${domainName}/video/${file}`] }, (err, torrent) => {
      /** THIS IS FOR TEST */
      createTorrent(appDir + videoRoute.slice(1) + '/' + file, { urlList: [`${domainName}/${file}`] }, (err, torrent) => {
        fs.writeFile(appDir + `${torrentRoute.slice(1)}/torrent/${file.slice(0 , -4)}.torrent`, torrent, (err) => {
          if (err) {
            console.log(err)
          }
        });
      });

      /** Creates routes to serve torrent files according to name */
      app.get(`/torrent/${file.slice(0, -4)}.torrent`, (req, res) => {
        res.sendFile(appDir + `${torrentRoute.slice(1)}/torrent/` +  `${file.slice(0, -4)}.torrent`);
      });
    });
  });
}

module.exports = PeerConnectServer;

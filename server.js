const express = require("express");
const path = require("path");
const PeerConnect = require('./peerConnect.js');

// App setup
const PORT = process.env.PORT || 8080;
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

// PeerConnect configuration
const peerConfig = {
  // how many peers must be connected before loading assets from peers
  // if threshold = 3, fourth client will load from peers
  threshold: 1,
  // asset types to load from peers
  assetTypes: ['jpg', 'jpeg', 'png'],
  // load images above the fold from server if foldLoading: true
  foldLoading: true,
  // toggle geolocation for pairing peers
  geolocate: true
};

PeerConnect(peerConfig, server);

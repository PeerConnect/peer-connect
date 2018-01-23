const express = require('express');
const path = require('path');
const PeerConnect = require('./server/peerConnect.js');
const videoConnect = require('./server/videoConnect.js');

// App setup
const PORT = process.env.PORT || 8080;
const app = express();
const server = app.listen(PORT, () =>
  console.log(`App listening on port ${PORT}...`)
);

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
  //load images p2p
  peerImages: false,
  //load videos p2p
  peerVideos: false,
  // asset file formats to exclude from peers
  excludeFormats: ['gif'],
  // load images above the fold from server if foldLoading: true
  foldLoading: false,
  // toggle geolocation for pairing peers
  geolocate: true,
  // route for video assets
  videoRoute: './assets/videos',
  //where you want to create torrent files
  torrentRoute: './assets',
  //domain name
  domainName: 'https://webseed.btorrent.xyz',
};

    //begin videoConnect
videoConnect(peerConfig, app);


PeerConnect(peerConfig, server);

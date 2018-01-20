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

app.get('/torrent', (req, res) => {
  res.sendFile(path.resolve(__dirname, './assets/cityscape-chicago-ii.torrent'));
})

// PeerConnect configuration
const peerConfig = {
  // how many peers must be connected before loading assets from peers
  // if threshold = 3, fourth client will load from peers
  threshold: 1,
  // media types to share with peers
  mediaTypes: ['image', 'video', 'audio'],
  // asset file formats to exclude from peers
  excludeFormats: ['gif'],
  // load images above the fold from server if foldLoading: true
  foldLoading: false,
  // toggle geolocation for pairing peers
  geolocate: true,
};

PeerConnect(peerConfig, server);

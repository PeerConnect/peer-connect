module.exports = function (peerConfig, app) {
  const createTorrent = require('create-torrent');
  const fs = require('fs');
  const path = require('path');
  const videoRoute = peerConfig.videoRoute;
  const torrentRoute = peerConfig.torrentRoute;
  const domainName = peerConfig.domainName;


  fs.readdir(path.join(__dirname, '../', videoRoute), (err, files) => {
    if (err) {
      console.log(err);
    }

    //create routes for each mp4 file to serve as webseeds
    files.forEach(file => {
      // console.log(file);
      app.get(`/video/${file}`, (req, res) => {
        res.sendFile(path.join(__dirname, '../', route, file));
      });
    });
  });


  //if torrent folder already exists, just create routes
  if (fs.existsSync(`${torrentRoute}/torrent`)) {
    fs.readdir(path.join(__dirname,'../', videoRoute), (err, files) => {
      if (err) {
        console.log(err);
      }

      //loop through video files and create torrent routes that send torrent files
      files.forEach(file => {
        app.get(`/torrent/${file.slice(0, -4)}.torrent`, (req, res) => {
          res.sendFile(path.join(__dirname,'../', `${torrentRoute}/torrent`, `${file.slice(0, -4)}.torrent`));
        });
      });
    });
    return
  }

  //make torrent directory
  fs.mkdir(`${torrentRoute}/torrent`);

  fs.readdir(path.join(__dirname,'../', videoRoute), (err, files) => {
    if (err) {
      console.log(err);
    }

    files.forEach(file => {
      //this is for actual
      //create torrents with the mp4 links as webseed
      // createTorrent((path.join(__dirname,'../', videoRoute, file)), { urlList: [`${domainName}/video/${file}`] }, (err, torrent) => {

      //this is for test
      createTorrent((path.join(__dirname,'../', videoRoute, file)), { urlList: [`${domainName}/${file}`] }, (err, torrent) => {
        fs.writeFile(__dirname,'../' + `/assets/torrent/${file.slice(0 , -4)}.torrent`, torrent);
      });
      //create routes to serve torrent files according to name
      app.get(`/torrent/${file.slice(0, -4)}.torrent`, (req, res) => {
        res.sendFile(path.join(__dirname,'../', `${torrentRoute}/torrent`, `${file.slice(0, -4)}.torrent`));
      });
    });
  });
}

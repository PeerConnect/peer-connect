module.exports = function (peerConfig, app) {
  const createTorrent = require('create-torrent');
  const fs = require('fs');
  const path = require('path');
  const videoRoute = peerConfig.videoRoute;
  const torrentRoute = peerConfig.torrentRoute;
  const domainName = peerConfig.domainName;

  if (fs.existsSync(`${torrentRoute}/torrent`)) {
    fs.readdir(path.join(__dirname, videoRoute), (err, files) => {
      if (err) {
        console.log(err);
      }
  
      files.forEach(file => {
        app.get(`/torrent/${file.slice(0, -4)}.torrent`, (req, res) => {
          res.sendFile(path.join(__dirname, `${torrentRoute}/torrent`, `${file.slice(0, -4)}.torrent`));
        })
      })
    })
    return
  }

  fs.mkdir(`${torrentRoute}/torrent`);

  fs.readdir(path.join(__dirname, videoRoute), (err, files) => {
    if (err) {
      console.log(err);
    }

    files.forEach(file => {
      // console.log(`${process.env}/video/file`);
      //this is for actual
      // createTorrent((path.join(__dirname, videoRoute, file)), { urlList: [`${domainName}/video/${file}`] }, (err, torrent) => {

      //this is for test
      console.log(`${domainName}${file}`);
      createTorrent((path.join(__dirname, videoRoute, file)), { urlList: [`${domainName}/${file}`] }, (err, torrent) => {
        fs.writeFile(__dirname + `/assets/torrent/${file.slice(0 , -4)}.torrent`, torrent);
      })

      app.get(`/torrent/${file.slice(0, -4)}.torrent`, (req, res) => {
        res.sendFile(path.join(__dirname, `${torrentRoute}/torrent`, `${file.slice(0, -4)}.torrent`));
      })
    })
  })
}
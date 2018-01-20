module.exports = function (socket) {
  const createTorrent = require('create-torrent');
  const parseTorrent = require('parse-torrent');
  const fs = require('fs');
  const videoRoute = './assets/torrent';

  if (fs.existsSync(videoRoute)) {
    socket.emit('magnet_uri');
  }

  else {
    createTorrent(videoRoute, {urlList: ['https://webseed.btorrent.xyz/timedrift-alpine-4k-timelapse.mp4']}, (err, torrent) => {
      if (err) {
        throw err;
      }
      fs.writeFile('myVideo.torrent', torrent);
  
      socket.emit('magnet_uri');
    });
  };
}
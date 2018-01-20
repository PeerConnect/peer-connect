module.exports = function (socket) {
  const createTorrent = require('create-torrent');
  const fs = require('fs');
  const videoRoute = './assets/torrent';

  // if (fs.existsSync(videoRoute)) {
  //   socket.emit('magnet_uri');
  // }
  //mp4 route used here
  // else {
    createTorrent('./assets/videos', 
      {urlList: [//'https://webseed.btorrent.xyz/agitation-new-zealand-4k.mp4',
                 //'https://webseed.btorrent.xyz/timedrift-alpine-4k-timelapse.mp4',
                 'https://webseed.btorrent.xyz/']}, 
    (err, torrent) => {
      if (err) {
        throw err;
      }

      fs.writeFile(__dirname + '/assets/torrent/myVideos.torrent', torrent);
  
      socket.emit('magnet_uri');
    });
  // };
}
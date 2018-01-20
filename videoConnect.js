module.exports = function (peerConfig, app) {
  const createTorrent = require('create-torrent');
  const fs = require('fs');
  const path = require('path');
  const videoRoute = peerConfig.videoRoute;
  const torrentRoute = peerConfig.torrentRoute;
  const domainName = peerConfig.domainName;

  if (fs.existsSync(`${torrentRoute}/torrent`)) return
  //   socket.emit('magnet_uri');
  // }
  //mp4 route used here
  // else {
    fs.mkdir(`${torrentRoute}/torrent`);

    fs.readdir(path.join(__dirname, videoRoute), (err, files) => {
      if (err) {
        console.log(err);
      }
  
      files.forEach(file => {
        // console.log(`${process.env}/video/file`);
        createTorrent((path.join(__dirname, videoRoute, file)), { urlList: [`${domainName}/video/file`] }, (err, torrent) => {
          fs.writeFile(__dirname + `/assets/torrent/${file.slice(0 , -4)}.torrent`, torrent);
        })

        app.get(`/torrent/${file.slice(0, -4)}`, (req, res) => {
          res.sendFile(path.join(__dirname, `${torrentRoute}/torrent`, `${file.slice(0, -4)}.torrent`));
        })
      })
    })




    // createTorrent('./assets/videos', 
    //   {urlList: [//'https://webseed.btorrent.xyz/agitation-new-zealand-4k.mp4',
    //              //'https://webseed.btorrent.xyz/timedrift-alpine-4k-timelapse.mp4',
    //              'https://webseed.btorrent.xyz/']}, 
    // (err, torrent) => {
    //   if (err) {
    //     throw err;
    //   }

    //   fs.writeFile(__dirname + '/assets/torrent/myVideos.torrent', torrent);
  
    //   socket.emit('magnet_uri');
    // });
  // };
}
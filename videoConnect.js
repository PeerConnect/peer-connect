module.exports = function (socket) {
  const createTorrent = require('create-torrent');
  const parseTorrent = require('parse-torrent');
  const fs = require('fs');

  const videoRoute = './assets/video';

  createTorrent(videoRoute, (err, torrent) => {
    if (err) {
      throw err;
    }

    const tor = parseTorrent(torrent);

    tor.files.forEach((file, idx) => {
      const hash = tor.infoHash;
      const filename = tor.files[idx].name;
      const trackers = tor.announce.map((tracker) => {
        return `tr=${tracker}`;
      }).join('&');
      // const magnetURI = `magnet:?xt=urn:btih:${hash}&dn=${filename}&${trackers}`;
      const magnetURI = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';

      socket.emit('magnet_uri', magnetURI);
    });
  });

  // const files = fs.readdirSync(videoRoute);
  // const filesArray = [];
  // filesArray.push(files);

  // console.log(`*#*#*# FILES:  ${files} *#*#*#`);
  // console.log(`*#*#*# FILESARRAY:  ${filesArray} *#*#*#`);

  // filesArray.forEach(file => {
  //   const stringFile = fs.readFileSync(file, 'utf8');
  //   socket.emit('seed_file', stringFile);
  // });

};
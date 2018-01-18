var parseTorrent = require('parse-torrent')
var http = require('stream-http')
var WebTorrent = require('webtorrent')

var torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';

http.get('/torrent', function (res) {
  var data = [];

  res.on('data', function (chunk) {
    data.push(chunk);
  })

  res.on('end', function () {
    data = Buffer.concat(data) // Make one large Buffer of it

    var torrentParsed = parseTorrent(torrentId) // Parse the Buffer

    var client = new WebTorrent()

    client.add(torrentParsed, onTorrent)
  })

  function onTorrent (torrent) {
    torrent.files.forEach(function (file) {
      file.renderTo('#video');
    })
  }
})

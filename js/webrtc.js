// establish/bind wrtc peer methods
function emitters (peer) {

  peer.on("error", err => {
    console.log(`error: ${err}`);
  });

  peer.on("signal", data => {
    console.log(`signaling ${data.type}`)
    const stringified = JSON.stringify(data)
    sendWRTCMsg(stringified)
  });

  peer.on('connect', function () {
    console.log('CONNECTED')
    if (assetsDownloaded) {
      console.log('sending data')
      sendAssetsToPeer(peer)
    }
  })

  peer.on('data', function (data) {
    console.log('data: ' + data)
    // download from peer
    // have to make sure data is fully downloaded and convert to renderable data
    // then insert into DOM
    downloadAssetsFromPeer()
    convertDataToUsable()
    assetsDownloaded = true
    sendNowInitiator()
    p.destroy()
  })

  peer.on('close', function () {
    console.log('closed!')
    p = null
  })
}

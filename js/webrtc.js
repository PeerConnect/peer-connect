// establish/bind wrtc peer methods
let imageData;

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
    // downloadAssetsFromPeer()
    // convertDataToUsable()
    if (data == "FINISHED-YUY") {
      console.log("Received all data. Setting image.");      
      console.log(imageData.slice(14));
      assetsDownloaded = true;   
      document.getElementById("image1").src = "data:" + imageData.slice(14);
      p.destroy()
    } else {
      imageData += data;
      //trace("Data chunk received");
    }
    sendNowInitiator()
  })

  peer.on('close', function () {
    console.log('closed!')
    p = null
  })
}

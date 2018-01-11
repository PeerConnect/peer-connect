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
    console.log('data on peer.on is: ', data)
    console.log('data.slice is: ', data.slice(0, 12))
    // download from peer
    // have to make sure data is fully downloaded and convert to renderable data
    // then insert into DOM
    // downloadAssetsFromPeer()
    // convertDataToUsable()
    if (data.slice(0, 12) == "FINISHED-YUY") {
      console.log('data when FINISHED-YUY is: ', data)
      console.log("Received all data. Setting image.");
      // console.log('imageData is: ', imageData)
      // console.log(imageData.slice(14));
      assetsDownloaded = true;
      imageArray[data.slice(12)].src = "data:" + imageData.slice(14);

      //reset imageData after changing src attr string
      imageData = '';
      // if (data.slice(12) == `${i}`) {
      //   console.log('DESTROY!!!!')
      // }

      //destroy connection after all assets have been loaded
      // p.destroy();
    } else {
      imageData += data;
      //trace("Data chunk received");
    }
    // sendNowInitiator()
  })

  peer.on('close', function () {
    console.log('closed!')
    p = null
  })
}

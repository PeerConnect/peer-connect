// establish/bind wrtc peer methods

function listeners (peer) {

  peer.on("error", err => {
    console.log(err)
  });

  /* Signal is automatically called when a new peer is created with {initiator:true} parameter. This generates the offer object to be sent to the peer.
  Upon receiving the offer object by the receiver, invoke p.signal with the offer object as its parameter. This will generate the answer object. Do the same with the host with the answer object. */
  peer.on("signal", (data) => {
    handleOnSignal(data, peerId)
  });

  // listener for when P2P is established. Ice candidates sent first, then media data itself.
  peer.on('connect', () => {
    handleOnConnect()
  })

  // listener for when data is being received
  peer.on('data', function (data) {

    handleOnData(data)

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
    console.log('P2P closed')
    assetsDownloaded ? createInitiator() : createInitiator('base')
  })
}

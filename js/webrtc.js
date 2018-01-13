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
    handleOnConnect();
  })

  // listener for when data is being received
  peer.on('data', function (data) {
    handleOnData(data)
  })

  peer.on('close', function () {
    console.log('P2P closed')
    assetsDownloaded ? createInitiator() : createInitiator('base')
  })
}

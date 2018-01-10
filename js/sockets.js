const Peer = SimplePeer;
// indicates if client has downloaded assets from server
// and can send assets to new client connections
// track if assets have been downloaded
let assetsDownloaded = false;

let p = null;

// Establish connection
const socket = io.connect();

// front end is always notified of peer count
socket.on('peer_count', message => {
  console.log('peer count is : ', message.count)
  if (message.count === 1) {
    loadAssetsFromServer();
    assetsDownloaded = true;
    sendNowInitiator()
    return;
  }
  // create peer-initiator
  if (message.count > 1 && assetsDownloaded) {
    if (!p) {
      console.log('created initiator and offer obj')
      p = new Peer({ initiator: true, trickle: false });
      peerMethods(p)
    }
    return;
  }
  // create peer non-initiator
  if (message.count > 1 && !p){
    console.log('initiating non-initiator peer')
    p = new Peer({ initiator: false, trickle: false });
    peerMethods(p)
  }

})

socket.on('messaged', message => {
  const parsedMsg = JSON.parse(message.message)
  if (assetsDownloaded && parsedMsg.type === 'answer') {
    console.log('received answer obj')
    p.signal(parsedMsg)
    return;
  }
  if (!assetsDownloaded && parsedMsg.type === 'offer') {
    console.log('received offer obj')
    p.signal(parsedMsg)
    return;
  }
})

// sends a message back to the singaling server
function sendWRTCMsg(message) {
  socket.emit("WRTCMsg", message);
}

function sendNowInitiator() {
  socket.emit('nowInitiator', {id: socket.id})
}

// establish/bind wrtc peer methods
function peerMethods (peer) {

  peer.on("error", err => {
    console.log(`error: ${err}`);
  });

  peer.on("signal", data => {
    console.log(`signaling ${data.type}`)
    let stringified = JSON.stringify(data)
    // console.log(`SIGNAL: ${stringified}`);
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
    // have to make sure data is fully downloaded
    assetsDownloaded = true
    sendNowInitiator()
    p.destroy()
  })

  peer.on('close', function () {
    console.log('closed!')
    p = null
  })
}

function sendAssetsToPeer(peer) {
  let test = new Promise((resolve, reject) => {
    peer.send('this is the data being sent!')
    resolve('message sent!')
  })
  test.then(msg => {
    console.log(msg)
  })
}

function downloadAssetsFromPeer() {
  console.log("LOAD ASSETS FROM PEER");
}

// download assets from server
function loadAssetsFromServer() {
  console.log("LOAD ASSETS FROM SERVER");
  // query DOM for test images
  const image1 = document.getElementById("image1");
  const image2 = document.getElementById("image2");
  const image3 = document.getElementById("image3");

  // if new client is the first on the page
  // and has not downloaded assets yet
  image1.setAttribute("src", "../assets/image1.jpg");
  image2.setAttribute("src", "../assets/image2.png");
  image3.setAttribute("src", "../assets/image3.jpg");
}

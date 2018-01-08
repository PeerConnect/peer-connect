const Peer = SimplePeer;
// indicates if client has downloaded assets from server
// and can send assets to new client connections
// track if assets have been downloaded
let assetsDownloaded = false;

let p = null;

// Establish connection
const socket = io.connect();

// client has loaded page
socket.emit("create");

// front end is always notified of peer count
socket.on('peer_count', message => {
  console.log('peer count is : ', message.count)
  if (message.count === 1) {
    loadAssetsFromServer();
    assetsDownloaded = true;
    return;
  }
  // initiate peer initator
  if (message.count > 1 && assetsDownloaded && !p) {
    console.log('initiating initiator and sending offer')
    p = new Peer({ initiator: true, trickle: false });
    peerMethods(p)
    return;
  }
  // initiate peer non-initator
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

// establish/bind wrtc peer methods
function peerMethods (peer) {
  peer.on("error", err => {
    console.log(`error: ${err}`);
  });

  peer.on("signal", data => {
    console.log('signaling')
    let stringified = JSON.stringify(data)
    console.log(`SIGNAL: ${stringified}`);
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
  })
}

function sendAssetsToPeer(peer) {
  peer.send('hello there this is cool')
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
  assetsDownloaded = true
}

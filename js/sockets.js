const Peer = SimplePeer;
// indicates if client has downloaded assets from server
// and can send assets to new client connections
let initiator;

// track if assets have been downloaded
let assetsDownloaded = false;

// Establish connection
const socket = io.connect();

// client has loaded page
socket.emit("create");

// when first peer socket has been opend
socket.on("created", numClients => {
  console.log(`socket.on CREATED:  ${numClients}`);
  // created client can initiate downloads to other clients
  initiator = true;
  loadAssetsFromServer();
});

// download assets from server
function loadAssetsFromServer() {
  console.log("LOAD ASSETS FROM SERVER");
  // query DOM for test images
  const image1 = document.getElementById("image1");
  const image2 = document.getElementById("image2");
  const image3 = document.getElementById("image3");

  // if new client is the first on the page
  // and has not downloaded assets yet
  if (initiator && !assetsDownloaded) {
    image1.setAttribute("src", "../assets/image1.jpg");
    image2.setAttribute("src", "../assets/image2.png");
    image3.setAttribute("src", "../assets/image3.jpg");
    assetsDownloaded = true;
  }
}

// // when new peer socket has been opend
socket.on("new_peer", data => {
  // const localConn = new RTCPeerConnection();
  // const remoteConn = new RTCPeerConnection();
  console.log(`NEW PEER JOINED. assetsDownloaded: ${assetsDownloaded}`);
  // localConn
  //   .createOffer()
  //   .then(offer =>
  //     localConn.setLocalDescription(new RTCSessionDescription(offer))
  //   )
  //   .then(() => remoteConn.setRemoteDescription(localConn.localDescription))
  //   .then(() => remoteConn.createAnswer())
  //   .then(answer =>
  //     remoteConn.setLocalDescription(new RTCSessionDescription(answer))
  //   )
  //   .then(() => localConn.setRemoteDescription(remoteConn.localDescription));

  // const configuration = {
  //   iceServers: [{ url: "stun:stun.l.google.com:19302" }]
  // };
  const p = new Peer({ initiator: assetsDownloaded, trickle: false });
  p.on("error", err => {
    console.log(`error: ${err}`);
  });

  p.on("signal", data => {
    console.log(`SIGNAL: ${JSON.stringify(data)}`);
    sendMessage(JSON.stringify(data));
  });
});

socket.on("message", message => {
  console.log(`message:  ${message}`);
  p.signal(JSON.parse(message));
});

// sends a message back to the singaling server
function sendMessage(message) {
  socket.emit("message", message);
}

function downloadAssetsFromPeer() {
  console.log("LOAD ASSETS FROM PEER");
}

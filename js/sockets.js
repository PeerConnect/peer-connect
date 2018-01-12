const Peer = SimplePeer;
const peerMethods = listeners;


// placeholder for webrtc peer
// track if assets have been downloaded, determines if peer can be an initiator
// peerID is the the socket.id of the initiator that the receiver gets so the server can send back the answer object directly to the specific initiator
// candidates is an array of the ice candidates to send to the peer once P2P connection is established
let p = null;
let assetsDownloaded = false;
let peerId = '';
let candidates = [];

// global variables for data parsing/transfer
let imageData;
let counter = 0;
// get img tag nodes
imageArray = document.getElementsByTagName('img');


// Establish connection
const socket = io.connect();

// server is empty or assets downloaded so create initiator
socket.on('create_base_initiator', () => {
  // download assets from server, create initiator peer
  // tell server assets were downloaded and send answer object to server (this happens when new peer is created with initiator key true)
  createInitiator(true)
})
// Create receiver peer; server determined that this peer can be a receiver and sent a stored offer object from an avaliable initiator
socket.on('create_receiver_peer', message => {
  console.log('creating receiver peer')
  p = new Peer({ initiator: false, trickle: true })
  peerMethods(p)
  // peerId is the socket id of the avaliable initiator that this peer will pair with
  peerId = message.peerId
  p.signal(message.offer)
})

// answer object has arrived to the initiator. Connection will when the signal(message) is invoked.
socket.on('answer_to_initiator', message => {
  console.log('answer_to_initiator')
  // this final signal where initiator receives the answer does not call handleOnSignal/.on('signal'), it goes handleOnConnect.
  p.signal(message)
})

// handles all signals
function handleOnSignal(data) {
  // send offer object to server for server to store
  if (data.type === 'offer') {
    console.log('Emitting offer_to_server.')
    socket.emit('offer_to_server', { offer: data })
  }
  // send answer object to server for server to send to avaliable initiator
  if (data.type === 'answer') {
    console.log('Emitting answer_to_server.')
    socket.emit('answer_to_server', { answer: data, peerId: peerId })
  }
  // After the offer/answer object is generated, ice candidates are generated as well. These are stored to be sent after the P2P connection is established.
  if (data.candidate) {
    candidates.push(data)
  }
}

// handles when peers are connected through P2P
function handleOnConnect() {
  console.log('CONNECTED')
  // send ice candidates if exist
  if (candidates.length) {
    p.send(JSON.stringify(candidates))
    candidates = []
  }
  // send assets if initiator
  if (assetsDownloaded) {
    sendAssetsToPeer(p)
  }
}

// handles when data is being received
function handleOnData(data) {
  // check if receiving ice candidate
  if (data.slice(0, 1).toString() === '[') {
    const receivedCandidates = JSON.parse(data)
    receivedCandidates.forEach(ele => {
      p.signal(ele)
    })
    console.log('Received all ice candidates.')
    return;
  }
  if (data.slice(0, 12) == "FINISHED-YUY") {
    counter++;
    console.log("Received all data. Setting image.");
    assetsDownloaded = true;
    imageArray[data.slice(12)].src = "data:" + imageData.slice(14);
    imageData = '';
    if (counter === imageArray.length) {
      console.log('DESTROYING PEERS');
      p.destroy();
    }
  } else {
    imageData += data;
  }
}

// Creates an initiator (therefore emitting a signal that creates an offer). The base parameter determines if initiator should download assets from server (example: there are no other initiators connected or client's peer got disconnected).
function createInitiator(base) {
  if (base) {
    loadAssetsFromServer();
    assetsDownloaded = true
  }
  p = new Peer({ initiator: true, trickle: false });
  peerMethods(p)
}

// data chunking/parsing
function sendAssetsToPeer(peer) {
  for (let i = 0; i < imageArray.length; i += 1) {
    let data = getImgData(imageArray[i]);
    let delay = 1;
    let charSlice = 20000;
    let terminator = "\n";
    let dataSent = 0;
    let intervalID = 0;
    intervalID = setInterval(function () {
      let slideEndIndex = dataSent + charSlice;
      if (slideEndIndex > data.length) {
        slideEndIndex = data.length;
      }
      peer.send(data.slice(dataSent, slideEndIndex));
      dataSent = slideEndIndex;
      if (dataSent + 1 >= data.length) {
        console.log("All data chunks sent.");
        peer.send(`FINISHED-YUY${i}`);
        clearInterval(intervalID);
        console.log('Finished send.')
      }
    }, delay);

    console.log('message sent')
  }
}

function getImgData() {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  let img = document.getElementById('image1');
  context.canvas.width = img.width;
  context.canvas.height = img.height;
  context.drawImage(img, 0, 0, img.width, img.height);
  // let myData = context.getImageData(0, 0, img.width, img.height);
  return canvas.toDataURL();
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

function getImgData(image) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  // let img = document.getElementById('image1');
  let img = image;
  console.log('img is: ', image);
  context.canvas.width = img.width;
  context.canvas.height = img.height;
  context.drawImage(img, 0, 0, img.width, img.height);
  // let myData = context.getImageData(0, 0, img.width, img.height);

  return canvas.toDataURL();
}

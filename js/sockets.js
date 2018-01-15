const Peer = SimplePeer;
const peerMethods = listeners;

// peer configuration object from server
let configuration = {};

// placeholder for webrtc peer and socket
// track if assets have been downloaded, determines if peer can be an initiator
// peerID is the the socket.id of the initiator that the receiver gets so the server can send back the answer object directly to the specific initiator
// candidates is an array of the ice candidates to send to the peer once P2P connection is established
// socket placeholder is for when page is opened on mobile.
// if no placeholder, browser logs reference error to socket.
let socket = {on: () => {}}
let p = null;
let assetsDownloaded = false;
let peerId = '';
let candidates = [];

// global variables for data parsing/transfer and lazy image loading
let imageData;
let counter = 0;
let extCounter = 0;

//used to time the asset load time
const browserOpenTime = new Date();
let currentTime = new Date();
let peersConnectedTime;
let dataReceivedTime;
let connectionDestroyedTime;

function reportTime(time, currentOrTotal, domId) {
  time = new Date();
  document.getElementById(domId).innerHTML += `${time - currentOrTotal} ms  `;
  currentTime = new Date();
}
// get img tag nodes
let imageArray = document.getElementsByTagName('img');

// checks if broswer is opened from mobile
const isMobile = checkForMobile()
console.log('Am I on mobile?: ', isMobile)

// Establish connection if not mobile
// if mobile load from server and don't create a socket connection
isMobile ? loadAssetsFromServer() : socket = io.connect()

// server is empty or assets downloaded so create initiator
socket.on('create_base_initiator', (assetTypes, foldLoading) => {
  // save peer configuration object to front end for host
  configuration.assetTypes = assetTypes;
  configuration.foldLoading = foldLoading;
  // download assets from server, create initiator peer
  // tell server assets were downloaded and send answer object to server (this happens when new peer is created with initiator key true)
  createInitiator(true)
})
// Create receiver peer; server determined that this peer can be a receiver and sent a stored offer object from an avaliable initiator
socket.on('create_receiver_peer', (initiatorData, assetTypes, foldLoading) => {
  console.log('creating receiver peer')
  // save peer configuration object to front end for peer
  configuration.assetTypes = assetTypes;
  configuration.foldLoading = foldLoading;
  p = new Peer({
    initiator: false,
    trickle: false,
    reconnectTimer: 100
  })
  peerMethods(p)
  p.signal(initiatorData.offer)
  loopImg();
  // peerId is the socket id of the avaliable initiator that this peer will pair with
  peerId = initiatorData.peerId
  // location data of peer to render on page for demo
  if (initiatorData.location) {
    const location = initiatorData.location
    document.getElementById('peer_info').innerHTML +=
    `<br>* Received data from ${location.city}, ${location.regionCode}, ${location.country} ${location.zipCode};`;
  }
})

// answer object has arrived to the initiator. Connection will when the signal(message) is invoked.
socket.on('answer_to_initiator', (message, peerLocation) => {
  console.log('answer_to_initiator')
  // this final signal where initiator receives the answer does not call handleOnSignal/.on('signal'), it goes handleOnConnect.
  p.signal(message)

  // location data of peer to render on page for demo
  if (peerLocation) {
    document.getElementById('peer_info').innerHTML +=
    `<br>* Sent data to ${peerLocation.city}, ${peerLocation.regionCode}, ${peerLocation.country} ${peerLocation.zipCode};`;
  }
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
  reportTime(peersConnectedTime, currentTime, 'time_to_connect');
  // send ice candidates if exist
  if (candidates.length) {
    console.log(`Sending ${candidates.length} ice candidates.`)
    p.send(JSON.stringify(candidates))
    candidates = []
  }
  // send assets if initiator (uncomment this if trickle off for receiver)
  if (assetsDownloaded) {
    sendAssetsToPeer(p)
  }
}

let foldCounter = 0;
let otherCounter = 0;

function loopImg() {
  let returnFunc = function() {
    console.log('this is firing!')

    if (otherCounter >= 1) return;
    for (let i = 0; i < imageArray.length; i += 1) {
      const imageSrc = imageArray[i].dataset.src;
      const regex = /(?:\.([^.]+))?$/;
      const extension = regex.exec(imageSrc)[1];
      const foldLoading = configuration.foldLoading ? isElementInViewport(imageArray[i]) : false;

      console.log('!configuration.assetTypes.includes(extension): ', !configuration.assetTypes.includes(extension));
      console.log('foldLoading: ', foldLoading);

      if (!configuration.assetTypes.includes(extension)) {
        extCounter++;
        document.querySelector(`[data-src='${imageSrc}']`).setAttribute('src', `${imageSrc}`);
      }
      if (foldLoading) {
        foldCounter++;
        document.querySelector(`[data-src='${imageSrc}']`).setAttribute('src', `${imageSrc}`);
      }
      otherCounter++;
    }
  }
  console.log(otherCounter);
  return returnFunc();
}



let imageHeight;
// handles when data is being received
function handleOnData(data) {
  // check if receiving ice candidate
  if (data.toString().slice(0, 1) === '[') {
    const receivedCandidates = JSON.parse(data)
    receivedCandidates.forEach(ele => {
      console.log('got candidate')
      p.signal(ele)
    })
    console.log('Received all ice candidates.')
    // // send assets if initiator
    // // uncomment this if receiver trickle on
    // if (assetsDownloaded) {
    //   sendAssetsToPeer(p)
    // }
    return;
  }

  if (data.toString().slice(0,7) === 'test123') {
    imageHeight = JSON.parse(data.toString().slice(7));
    imageHeight.forEach((element, idx) => {
      imageArray[idx].style.height = element + 'px';
    })
    return;
  }
  loopImg();
  // let blob = new Blob( [ data ], { type: "image/png" } );
  // console.log('DATA: ', new TextDecoder("utf-8").decode(data));
  // console.log('DATA: ', imageData);
  if (data.toString().slice(0, 12) == "FINISHED-YUY") {
    counter++;
    console.log("Received all data for an image. Setting image.");
    reportTime(dataReceivedTime, currentTime, 'time_to_receive');
    if (!isElementInViewport(imageArray[data.slice(12)])) {

      if (imageData.slice(0, 9) === 'undefined') imageArray[data.slice(12)].src = imageData.slice(9);
      else imageArray[data.slice(12)].src = imageData


      const newImage = imageArray[data.slice(12)].dataset.src;
      imageArray[data.slice(12)].onerror = imageNotFound(newImage);
    }
    imageData = '';
    if (counter + extCounter === imageArray.length) {
      console.log('All assets downloaded!');
      assetsDownloaded = true;
      console.log('DESTROYING PEERS');
      reportTime(connectionDestroyedTime, currentTime, 'time_to_destroy');
      reportTime(connectionDestroyedTime, browserOpenTime, 'time_total');
      p.destroy()
      document.getElementById('downloaded_from').innerHTML = 'Assets downloaded from: PEER!!!';
    }
  } else {
    imageData += data.toString();
  }
}

// Creates an initiator (therefore emitting a signal that creates an offer). The base parameter determines if initiator should download assets from server (example: there are no other initiators connected or client's peer got disconnected).
function createInitiator(base) {
  if (base) {
    loadAssetsFromServer();
    assetsDownloaded = true
  }
  p = new Peer({
    initiator: true,
    trickle: false,
    reconnectTimer: 100
  });
  peerMethods(p)
}

// data chunking/parsing
function sendAssetsToPeer(peer) {
  let array = [];
  for (let f = 0; f < imageArray.length; f++) {
    array.push(imageArray[f].height);
  }
  peer.send('test123' + JSON.stringify(array));


  for (let i = 0; i < imageArray.length; i += 1) {
    const imageSrc = imageArray[i].dataset.src;
    const regex = /(?:\.([^.]+))?$/;
    const extension = regex.exec(imageSrc)[1];
    console.log(`#*#*#*#*# sendAssetsToPeer CONFIGURATION.foldLoading:  ${configuration.foldLoading} #*#*#*#*#`);
    if (configuration.assetTypes.includes(extension)) {
      let data = getImgData(imageArray[i]);
      let CHUNK_SIZE = 64000;
      let n = data.length / CHUNK_SIZE;

      for (let f = 0; f < n; f++) {

        let start = f * CHUNK_SIZE;
        let end = (f + 1) * CHUNK_SIZE;
        peer.send(data.slice(start, end))
      }
      if (data.length % CHUNK_SIZE) {
        peer.send(data.slice(n * CHUNK_SIZE))
      }
      // console.log("All data chunks sent.");
      peer.send(`FINISHED-YUY${i}`);
    }
    console.log('message sent')
  }
}

// download assets from server
function loadAssetsFromServer() {
  console.log("LOAD ASSETS FROM SERVER");

  for (let i = 0; i < imageArray.length; i += 1) {
    const imageSrc = imageArray[i].dataset.src;
    document.querySelector(`[data-src='${imageSrc}']`).setAttribute('src', `${imageSrc}`);
  }

  document.getElementById('downloaded_from').innerHTML = ' Assets downloaded from: SERVER!!!';
}

function getImgData(image) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  // let img = document.getElementById('image1');
  let img = image;
  context.canvas.width = img.width;
  context.canvas.height = img.height;
  context.drawImage(img, 0, 0, img.width, img.height);
  // let myData = context.getImageData(0, 0, img.width, img.height);
  return canvas.toDataURL();
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function imageNotFound(imageSrc) {
  console.log('this is not working!');
  // document.querySelector(`[data-src='${imageSrc}']`).setAttribute('src', `${imageSrc}`);
}

function checkForMobile() {
  testExp = new RegExp('Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile', 'i');
  return testExp.test(navigator.userAgent) ? true : false;
};

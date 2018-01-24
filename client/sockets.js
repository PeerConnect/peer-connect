/* eslint-env browser */
/* eslint no-use-before-define: ["error", { "functions": false }] */

const Peer = require('simple-peer');
const parseTorrent = require('parse-torrent');
const http = require('stream-http');
const WebTorrent = require('webtorrent');

const peerMethods = function (peer) {
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
};

// peer configuration object from server
const configuration = {};

// placeholder for webrtc peer and socket
// socket placeholder is for when page is opened on mobile.
// if no placeholder, browser logs reference error to socket.
let socket = { on: () => { } };
let p = null;
// track if assets have been downloaded, determines if peer can be an initiator
let assetsDownloaded = false;
// peerID is the the socket.id of the initiator.
let peerId = '';
// candidates is an array of the ice candidates to send once p2p is established
let candidates = [];

let connectionFlag = false;
// global variables for data parsing/transfer and fold image loading
let imageData;
let counter = 0;
let extCounter = 0;
let otherCounter = 0;

// get img tag nodes
let imageArray = Object.values(document.getElementsByTagName('img'));
imageArray = imageArray.filter(node => node.hasAttribute('data-src'));
let imageHeights;
let imageSliceIndex;
// assign ids to image
imageArray.forEach((image, index) => image.setAttribute('id', index));

//get video tag nodes
let videoArray = Object.values(document.getElementsByTagName('video'));
videoArray = videoArray.filter(node => node.hasAttribute('data-src'));

// checks if broswer is opened from mobile
const isMobile = checkForMobile();
const browserSupport = !!RTCPeerConnection;

// if webrtc not supported, load from server
if (!browserSupport) {
  loadAssetsFromServer();
} else {
  socket = io.connect();
}

// server is empty or assets downloaded so create initiator
socket.on('create_base_initiator', (assetTypes, foldLoading, hasHeights) => {
  // save peer configuration object to front end for host
  configuration.assetTypes = assetTypes;
  configuration.foldLoading = foldLoading;
  demoFunctions.assetsFromServer();
  // download assets from server, create initiator peer
  // tell server assets were downloaded and send answer object to server
  // (this happens when new peer is created with initiator key true)
  if (assetTypes.length === 0) {
    loadAssetsFromServer();
    return
  }
  createInitiator(true, hasHeights);
});
// Create receiver peer; server determined that this peer can be a receiver and
// sent a stored offer object from an avaliable initiator
socket.on('create_receiver_peer', (initiatorData, assetTypes, foldLoading, imageHeights) => {
  console.log('creating receiver peer');
  // checks if none of the asset types are to be sent through P2P
  // if none, load straight from server
  let P2PFlag = false;
  imageArray.forEach((image) => {
    for (let i = 0; i < assetTypes.length; i += 1) {
      if ((image.dataset.src).slice(-5).includes(assetTypes[i])) P2PFlag = true;
    }
  });
  if (!P2PFlag) {
    loadAssetsFromServer();
    return;
  }

  // save peer configuration object to front end for peer
  configuration.assetTypes = assetTypes;
  configuration.foldLoading = foldLoading;
  p = new Peer({
    initiator: false,
    trickle: false,
    reconnectTimer: 100,
  });
  peerMethods(p);

  //setimageheights and decide which indeces of image you need to send
  setImageHeights(imageArray, imageHeights);

  //if foldLoading is off || if foldLoading is on and image is not in view
  //send indeces of imageArray to request from initiator peer
  for (let i = 0; i < imageArray.length; i += 1) {
    if (!isElementInViewport(imageArray[i]) && configuration.foldLoading || !configuration.foldLoading) {
      imageSliceIndex = i;
      break;
    }
  }

  p.signal(initiatorData.offer);
  // peerId is the socket id of the avaliable initiator that this peer will pair with
  peerId = initiatorData.peerId;

  demoFunctions.assetsFromPeer(initiatorData);
});

// answer object has arrived to the initiator. Connection will when the signal(message) is invoked.
socket.on('answer_to_initiator', (message, peerLocation) => {
  console.log('answer_to_initiator');

  //initiator now knows where to slice array before sending to peer
  imageSliceIndex = imageSliceIndex;

  // this final signal where initiator receives the answer does not call
  // handleOnSignal/.on('signal'), it goes handleOnConnect.
  p.signal(message);

  setTimeout(checkForConnection, 3000);

  // location data of peer to render on page for demo
  document.getElementById('peer_info').style.display = '';
  if (peerLocation) {
    document.getElementById('peer_info').innerHTML +=
      `<br>* Sent data to ${peerLocation.city}, ${peerLocation.regionCode}, ${peerLocation.country} ${peerLocation.zipCode};`;
  }
  demoFunctions.sentDataToPeerLocation(peerLocation);
});

//torrent signal, start fetching torrent files
socket.on('torrent', (torrent) => {
  console.log('attempting to get torrent: ', torrent);
  http.get(`/torrent/${torrent}`, function (res) {
    const data = [];

    res.on('data', function (chunk) {
      data.push(chunk);
    });

    res.on('end', function () {
      let newData = Buffer.concat(data); // Make one large Buffer of it
      let torrentParsed = parseTorrent(newData); // Parse the Buffer
      const client = new WebTorrent();
      client.add(torrentParsed, onTorrent);
    });
    //render video files to where it was specified on data-src
    function onTorrent(torrent) {
      torrent.files.forEach(function (file) {
        file.renderTo(document.querySelector(`[data-src*='${file.name}']`));
      });
    }
  });
});

socket.on('load_server_video', () => {
  console.log('downloading videos from server');
  videoArray.forEach(element => {
    let source = element.dataset.src;
    setServerAsset(source);
  });
});

// handles all signals
function handleOnSignal(data) {
  // send offer object to server for server to store
  if (data.type === 'offer') {
    console.log('Emitting offer_to_server.');
    socket.emit('offer_to_server', { offer: data }, imageHeights);
  }
  // send answer object to server for server to send to avaliable initiator
  if (data.type === 'answer') {
    console.log('Emitting answer_to_server.');
    socket.emit('answer_to_server', { answer: data, peerId }, imageSliceIndex);
  }
  // After the offer/answer object is generated, ice candidates are generated as
  // well. These are stored to be sent after the P2P connection is established.
  if (data.candidate) {
    candidates.push(data);
  }
}

// handles when peers are connected through P2P
function handleOnConnect() {
  console.log('CONNECTED');
  connectionFlag = true;
  demoFunctions.reportTime(demoFunctions.currentTime, 'time_to_connect');
  // send ice candidates if exist
  if (candidates.length) {
    console.log(`Sending ${candidates.length} ice candidates.`);
    p.send(JSON.stringify(candidates));
    candidates = [];
  }
  // send assets if initiator (uncomment this if trickle off for receiver)
  if (assetsDownloaded) {
    sendAssetsToPeer(p, imageSliceIndex);
  }
}

function checkForConnection() {
  console.log('checking for connection')
  if (!connectionFlag) {
    p.disconnect();
  }
  connectionFlag = false;
}

// handles when data is being received
function handleOnData(data) {
  const dataString = data.toString();
  if (dataString.slice(0, 1) === '[') {
    const receivedCandidates = JSON.parse(data);
    receivedCandidates.forEach((ele) => {
      console.log('got candidate');
      p.signal(ele);
    });
    console.log('Received all ice candidates.');
    // // send assets if initiator
    // // uncomment this if receiver trickle on
    // if (assetsDownloaded) {
    //   sendAssetsToPeer(p)
    // }
    return;
  }

  loopImage();

  if (dataString.slice(0, 16) == "finished-sending") {
    let imageIndex = data.slice(16);

    // append time it took to receive image data
    demoFunctions.appendTime(imageIndex, demoFunctions.currentTime);
    demoFunctions.currentTime = new Date();
    setImage(imageData, imageArray, imageIndex);
    imageData = '';
    if (counter + extCounter === imageArray.length) {
      console.log('All assets downloaded!');
      assetsDownloaded = true;
      console.log('DESTROYING PEERS');
      demoFunctions.reportTime(demoFunctions.currentTime, 'time_to_destroy');
      demoFunctions.reportTime(demoFunctions.browserOpenTime, 'time_total');
      demoFunctions.currentTime = new Date();
      p.destroy();
      checkForImageError(imageArray);
      demoFunctions.assetsFromPeerMessage();
    }
  } else {
    imageData += dataString;
  }
}

function loopImage() {
  function returnFunc() {
    if (otherCounter >= 1) return;
    for (let i = 0; i < imageArray.length; i += 1) {
      const imageSource = imageArray[i].dataset.src;
      const extension = getImageType(imageArray[i]);
      console.log(`${isElementInViewport(imageArray[i])} is: from ${i}`);
      // const foldLoading = configuration.foldLoading ? isElementInViewport(imageArray[i]) : false;
      if (!configuration.assetTypes.includes(extension)) {
        extCounter += 1;
        setServerAsset(imageSource);
      }
      if (configuration.foldLoading && isElementInViewport(imageArray[i])) {
        setServerAsset(imageSource);
      }
    }
    otherCounter += 1;
  }
  return returnFunc();
}

function setImage(imageData, imageArray, index) {
  console.log('Received all data for an image. Setting image.');
  counter += 1;
  if (!isElementInViewport(imageArray[index]) && configuration.foldLoading || !configuration.foldLoading) {
    if (imageData.slice(0, 9) === 'undefined') imageArray[index].src = imageData.slice(9);
    else imageArray[index].src = imageData;
  }
}

// preset images with sent heights
function setImageHeights(imageArray, imageHeights) {
  imageHeights.forEach((element, idx) => {
    imageArray[idx].style.height = `${element}px`;
  });
  //what is this?
  // getBackgroundImages();
}

// Creates an initiator (therefore emitting a signal that creates an offer). The base parameter determines if initiator should download assets from server (example: there are no other initiators connected or client's peer got disconnected).
/**
 * NOT FINISHED???
 * @param {boolean} base 
 * @param {boolean} hasHeights 
 */
function createInitiator(base, hasHeights) {
  if (base) {
    loadAssetsFromServer();
    assetsDownloaded = true;
    if (!hasHeights) imageHeights = setImageHeightsToSend(imageArray);
  }
  p = new Peer({
    initiator: true,
    trickle: false,
    reconnectTimer: 100,
  });
  peerMethods(p);
}

// data chunking/parsing
/**
 * sends image assets to peer
 * @param {object} peer - Webrtc peer connection object
 * @param {integer} sliceIndex - index to slice image array
 */
function sendAssetsToPeer(peer, sliceIndex) {
  //slice Array and only send requested data
  imageArray = imageArray.slice(sliceIndex);
  //send only if requested by foldLoading
  for (let i = 0; i < imageArray.length; i += 1) {
    const imageType = getImageType(imageArray[i]);
    if (configuration.assetTypes.includes(imageType)) {
      sendImage(imageArray[i], peer, i);
    }
    // console.log('File sent.');
  }
}
/**
 * returns an array of image heights
 * @param {array} imageArray - array of DOM image nodes 
 */
function setImageHeightsToSend(imageArray) {
  return imageArray.map(imageNode => imageNode.height);
}

/**
 * get the type of image element (e.g. jpg)
 * @param {object} image - DOM image nodes
 */
function getImageType(image) {
  const imageSrc = image.dataset.src;
  const regex = /(?:\.([^.]+))?$/;
  return regex.exec(imageSrc)[1];
}

/**
 * sends image data to specified peer
 * @param {object} image - DOM image element
 * @param {object} peer - peer to send information to
 * @param {integer} imageIndex - the index of the image in the image array
 */
function sendImage(image, peer, imageIndex) {
  const data = getImageData(image);
  const CHUNK_SIZE = 64000;
  const n = data.length / CHUNK_SIZE;
  let start;
  let end;
  for (let f = 0; f < n; f += 1) {
    start = f * CHUNK_SIZE;
    end = (f + 1) * CHUNK_SIZE;
    peer.send(data.slice(start, end));
    // console.log(`File part ${f} sent.`);
  }
  // console.log('File fully sent.');
  peer.send(`finished-sending${imageIndex}`);
}

/**
 * loads all image assets from the server
 */
function loadAssetsFromServer() {
  console.log('LOAD ASSETS FROM SERVER');
  for (let i = 0; i < imageArray.length; i += 1) {
    const imageSrc = imageArray[i].dataset.src;
    setServerAsset(imageSrc);
  }
  // report time it took to load assets from server
  demoFunctions.timeTotalFromServer(demoFunctions.browserOpenTime);
}

/**
 * parses stylesheets for any images defined as background images
 * and passes style information to getImageData to generate data strings
*/
function getBackgroundImages() {
  const sheets = document.styleSheets;
  for (const i in sheets) {
    const rules = sheets[i].rules || sheets[i].cssRules;
    for (const r in rules) {
      if (rules[r].selectorText) {
        if (rules[r].cssText.includes('background:') || rules[r].cssText.includes('background-image:')) {
          const styleString = rules[r].cssText;
          const selector = styleString.substring(0, styleString.indexOf(' '));
          const propertyRegex = /background\s*(.*?)\s*;/g;
          const bgProperty = propertyRegex.exec(styleString)[0];
          const imgSrc = bgProperty.substring(bgProperty.indexOf('"') + 1, bgProperty.lastIndexOf('"'));
          if (selector !== 'body') getImageData(imgSrc, selector, bgProperty);
        }
      }
    }
  }
}

/**
 * creates new background image style with data string sent from peer
 * and adds it to the appropriate element
 * @param {string} selector - selector to receive data background image
 * @param {string} bgProperty - original background style defined in stylesheet
 * @param {string} dataUrl - dataUrl generated by getImageData for background image
*/
function setBackgroundImage(selector, bgProperty, dataUrl) {
  const newProperty = bgProperty.substring(0, bgProperty.indexOf('"') + 1) + dataUrl + bgProperty.substring(bgProperty.lastIndexOf('"'), bgProperty.indexOf(';') + 1);
  document.querySelector(selector).style = newProperty;
}

/**
 * generates data url for images to be sent to peers
 * @param {object || string} image - dom element || background asset
 * @param {string} seleector - selector to receive data background image
 * @param {string} bgProperty - original background style defined in stylesheet
*/
function getImageData(image, selector, bgProperty) {
  let canvas = document.createElement('canvas');
  let context = canvas.getContext('2d');
  let img = bgProperty ? new Image() : image;
  let type = bgProperty ? '' : getImageType(image);
  if (bgProperty) img.src = image;
  context.canvas.width = img.width;
  context.canvas.height = img.height;
  context.drawImage(img, 0, 0, img.width, img.height);
  if (bgProperty) setBackgroundImage(selector, bgProperty, canvas.toDataURL());
  return canvas.toDataURL(`image/${type}`);
}
/**
 * check to see if an image element is in view
 * @param {object} element - an image node
 */
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}
/**
 * checks to see if the end user is on mobile
 */
function checkForMobile() {
  testExp = new RegExp('Android|webOS|iPhone|iPad|BlackBerry|Windows Phone|Opera Mini|IEMobile|Mobile', 'i');
  return !!testExp.test(navigator.userAgent);
}
/**
 * goes through images and adds an onerror function to serve assets from server
 * @param {array} imageArray - an array of all the image nodes found on a document
 */
function checkForImageError(imageArray) {
  for (let i = 0; i < imageArray.length; i++) {
    let source = imageArray[i].dataset.src;
    imageArray[i].error = function () {
      setServerAsset(source);
    }
  }
}
/**
 * finds the element with the data-src and sets that as the src
 * @param {string} imageSource - the source link for image assets stored in the server
 */
function setServerAsset(imageSource) {
  document.querySelector(`[data-src='${imageSource}']`).setAttribute('src', `${imageSource}`);
}

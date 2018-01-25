/* eslint-env browser */
/* eslint no-use-before-define: ["error", { "functions": false }] */

const Peer = require('simple-peer');
const parseTorrent = require('parse-torrent');
const http = require('stream-http');
const WebTorrent = require('webtorrent');

/**
 * adds methods to peers
 * @param {object} peer - peer object
 */
function peerMethods(peer) {
  peer.on("error", err => {
    console.log(err);
  });

  /* Signal is automatically called when a new peer is created with {initiator:true} parameter. This generates the offer object to be sent to the peer.
  Upon receiving the offer object by the receiver, invoke p.signal with the offer object as its parameter. This will generate the answer object. Do the same with the host with the answer object. */
  peer.on("signal", (data) => {
    handleOnSignal(data, peerId);
  });

  // listener for when P2P is established. Ice candidates sent first, then media data itself.
  peer.on('connect', () => {
    handleOnConnect();
  })

  // listener for when data is being received
  peer.on('data', function (data) {
    handleOnData(data);
  })

  peer.on('close', function () {
    assetsDownloaded ? createInitiator() : createInitiator('base');
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
const inViewportArray = [];

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

socket.on('create_base_initiator', createBaseInitiator);
socket.on('create_receiver_peer', createReceiverPeer);
socket.on('answer_to_initiator', answerToInitiator);
socket.on('torrent', getTorrentFiles);
socket.on('load_server_video', loadVideosFromServer);

/**
 *
 * @param {array} assetTypes - image asset types for server/peer loading
 * @param {boolean} foldLoading - determines doing fold loading or not
 * @param {boolean} hasHeights - determines if signalling server has heights or not
 */
function createBaseInitiator(assetTypes, foldLoading, hasHeights) {
  // save peer configuration object to front end for host
  configuration.assetTypes = assetTypes;
  configuration.foldLoading = foldLoading;

  // download assets from server, create initiator peer
  // tell server assets were downloaded and send answer object to server
  // (this happens when new peer is created with initiator key true)
  if (assetTypes.length === 0) {
    loadAssetsFromServer();
    return
  }
  createInitiator(true, hasHeights);
}

/**
 * creates receiver peer
 * @param {object} initiatorData - information regarding initiator peer
 * @param {array} assetTypes - image asset types for server/peer loading
 * @param {boolean} foldLoading - determines doing fold loading or not
 * @param {array} imageHeights - image heights necessary for fold loading
 */
function createReceiverPeer(initiatorData, assetTypes, foldLoading, imageHeights) {
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

  for (let i = 0; i < imageArray.length; i += 1) {
    inViewportArray.push(isElementInViewport(imageArray[i]))
  }

  //if foldLoading is off || if foldLoading is on and image is not in view
  //send indeces of imageArray to request from initiator peer
  for (let i = 0; i < imageArray.length; i += 1) {
    if ((!inViewportArray[i] && configuration.foldLoading) || !configuration.foldLoading) {
      imageSliceIndex = i;
      break;
    }
  }
  p.signal(initiatorData.offer);

  // peerId is the socket id of the avaliable initiator that this peer will pair with
  peerId = initiatorData.peerId;
}

/**
 * receives answer from peer before connection
 * @param {object} message - message object that tells what kind of signal
 * @param {object} peerLocation - location information
 */
function answerToInitiator(message, peerLocation) {
  //initiator now knows where to slice array before sending to peer
  imageSliceIndex = imageSliceIndex;

  // this final signal where initiator receives the answer does not call
  // handleOnSignal/.on('signal'), it goes handleOnConnect.
  p.signal(message);
  setTimeout(checkForConnection, 3000);
}

/**
 * gets torrent file title
 * @param {string} torrent - torrent file title
 */
function getTorrentFiles(torrent) {
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
}

/**
 * loops through video array to load from server
 */
function loadVideosFromServer() {
  videoArray.forEach(element => {
    let source = element.dataset.src;
    setServerAsset(source);
  });
}

/**
 * handles signals from peers
 * @param {object} data - data object sent from peer
 */
function handleOnSignal(data) {
  // send offer object to server for server to store
  if (data.type === 'offer') {
    socket.emit('offer_to_server', { offer: data }, imageHeights);
  }

  // send answer object to server for server to send to avaliable initiator
  if (data.type === 'answer') {
    socket.emit('answer_to_server', { answer: data, peerId }, imageSliceIndex);
  }

  // After the offer/answer object is generated, ice candidates are generated as
  // well. These are stored to be sent after the P2P connection is established.
  if (data.candidate) {
    candidates.push(data);
  }
}

/**
 * handles when peers are first connected through webrtc
 */
function handleOnConnect() {
  connectionFlag = true;

  // send ice candidates if exist
  if (candidates.length) {
    p.send(JSON.stringify(candidates));
    candidates = [];
  }

  // send assets if initiator (uncomment this if trickle off for receiver)
  if (assetsDownloaded) {
    sendAssetsToPeer(p, imageSliceIndex);
  }
}

/**
 * checks for connection between peers
 */
function checkForConnection() {
  if (!connectionFlag) {
    p.disconnect();
  }
  connectionFlag = false;
}

/**
 * handles when data is received
 * @param {object} data - data object that is sent from peer
 */
function handleOnData(data) {
  const dataString = data.toString();
  if (dataString.slice(0, 1) === '[') {
    const receivedCandidates = JSON.parse(data);
    receivedCandidates.forEach((ele) => {
      p.signal(ele);
    });
    // send assets if initiator
    // uncomment this if receiver trickle on
    // if (assetsDownloaded) {
    //   sendAssetsToPeer(p)
    // }
    return;
  }

  loopImage();

  if (dataString.slice(0, 16) == "finished-sending") {
    let imageIndex = data.slice(16);
    setImage(imageData, imageArray, imageIndex);
    imageData = '';
    if (counter + extCounter === imageArray.length) {
      assetsDownloaded = true;
      p.destroy();
      checkForImageError();
    }
  } else {
    imageData += dataString;
  }
}

/**
 * loops through images to see if image should be loaded from server
 */
function loopImage() {
  function returnFunc() {
    if (otherCounter >= 1) return;
    for (let i = 0; i < imageArray.length; i += 1) {
      const imageSource = imageArray[i].dataset.src;
      const extension = getImageType(imageArray[i]);
      // console.log(`${inViewportArray[i]} is: from ${i}`);
      if (!configuration.assetTypes.includes(extension)) {
        extCounter += 1;
        setServerAsset(imageSource);
      }
      if (configuration.foldLoading && inViewportArray[i]) {
        setServerAsset(imageSource);
      }
    }
    otherCounter += 1;
  }
  return returnFunc();
}

/**
 * sets image onto DOM
 * @param {string} imageData - image data string
 * @param {array} imageArray - array of DOM image nodes
 * @param {integer} index - index of the image array
 */
function setImage(imageData, imageArray, index) {
  counter += 1;
  if ((!inViewportArray[index] && configuration.foldLoading) || !configuration.foldLoading) {
    if (imageData.slice(0, 9) === 'undefined') imageArray[index].src = imageData.slice(9);
    else imageArray[index].src = imageData;
  }
}

/**
 * preset images with heights for fold loading
 * @param {array} imageArray - array of DOM image nodes
 * @param {array} imageHeights - array of heights for images
 */
function setImageHeights(imageArray, imageHeights) {
  imageHeights.forEach((height, idx) => {
    imageArray[idx].style.height = `${height}px`;
  });
  getBackgroundImages();
}

/**
 * creates an initiator with checks to see if it has heights and is a base
 * @param {boolean} base - determines whether initiator should download from server or not
 * @param {boolean} hasHeights - determines whether initiator has necessary heights from server
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
  }
  peer.send(`finished-sending${imageIndex}`);
}

/**
 * loads all image assets from the server
 */
function loadAssetsFromServer() {
  for (let i = 0; i < imageArray.length; i += 1) {
    const imageSrc = imageArray[i].dataset.src;
    setServerAsset(imageSrc);
  }
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
function checkForImageError() {
  for (let i = 0; i < imageArray.length; i++) {
    let source = imageArray[i].dataset.src;
    imageArray[i].onerror = function () {
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

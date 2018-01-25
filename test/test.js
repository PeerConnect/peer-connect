let assert = chai.assert;
let expect = chai.expect;
// const io = require('socket.io-client');
// const should = require('should');
// const peerConnect = require('../peerConnect.js');
// const sockets = require('../js/sockets.js');

// describe('Array', () => {
//   describe('#indexOf()', () => {
//     it('should return -1 when the value is not present', () => {
//       assert.equal(-1, [1, 2, 3].indexOf(4));
//     });
//   });
// });

// const socketURL = 'http://localhost:8080';

// const options = {
//   transports: ['websocket'],
//   'force new connection': true
// };

// const serverStats = {
//   numClients: 0,
//   numInitiators: 0,
// };

// const user1 = {
//   id: 'jedOwuvvWqFwcLsZAAAA',
//   inititiator: true,
//   offer: null,
//   locatgion: null
// };

// const activeClients = {};

// describe('peerConnect()', () => {
//   it('should create an active user when client connects', (done) => {
//     const client = io.connect(socketURL, options);

//     client.emit('offer_to_server', ({ offer: data }));

//     serverStats.numClients.should.equal(1);

//     client.disconnect();
//     done();
//   });
// });


describe('load videos from server', () => {
  before(function() {
    const fixture = '<video id="video" data-src="./assets/videos/agitation-new-zealand-4k.mp4"> cool video </video>' +
                    '<video data-src="./assets/videos/yosemite-hd.mp4"></video>' +
                    '<img height="300" src="./assets/image2.png">' +
                    '<img height="250" data-src="./assets/image4.png">';
    document.body.insertAdjacentHTML(
      'afterbegin', 
      fixture);
  });

  it('expected one video data-src to be available in src', () => {
    const video = document.getElementById('video');
    setServerAsset(video.dataset.src);
    expect(video.src).to.equal('http://localhost:9876/assets/videos/agitation-new-zealand-4k.mp4');
  });

  it('expected all video src to load from server', () => {
    const videoArray = Object.values(document.getElementsByTagName('video'));
    loadVideosFromServer(videoArray);
    expect(videoArray[0].src).to.equal('http://localhost:9876/assets/videos/agitation-new-zealand-4k.mp4');
    expect(videoArray[1].src).to.equal('http://localhost:9876/assets/videos/yosemite-hd.mp4');
  });

  it('expected all images to have an onerror function', () => {
    const imageArray = Object.values(document.getElementsByTagName('img'));
    checkForImageError(imageArray);
    expect(imageArray[0].onerror).to.be.a('function');
  });

  it('expected to return false for user on mobile', () => {
    let mobile = checkForMobile();
    expect(mobile).to.be.false;
  });

  it('expected first image element to return true for viewport', () => {
    const imageArray = Object.values(document.getElementsByTagName('img'));
    let inViewport = isElementInViewport(imageArray[0]);
    expect(inViewport).to.be.true;
  });

  it('expected image src to image data to return a string', () => {
    const imageArray = Object.values(document.getElementsByTagName('img'));
    let data = getImageData(imageArray[0]);
    expect(data).to.be.a('string');
  });

  it('expected to get png image type', () => {
    const imageArray = Object.values(document.getElementsByTagName('img'));
    const type = getImageType(imageArray[1]);
    expect(type).to.equal('png');
  });
  
  it('expected to get heights of 300 for image 1, 250 for image 2', () => {
    const imageArray = Object.values(document.getElementsByTagName('img'));
    const imageHeights = setImageHeightsToSend(imageArray); 
    expect(imageHeights[0]).to.equal(300);
    expect(imageHeights[1]).to.equal(250);
  });

});
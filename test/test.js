const io = require('socket.io-client');
const should = require('should');
const peerConnect = require('../peerConnect.js');
const sockets = require('../js/sockets.js');

// describe('Array', () => {
//   describe('#indexOf()', () => {
//     it('should return -1 when the value is not present', () => {
//       assert.equal(-1, [1, 2, 3].indexOf(4));
//     });
//   });
// });

const socketURL = 'http://localhost:8080';

const options = {
  transports: ['websocket'],
  'force new connection': true
};

const serverStats = {
  numClients: 0,
  numInitiators: 0,
};

const user1 = {
  id: 'jedOwuvvWqFwcLsZAAAA',
  inititiator: true,
  offer: null,
  locatgion: null
};

const activeClients = {};

describe('peerConnect()', () => {
  it('should create an active user when client connects', (done) => {
    const client = io.connect(socketURL, options);

    client.emit('offer_to_server', ({ offer: data }));

    serverStats.numClients.should.equal(1);

    client.disconnect();
    done();
  });
});
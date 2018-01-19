const socket = require('socket.io');
const should = require('should');
const peerConnect = require('../peerConnect.js');
const socketURL = 'http://localhost:8080';

// describe('Array', () => {
//   describe('#indexOf()', () => {
//     it('should return -1 when the value is not present', () => {
//       assert.equal(-1, [1, 2, 3].indexOf(4));
//     });
//   });
// });

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

describe('Peer Connect', () => {
  it('should create an active user when client connects', (done) => {
    const client = socket();

    client.emit('connect', user1);

    client.on('connection', () => {
      serverStats.numClients += 1;
      activeClients[user1.id];
    });

    serverStats.numClients.should.equal(1);

    client.disconnect();
    done();
  });
});
require('../peerConnect.js');

const assert = require('assert');


describe('sockets.js', function () {
  describe('#createInitiator()', function () {
    it('should set assetsDownloaded to true if base is true', function () {
      createInitiator(true);
      assetsDownloaded.should.equal(true);
    });
  });
});
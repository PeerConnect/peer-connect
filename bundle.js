(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (Buffer){
var parseTorrent = require('parse-torrent')
var http = require('stream-http')
var WebTorrent = require('webtorrent')

var torrentId = 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent';

http.get('/torrent', function (res) {
  var data = [];

  res.on('data', function (chunk) {
    data.push(chunk);
  })

  res.on('end', function () {
    data = Buffer.concat(data) // Make one large Buffer of it

    var torrentParsed = parseTorrent(torrentId) // Parse the Buffer

    var client = new WebTorrent()

    client.add(torrentParsed, onTorrent)
  })

  function onTorrent (torrent) {
    torrent.files.forEach(function (file) {
      file.renderTo('#video');
    })
  }
})

}).call(this,require("buffer").Buffer)
},{"buffer":119,"parse-torrent":50,"stream-http":79,"webtorrent":101}],2:[function(require,module,exports){
var ADDR_RE = /^\[?([^\]]+)\]?:(\d+)$/ // ipv4/ipv6/hostname + port

var cache = {}

// reset cache when it gets to 100,000 elements (~ 600KB of ipv4 addresses)
// so it will not grow to consume all memory in long-running processes
var size = 0

module.exports = function addrToIPPort (addr) {
  if (size === 100000) module.exports.reset()
  if (!cache[addr]) {
    var m = ADDR_RE.exec(addr)
    if (!m) throw new Error('invalid addr: ' + addr)
    cache[addr] = [ m[1], Number(m[2]) ]
    size += 1
  }
  return cache[addr]
}

module.exports.reset = function reset () {
  cache = {}
  size = 0
}

},{}],3:[function(require,module,exports){
(function (Buffer){
const INTEGER_START = 0x69 // 'i'
const STRING_DELIM = 0x3A // ':'
const DICTIONARY_START = 0x64 // 'd'
const LIST_START = 0x6C // 'l'
const END_OF_TYPE = 0x65 // 'e'

/**
 * replaces parseInt(buffer.toString('ascii', start, end)).
 * For strings with less then ~30 charachters, this is actually a lot faster.
 *
 * @param {Buffer} data
 * @param {Number} start
 * @param {Number} end
 * @return {Number} calculated number
 */
function getIntFromBuffer (buffer, start, end) {
  var sum = 0
  var sign = 1

  for (var i = start; i < end; i++) {
    var num = buffer[i]

    if (num < 58 && num >= 48) {
      sum = sum * 10 + (num - 48)
      continue
    }

    if (i === start && num === 43) { // +
      continue
    }

    if (i === start && num === 45) { // -
      sign = -1
      continue
    }

    if (num === 46) { // .
      // its a float. break here.
      break
    }

    throw new Error('not a number: buffer[' + i + '] = ' + num)
  }

  return sum * sign
}

/**
 * Decodes bencoded data.
 *
 * @param  {Buffer} data
 * @param  {Number} start (optional)
 * @param  {Number} end (optional)
 * @param  {String} encoding (optional)
 * @return {Object|Array|Buffer|String|Number}
 */
function decode (data, start, end, encoding) {
  if (data == null || data.length === 0) {
    return null
  }

  if (typeof start !== 'number' && encoding == null) {
    encoding = start
    start = undefined
  }

  if (typeof end !== 'number' && encoding == null) {
    encoding = end
    end = undefined
  }

  decode.position = 0
  decode.encoding = encoding || null

  decode.data = !(Buffer.isBuffer(data))
    ? new Buffer(data)
    : data.slice(start, end)

  decode.bytes = decode.data.length

  return decode.next()
}

decode.bytes = 0
decode.position = 0
decode.data = null
decode.encoding = null

decode.next = function () {
  switch (decode.data[decode.position]) {
    case DICTIONARY_START:
      return decode.dictionary()
    case LIST_START:
      return decode.list()
    case INTEGER_START:
      return decode.integer()
    default:
      return decode.buffer()
  }
}

decode.find = function (chr) {
  var i = decode.position
  var c = decode.data.length
  var d = decode.data

  while (i < c) {
    if (d[i] === chr) return i
    i++
  }

  throw new Error(
    'Invalid data: Missing delimiter "' +
    String.fromCharCode(chr) + '" [0x' +
    chr.toString(16) + ']'
  )
}

decode.dictionary = function () {
  decode.position++

  var dict = {}

  while (decode.data[decode.position] !== END_OF_TYPE) {
    dict[decode.buffer()] = decode.next()
  }

  decode.position++

  return dict
}

decode.list = function () {
  decode.position++

  var lst = []

  while (decode.data[decode.position] !== END_OF_TYPE) {
    lst.push(decode.next())
  }

  decode.position++

  return lst
}

decode.integer = function () {
  var end = decode.find(END_OF_TYPE)
  var number = getIntFromBuffer(decode.data, decode.position + 1, end)

  decode.position += end + 1 - decode.position

  return number
}

decode.buffer = function () {
  var sep = decode.find(STRING_DELIM)
  var length = getIntFromBuffer(decode.data, decode.position, sep)
  var end = ++sep + length

  decode.position = end

  return decode.encoding
    ? decode.data.toString(decode.encoding, sep, end)
    : decode.data.slice(sep, end)
}

module.exports = decode

}).call(this,require("buffer").Buffer)
},{"buffer":119}],4:[function(require,module,exports){
var Buffer = require('safe-buffer').Buffer

/**
 * Encodes data in bencode.
 *
 * @param  {Buffer|Array|String|Object|Number|Boolean} data
 * @return {Buffer}
 */
function encode (data, buffer, offset) {
  var buffers = []
  var result = null

  encode._encode(buffers, data)
  result = Buffer.concat(buffers)
  encode.bytes = result.length

  if (Buffer.isBuffer(buffer)) {
    result.copy(buffer, offset)
    return buffer
  }

  return result
}

encode.bytes = -1
encode._floatConversionDetected = false

encode._encode = function (buffers, data) {
  if (Buffer.isBuffer(data)) {
    buffers.push(Buffer.from(data.length + ':'))
    buffers.push(data)
    return
  }

  if (data == null) { return }

  switch (typeof data) {
    case 'string':
      encode.buffer(buffers, data)
      break
    case 'number':
      encode.number(buffers, data)
      break
    case 'object':
      data.constructor === Array
        ? encode.list(buffers, data)
        : encode.dict(buffers, data)
      break
    case 'boolean':
      encode.number(buffers, data ? 1 : 0)
      break
  }
}

var buffE = Buffer.from('e')
var buffD = Buffer.from('d')
var buffL = Buffer.from('l')

encode.buffer = function (buffers, data) {
  buffers.push(Buffer.from(Buffer.byteLength(data) + ':' + data))
}

encode.number = function (buffers, data) {
  var maxLo = 0x80000000
  var hi = (data / maxLo) << 0
  var lo = (data % maxLo) << 0
  var val = hi * maxLo + lo

  buffers.push(Buffer.from('i' + val + 'e'))

  if (val !== data && !encode._floatConversionDetected) {
    encode._floatConversionDetected = true
    console.warn(
      'WARNING: Possible data corruption detected with value "' + data + '":',
      'Bencoding only defines support for integers, value was converted to "' + val + '"'
    )
    console.trace()
  }
}

encode.dict = function (buffers, data) {
  buffers.push(buffD)

  var j = 0
  var k
  // fix for issue #13 - sorted dicts
  var keys = Object.keys(data).sort()
  var kl = keys.length

  for (; j < kl; j++) {
    k = keys[j]
    if (data[k] == null) continue
    encode.buffer(buffers, k)
    encode._encode(buffers, data[k])
  }

  buffers.push(buffE)
}

encode.list = function (buffers, data) {
  var i = 0
  var c = data.length
  buffers.push(buffL)

  for (; i < c; i++) {
    if (data[i] == null) continue
    encode._encode(buffers, data[i])
  }

  buffers.push(buffE)
}

module.exports = encode

},{"safe-buffer":70}],5:[function(require,module,exports){
var bencode = module.exports

bencode.encode = require('./encode')
bencode.decode = require('./decode')

/**
 * Determines the amount of bytes
 * needed to encode the given value
 * @param  {Object|Array|Buffer|String|Number|Boolean} value
 * @return {Number} byteCount
 */
bencode.byteLength = bencode.encodingLength = function (value) {
  return bencode.encode(value).length
}

},{"./decode":3,"./encode":4}],6:[function(require,module,exports){
module.exports = function(haystack, needle, comparator, low, high) {
  var mid, cmp;

  if(low === undefined)
    low = 0;

  else {
    low = low|0;
    if(low < 0 || low >= haystack.length)
      throw new RangeError("invalid lower bound");
  }

  if(high === undefined)
    high = haystack.length - 1;

  else {
    high = high|0;
    if(high < low || high >= haystack.length)
      throw new RangeError("invalid upper bound");
  }

  while(low <= high) {
    /* Note that "(low + high) >>> 1" may overflow, and results in a typecast
     * to double (which gives the wrong results). */
    mid = low + (high - low >> 1);
    cmp = +comparator(haystack[mid], needle, mid, haystack);

    /* Too low. */
    if(cmp < 0.0)
      low  = mid + 1;

    /* Too high. */
    else if(cmp > 0.0)
      high = mid - 1;

    /* Key found. */
    else
      return mid;
  }

  /* Key not found. */
  return ~low;
}

},{}],7:[function(require,module,exports){
(function (Buffer){
var Container = typeof Buffer !== "undefined" ? Buffer //in node, use buffers
		: typeof Int8Array !== "undefined" ? Int8Array //in newer browsers, use webgl int8arrays
		: function(l){ var a = new Array(l); for(var i = 0; i < l; i++) a[i]=0; }; //else, do something similar

function BitField(data, opts){
	if(!(this instanceof BitField)) {
		return new BitField(data, opts);
	}

	if(arguments.length === 0){
		data = 0;
	}

	this.grow = opts && (isFinite(opts.grow) && getByteSize(opts.grow) || opts.grow) || 0;

	if(typeof data === "number" || data === undefined){
		data = new Container(getByteSize(data));
		if(data.fill && !data._isBuffer) data.fill(0); // clear node buffers of garbage
	}
	this.buffer = data;
}

function getByteSize(num){
	var out = num >> 3;
	if(num % 8 !== 0) out++;
	return out;
}

BitField.prototype.get = function(i){
	var j = i >> 3;
	return (j < this.buffer.length) &&
		!!(this.buffer[j] & (128 >> (i % 8)));
};

BitField.prototype.set = function(i, b){
	var j = i >> 3;
	if (b || arguments.length === 1){
		if (this.buffer.length < j + 1) this._grow(Math.max(j + 1, Math.min(2 * this.buffer.length, this.grow)));
		// Set
		this.buffer[j] |= 128 >> (i % 8);
	} else if (j < this.buffer.length) {
		/// Clear
		this.buffer[j] &= ~(128 >> (i % 8));
	}
};

BitField.prototype._grow = function(length) {
	if (this.buffer.length < length && length <= this.grow) {
		var newBuffer = new Container(length);
		if (newBuffer.fill) newBuffer.fill(0);
		if (this.buffer.copy) this.buffer.copy(newBuffer, 0);
		else {
			for(var i = 0; i < this.buffer.length; i++) {
				newBuffer[i] = this.buffer[i];
			}
		}
		this.buffer = newBuffer;
	}
};

if(typeof module !== "undefined") module.exports = BitField;

}).call(this,require("buffer").Buffer)
},{"buffer":119}],8:[function(require,module,exports){
module.exports = Wire

var arrayRemove = require('unordered-array-remove')
var bencode = require('bencode')
var BitField = require('bitfield')
var Buffer = require('safe-buffer').Buffer
var debug = require('debug')('bittorrent-protocol')
var extend = require('xtend')
var inherits = require('inherits')
var randombytes = require('randombytes')
var speedometer = require('speedometer')
var stream = require('readable-stream')

var BITFIELD_GROW = 400000
var KEEP_ALIVE_TIMEOUT = 55000

var MESSAGE_PROTOCOL = Buffer.from('\u0013BitTorrent protocol')
var MESSAGE_KEEP_ALIVE = Buffer.from([0x00, 0x00, 0x00, 0x00])
var MESSAGE_CHOKE = Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00])
var MESSAGE_UNCHOKE = Buffer.from([0x00, 0x00, 0x00, 0x01, 0x01])
var MESSAGE_INTERESTED = Buffer.from([0x00, 0x00, 0x00, 0x01, 0x02])
var MESSAGE_UNINTERESTED = Buffer.from([0x00, 0x00, 0x00, 0x01, 0x03])

var MESSAGE_RESERVED = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]
var MESSAGE_PORT = [0x00, 0x00, 0x00, 0x03, 0x09, 0x00, 0x00]

function Request (piece, offset, length, callback) {
  this.piece = piece
  this.offset = offset
  this.length = length
  this.callback = callback
}

inherits(Wire, stream.Duplex)

function Wire () {
  if (!(this instanceof Wire)) return new Wire()
  stream.Duplex.call(this)

  this._debugId = randombytes(4).toString('hex')
  this._debug('new wire')

  this.peerId = null // remote peer id (hex string)
  this.peerIdBuffer = null // remote peer id (buffer)
  this.type = null // connection type ('webrtc', 'tcpIncoming', 'tcpOutgoing', 'webSeed')

  this.amChoking = true // are we choking the peer?
  this.amInterested = false // are we interested in the peer?

  this.peerChoking = true // is the peer choking us?
  this.peerInterested = false // is the peer interested in us?

  // The largest torrent that I know of (the Geocities archive) is ~641 GB and has
  // ~41,000 pieces. Therefore, cap bitfield to 10x larger (400,000 bits) to support all
  // possible torrents but prevent malicious peers from growing bitfield to fill memory.
  this.peerPieces = new BitField(0, { grow: BITFIELD_GROW })

  this.peerExtensions = {}

  this.requests = [] // outgoing
  this.peerRequests = [] // incoming

  this.extendedMapping = {} // number -> string, ex: 1 -> 'ut_metadata'
  this.peerExtendedMapping = {} // string -> number, ex: 9 -> 'ut_metadata'

  // The extended handshake to send, minus the "m" field, which gets automatically
  // filled from `this.extendedMapping`
  this.extendedHandshake = {}

  this.peerExtendedHandshake = {} // remote peer's extended handshake

  this._ext = {}  // string -> function, ex 'ut_metadata' -> ut_metadata()
  this._nextExt = 1

  this.uploaded = 0
  this.downloaded = 0
  this.uploadSpeed = speedometer()
  this.downloadSpeed = speedometer()

  this._keepAliveInterval = null
  this._timeout = null
  this._timeoutMs = 0

  this.destroyed = false // was the wire ended by calling `destroy`?
  this._finished = false

  this._parserSize = 0 // number of needed bytes to parse next message from remote peer
  this._parser = null // function to call once `this._parserSize` bytes are available

  this._buffer = [] // incomplete message data
  this._bufferSize = 0 // cached total length of buffers in `this._buffer`

  this.on('finish', this._onFinish)

  this._parseHandshake()
}

/**
 * Set whether to send a "keep-alive" ping (sent every 55s)
 * @param {boolean} enable
 */
Wire.prototype.setKeepAlive = function (enable) {
  var self = this
  self._debug('setKeepAlive %s', enable)
  clearInterval(self._keepAliveInterval)
  if (enable === false) return
  self._keepAliveInterval = setInterval(function () {
    self.keepAlive()
  }, KEEP_ALIVE_TIMEOUT)
}

/**
 * Set the amount of time to wait before considering a request to be "timed out"
 * @param {number} ms
 * @param {boolean=} unref (should the timer be unref'd? default: false)
 */
Wire.prototype.setTimeout = function (ms, unref) {
  this._debug('setTimeout ms=%d unref=%s', ms, unref)
  this._clearTimeout()
  this._timeoutMs = ms
  this._timeoutUnref = !!unref
  this._updateTimeout()
}

Wire.prototype.destroy = function () {
  if (this.destroyed) return
  this.destroyed = true
  this._debug('destroy')
  this.emit('close')
  this.end()
}

Wire.prototype.end = function () {
  this._debug('end')
  this._onUninterested()
  this._onChoke()
  stream.Duplex.prototype.end.apply(this, arguments)
}

/**
 * Use the specified protocol extension.
 * @param  {function} Extension
 */
Wire.prototype.use = function (Extension) {
  var name = Extension.prototype.name
  if (!name) {
    throw new Error('Extension class requires a "name" property on the prototype')
  }
  this._debug('use extension.name=%s', name)

  var ext = this._nextExt
  var handler = new Extension(this)

  function noop () {}

  if (typeof handler.onHandshake !== 'function') {
    handler.onHandshake = noop
  }
  if (typeof handler.onExtendedHandshake !== 'function') {
    handler.onExtendedHandshake = noop
  }
  if (typeof handler.onMessage !== 'function') {
    handler.onMessage = noop
  }

  this.extendedMapping[ext] = name
  this._ext[name] = handler
  this[name] = handler

  this._nextExt += 1
}

//
// OUTGOING MESSAGES
//

/**
 * Message "keep-alive": <len=0000>
 */
Wire.prototype.keepAlive = function () {
  this._debug('keep-alive')
  this._push(MESSAGE_KEEP_ALIVE)
}

/**
 * Message: "handshake" <pstrlen><pstr><reserved><info_hash><peer_id>
 * @param  {Buffer|string} infoHash (as Buffer or *hex* string)
 * @param  {Buffer|string} peerId
 * @param  {Object} extensions
 */
Wire.prototype.handshake = function (infoHash, peerId, extensions) {
  var infoHashBuffer, peerIdBuffer
  if (typeof infoHash === 'string') {
    infoHashBuffer = Buffer.from(infoHash, 'hex')
  } else {
    infoHashBuffer = infoHash
    infoHash = infoHashBuffer.toString('hex')
  }
  if (typeof peerId === 'string') {
    peerIdBuffer = Buffer.from(peerId, 'hex')
  } else {
    peerIdBuffer = peerId
    peerId = peerIdBuffer.toString('hex')
  }

  if (infoHashBuffer.length !== 20 || peerIdBuffer.length !== 20) {
    throw new Error('infoHash and peerId MUST have length 20')
  }

  this._debug('handshake i=%s p=%s exts=%o', infoHash, peerId, extensions)

  var reserved = Buffer.from(MESSAGE_RESERVED)

  // enable extended message
  reserved[5] |= 0x10

  if (extensions && extensions.dht) reserved[7] |= 1

  this._push(Buffer.concat([MESSAGE_PROTOCOL, reserved, infoHashBuffer, peerIdBuffer]))
  this._handshakeSent = true

  if (this.peerExtensions.extended && !this._extendedHandshakeSent) {
    // Peer's handshake indicated support already
    // (incoming connection)
    this._sendExtendedHandshake()
  }
}

/* Peer supports BEP-0010, send extended handshake.
 *
 * This comes after the 'handshake' event to give the user a chance to populate
 * `this.extendedHandshake` and `this.extendedMapping` before the extended handshake
 * is sent to the remote peer.
 */
Wire.prototype._sendExtendedHandshake = function () {
  // Create extended message object from registered extensions
  var msg = extend(this.extendedHandshake)
  msg.m = {}
  for (var ext in this.extendedMapping) {
    var name = this.extendedMapping[ext]
    msg.m[name] = Number(ext)
  }

  // Send extended handshake
  this.extended(0, bencode.encode(msg))
  this._extendedHandshakeSent = true
}

/**
 * Message "choke": <len=0001><id=0>
 */
Wire.prototype.choke = function () {
  if (this.amChoking) return
  this.amChoking = true
  this._debug('choke')
  while (this.peerRequests.length) {
    this.peerRequests.pop()
  }
  this._push(MESSAGE_CHOKE)
}

/**
 * Message "unchoke": <len=0001><id=1>
 */
Wire.prototype.unchoke = function () {
  if (!this.amChoking) return
  this.amChoking = false
  this._debug('unchoke')
  this._push(MESSAGE_UNCHOKE)
}

/**
 * Message "interested": <len=0001><id=2>
 */
Wire.prototype.interested = function () {
  if (this.amInterested) return
  this.amInterested = true
  this._debug('interested')
  this._push(MESSAGE_INTERESTED)
}

/**
 * Message "uninterested": <len=0001><id=3>
 */
Wire.prototype.uninterested = function () {
  if (!this.amInterested) return
  this.amInterested = false
  this._debug('uninterested')
  this._push(MESSAGE_UNINTERESTED)
}

/**
 * Message "have": <len=0005><id=4><piece index>
 * @param  {number} index
 */
Wire.prototype.have = function (index) {
  this._debug('have %d', index)
  this._message(4, [index], null)
}

/**
 * Message "bitfield": <len=0001+X><id=5><bitfield>
 * @param  {BitField|Buffer} bitfield
 */
Wire.prototype.bitfield = function (bitfield) {
  this._debug('bitfield')
  if (!Buffer.isBuffer(bitfield)) bitfield = bitfield.buffer
  this._message(5, [], bitfield)
}

/**
 * Message "request": <len=0013><id=6><index><begin><length>
 * @param  {number}   index
 * @param  {number}   offset
 * @param  {number}   length
 * @param  {function} cb
 */
Wire.prototype.request = function (index, offset, length, cb) {
  if (!cb) cb = function () {}
  if (this._finished) return cb(new Error('wire is closed'))
  if (this.peerChoking) return cb(new Error('peer is choking'))

  this._debug('request index=%d offset=%d length=%d', index, offset, length)

  this.requests.push(new Request(index, offset, length, cb))
  this._updateTimeout()
  this._message(6, [index, offset, length], null)
}

/**
 * Message "piece": <len=0009+X><id=7><index><begin><block>
 * @param  {number} index
 * @param  {number} offset
 * @param  {Buffer} buffer
 */
Wire.prototype.piece = function (index, offset, buffer) {
  this._debug('piece index=%d offset=%d', index, offset)
  this.uploaded += buffer.length
  this.uploadSpeed(buffer.length)
  this.emit('upload', buffer.length)
  this._message(7, [index, offset], buffer)
}

/**
 * Message "cancel": <len=0013><id=8><index><begin><length>
 * @param  {number} index
 * @param  {number} offset
 * @param  {number} length
 */
Wire.prototype.cancel = function (index, offset, length) {
  this._debug('cancel index=%d offset=%d length=%d', index, offset, length)
  this._callback(
    pull(this.requests, index, offset, length),
    new Error('request was cancelled'),
    null
  )
  this._message(8, [index, offset, length], null)
}

/**
 * Message: "port" <len=0003><id=9><listen-port>
 * @param {Number} port
 */
Wire.prototype.port = function (port) {
  this._debug('port %d', port)
  var message = Buffer.from(MESSAGE_PORT)
  message.writeUInt16BE(port, 5)
  this._push(message)
}

/**
 * Message: "extended" <len=0005+X><id=20><ext-number><payload>
 * @param  {number|string} ext
 * @param  {Object} obj
 */
Wire.prototype.extended = function (ext, obj) {
  this._debug('extended ext=%s', ext)
  if (typeof ext === 'string' && this.peerExtendedMapping[ext]) {
    ext = this.peerExtendedMapping[ext]
  }
  if (typeof ext === 'number') {
    var extId = Buffer.from([ext])
    var buf = Buffer.isBuffer(obj) ? obj : bencode.encode(obj)

    this._message(20, [], Buffer.concat([extId, buf]))
  } else {
    throw new Error('Unrecognized extension: ' + ext)
  }
}

/**
 * Duplex stream method. Called whenever the remote peer stream wants data. No-op
 * since we'll just push data whenever we get it.
 */
Wire.prototype._read = function () {}

/**
 * Send a message to the remote peer.
 */
Wire.prototype._message = function (id, numbers, data) {
  var dataLength = data ? data.length : 0
  var buffer = Buffer.allocUnsafe(5 + (4 * numbers.length))

  buffer.writeUInt32BE(buffer.length + dataLength - 4, 0)
  buffer[4] = id
  for (var i = 0; i < numbers.length; i++) {
    buffer.writeUInt32BE(numbers[i], 5 + (4 * i))
  }

  this._push(buffer)
  if (data) this._push(data)
}

Wire.prototype._push = function (data) {
  if (this._finished) return
  return this.push(data)
}

//
// INCOMING MESSAGES
//

Wire.prototype._onKeepAlive = function () {
  this._debug('got keep-alive')
  this.emit('keep-alive')
}

Wire.prototype._onHandshake = function (infoHashBuffer, peerIdBuffer, extensions) {
  var infoHash = infoHashBuffer.toString('hex')
  var peerId = peerIdBuffer.toString('hex')

  this._debug('got handshake i=%s p=%s exts=%o', infoHash, peerId, extensions)

  this.peerId = peerId
  this.peerIdBuffer = peerIdBuffer
  this.peerExtensions = extensions

  this.emit('handshake', infoHash, peerId, extensions)

  var name
  for (name in this._ext) {
    this._ext[name].onHandshake(infoHash, peerId, extensions)
  }

  if (extensions.extended && this._handshakeSent &&
      !this._extendedHandshakeSent) {
    // outgoing connection
    this._sendExtendedHandshake()
  }
}

Wire.prototype._onChoke = function () {
  this.peerChoking = true
  this._debug('got choke')
  this.emit('choke')
  while (this.requests.length) {
    this._callback(this.requests.pop(), new Error('peer is choking'), null)
  }
}

Wire.prototype._onUnchoke = function () {
  this.peerChoking = false
  this._debug('got unchoke')
  this.emit('unchoke')
}

Wire.prototype._onInterested = function () {
  this.peerInterested = true
  this._debug('got interested')
  this.emit('interested')
}

Wire.prototype._onUninterested = function () {
  this.peerInterested = false
  this._debug('got uninterested')
  this.emit('uninterested')
}

Wire.prototype._onHave = function (index) {
  if (this.peerPieces.get(index)) return
  this._debug('got have %d', index)

  this.peerPieces.set(index, true)
  this.emit('have', index)
}

Wire.prototype._onBitField = function (buffer) {
  this.peerPieces = new BitField(buffer)
  this._debug('got bitfield')
  this.emit('bitfield', this.peerPieces)
}

Wire.prototype._onRequest = function (index, offset, length) {
  var self = this
  if (self.amChoking) return
  self._debug('got request index=%d offset=%d length=%d', index, offset, length)

  var respond = function (err, buffer) {
    if (request !== pull(self.peerRequests, index, offset, length)) return
    if (err) return self._debug('error satisfying request index=%d offset=%d length=%d (%s)', index, offset, length, err.message)
    self.piece(index, offset, buffer)
  }

  var request = new Request(index, offset, length, respond)
  self.peerRequests.push(request)
  self.emit('request', index, offset, length, respond)
}

Wire.prototype._onPiece = function (index, offset, buffer) {
  this._debug('got piece index=%d offset=%d', index, offset)
  this._callback(pull(this.requests, index, offset, buffer.length), null, buffer)
  this.downloaded += buffer.length
  this.downloadSpeed(buffer.length)
  this.emit('download', buffer.length)
  this.emit('piece', index, offset, buffer)
}

Wire.prototype._onCancel = function (index, offset, length) {
  this._debug('got cancel index=%d offset=%d length=%d', index, offset, length)
  pull(this.peerRequests, index, offset, length)
  this.emit('cancel', index, offset, length)
}

Wire.prototype._onPort = function (port) {
  this._debug('got port %d', port)
  this.emit('port', port)
}

Wire.prototype._onExtended = function (ext, buf) {
  if (ext === 0) {
    var info
    try {
      info = bencode.decode(buf)
    } catch (err) {
      this._debug('ignoring invalid extended handshake: %s', err.message || err)
    }

    if (!info) return
    this.peerExtendedHandshake = info

    var name
    if (typeof info.m === 'object') {
      for (name in info.m) {
        this.peerExtendedMapping[name] = Number(info.m[name].toString())
      }
    }
    for (name in this._ext) {
      if (this.peerExtendedMapping[name]) {
        this._ext[name].onExtendedHandshake(this.peerExtendedHandshake)
      }
    }
    this._debug('got extended handshake')
    this.emit('extended', 'handshake', this.peerExtendedHandshake)
  } else {
    if (this.extendedMapping[ext]) {
      ext = this.extendedMapping[ext] // friendly name for extension
      if (this._ext[ext]) {
        // there is an registered extension handler, so call it
        this._ext[ext].onMessage(buf)
      }
    }
    this._debug('got extended message ext=%s', ext)
    this.emit('extended', ext, buf)
  }
}

Wire.prototype._onTimeout = function () {
  this._debug('request timed out')
  this._callback(this.requests.shift(), new Error('request has timed out'), null)
  this.emit('timeout')
}

/**
 * Duplex stream method. Called whenever the remote peer has data for us. Data that the
 * remote peer sends gets buffered (i.e. not actually processed) until the right number
 * of bytes have arrived, determined by the last call to `this._parse(number, callback)`.
 * Once enough bytes have arrived to process the message, the callback function
 * (i.e. `this._parser`) gets called with the full buffer of data.
 * @param  {Buffer} data
 * @param  {string} encoding
 * @param  {function} cb
 */
Wire.prototype._write = function (data, encoding, cb) {
  this._bufferSize += data.length
  this._buffer.push(data)

  while (this._bufferSize >= this._parserSize) {
    var buffer = (this._buffer.length === 1)
      ? this._buffer[0]
      : Buffer.concat(this._buffer)
    this._bufferSize -= this._parserSize
    this._buffer = this._bufferSize
      ? [buffer.slice(this._parserSize)]
      : []
    this._parser(buffer.slice(0, this._parserSize))
  }

  cb(null) // Signal that we're ready for more data
}

Wire.prototype._callback = function (request, err, buffer) {
  if (!request) return

  this._clearTimeout()

  if (!this.peerChoking && !this._finished) this._updateTimeout()
  request.callback(err, buffer)
}

Wire.prototype._clearTimeout = function () {
  if (!this._timeout) return

  clearTimeout(this._timeout)
  this._timeout = null
}

Wire.prototype._updateTimeout = function () {
  var self = this
  if (!self._timeoutMs || !self.requests.length || self._timeout) return

  self._timeout = setTimeout(function () {
    self._onTimeout()
  }, self._timeoutMs)
  if (self._timeoutUnref && self._timeout.unref) self._timeout.unref()
}

/**
 * Takes a number of bytes that the local peer is waiting to receive from the remote peer
 * in order to parse a complete message, and a callback function to be called once enough
 * bytes have arrived.
 * @param  {number} size
 * @param  {function} parser
 */
Wire.prototype._parse = function (size, parser) {
  this._parserSize = size
  this._parser = parser
}

/**
 * Handle the first 4 bytes of a message, to determine the length of bytes that must be
 * waited for in order to have the whole message.
 * @param  {Buffer} buffer
 */
Wire.prototype._onMessageLength = function (buffer) {
  var length = buffer.readUInt32BE(0)
  if (length > 0) {
    this._parse(length, this._onMessage)
  } else {
    this._onKeepAlive()
    this._parse(4, this._onMessageLength)
  }
}

/**
 * Handle a message from the remote peer.
 * @param  {Buffer} buffer
 */
Wire.prototype._onMessage = function (buffer) {
  this._parse(4, this._onMessageLength)
  switch (buffer[0]) {
    case 0:
      return this._onChoke()
    case 1:
      return this._onUnchoke()
    case 2:
      return this._onInterested()
    case 3:
      return this._onUninterested()
    case 4:
      return this._onHave(buffer.readUInt32BE(1))
    case 5:
      return this._onBitField(buffer.slice(1))
    case 6:
      return this._onRequest(buffer.readUInt32BE(1),
          buffer.readUInt32BE(5), buffer.readUInt32BE(9))
    case 7:
      return this._onPiece(buffer.readUInt32BE(1),
          buffer.readUInt32BE(5), buffer.slice(9))
    case 8:
      return this._onCancel(buffer.readUInt32BE(1),
          buffer.readUInt32BE(5), buffer.readUInt32BE(9))
    case 9:
      return this._onPort(buffer.readUInt16BE(1))
    case 20:
      return this._onExtended(buffer.readUInt8(1), buffer.slice(2))
    default:
      this._debug('got unknown message')
      return this.emit('unknownmessage', buffer)
  }
}

Wire.prototype._parseHandshake = function () {
  var self = this
  self._parse(1, function (buffer) {
    var pstrlen = buffer.readUInt8(0)
    self._parse(pstrlen + 48, function (handshake) {
      var protocol = handshake.slice(0, pstrlen)
      if (protocol.toString() !== 'BitTorrent protocol') {
        self._debug('Error: wire not speaking BitTorrent protocol (%s)', protocol.toString())
        self.end()
        return
      }
      handshake = handshake.slice(pstrlen)
      self._onHandshake(handshake.slice(8, 28), handshake.slice(28, 48), {
        dht: !!(handshake[7] & 0x01), // see bep_0005
        extended: !!(handshake[5] & 0x10) // see bep_0010
      })
      self._parse(4, self._onMessageLength)
    })
  })
}

Wire.prototype._onFinish = function () {
  this._finished = true

  this.push(null) // stream cannot be half open, so signal the end of it
  while (this.read()) {} // consume and discard the rest of the stream data

  clearInterval(this._keepAliveInterval)
  this._parse(Number.MAX_VALUE, function () {})
  while (this.peerRequests.length) {
    this.peerRequests.pop()
  }
  while (this.requests.length) {
    this._callback(this.requests.pop(), new Error('wire was closed'), null)
  }
}

Wire.prototype._debug = function () {
  var args = [].slice.call(arguments)
  args[0] = '[' + this._debugId + '] ' + args[0]
  debug.apply(null, args)
}

function pull (requests, piece, offset, length) {
  for (var i = 0; i < requests.length; i++) {
    var req = requests[i]
    if (req.piece === piece && req.offset === offset && req.length === length) {
      arrayRemove(requests, i)
      return req
    }
  }
  return null
}

},{"bencode":5,"bitfield":7,"debug":22,"inherits":30,"randombytes":54,"readable-stream":64,"safe-buffer":70,"speedometer":78,"unordered-array-remove":95,"xtend":113}],9:[function(require,module,exports){
(function (process){
module.exports = Client

var Buffer = require('safe-buffer').Buffer
var debug = require('debug')('bittorrent-tracker:client')
var EventEmitter = require('events').EventEmitter
var extend = require('xtend')
var inherits = require('inherits')
var once = require('once')
var parallel = require('run-parallel')
var Peer = require('simple-peer')
var uniq = require('uniq')
var url = require('url')

var common = require('./lib/common')
var HTTPTracker = require('./lib/client/http-tracker') // empty object in browser
var UDPTracker = require('./lib/client/udp-tracker') // empty object in browser
var WebSocketTracker = require('./lib/client/websocket-tracker')

inherits(Client, EventEmitter)

/**
 * BitTorrent tracker client.
 *
 * Find torrent peers, to help a torrent client participate in a torrent swarm.
 *
 * @param {Object} opts                          options object
 * @param {string|Buffer} opts.infoHash          torrent info hash
 * @param {string|Buffer} opts.peerId            peer id
 * @param {string|Array.<string>} opts.announce  announce
 * @param {number} opts.port                     torrent client listening port
 * @param {function} opts.getAnnounceOpts        callback to provide data to tracker
 * @param {number} opts.rtcConfig                RTCPeerConnection configuration object
 * @param {number} opts.userAgent                User-Agent header for http requests
 * @param {number} opts.wrtc                     custom webrtc impl (useful in node.js)
 */
function Client (opts) {
  var self = this
  if (!(self instanceof Client)) return new Client(opts)
  EventEmitter.call(self)
  if (!opts) opts = {}

  if (!opts.peerId) throw new Error('Option `peerId` is required')
  if (!opts.infoHash) throw new Error('Option `infoHash` is required')
  if (!opts.announce) throw new Error('Option `announce` is required')
  if (!process.browser && !opts.port) throw new Error('Option `port` is required')

  self.peerId = typeof opts.peerId === 'string'
    ? opts.peerId
    : opts.peerId.toString('hex')
  self._peerIdBuffer = Buffer.from(self.peerId, 'hex')
  self._peerIdBinary = self._peerIdBuffer.toString('binary')

  self.infoHash = typeof opts.infoHash === 'string'
    ? opts.infoHash
    : opts.infoHash.toString('hex')
  self._infoHashBuffer = Buffer.from(self.infoHash, 'hex')
  self._infoHashBinary = self._infoHashBuffer.toString('binary')

  debug('new client %s', self.infoHash)

  self.destroyed = false

  self._port = opts.port
  self._getAnnounceOpts = opts.getAnnounceOpts
  self._rtcConfig = opts.rtcConfig
  self._userAgent = opts.userAgent

  // Support lazy 'wrtc' module initialization
  // See: https://github.com/webtorrent/webtorrent-hybrid/issues/46
  self._wrtc = typeof opts.wrtc === 'function' ? opts.wrtc() : opts.wrtc

  var announce = typeof opts.announce === 'string'
    ? [ opts.announce ]
    : opts.announce == null ? [] : opts.announce

  // Remove trailing slash from trackers to catch duplicates
  announce = announce.map(function (announceUrl) {
    announceUrl = announceUrl.toString()
    if (announceUrl[announceUrl.length - 1] === '/') {
      announceUrl = announceUrl.substring(0, announceUrl.length - 1)
    }
    return announceUrl
  })
  announce = uniq(announce)

  var webrtcSupport = self._wrtc !== false && (!!self._wrtc || Peer.WEBRTC_SUPPORT)

  self._trackers = announce
    .map(function (announceUrl) {
      var protocol = url.parse(announceUrl).protocol
      if ((protocol === 'http:' || protocol === 'https:') &&
          typeof HTTPTracker === 'function') {
        return new HTTPTracker(self, announceUrl)
      } else if (protocol === 'udp:' && typeof UDPTracker === 'function') {
        return new UDPTracker(self, announceUrl)
      } else if ((protocol === 'ws:' || protocol === 'wss:') && webrtcSupport) {
        // Skip ws:// trackers on https:// sites because they throw SecurityError
        if (protocol === 'ws:' && typeof window !== 'undefined' &&
            window.location.protocol === 'https:') {
          nextTickWarn(new Error('Unsupported tracker protocol: ' + announceUrl))
          return null
        }
        return new WebSocketTracker(self, announceUrl)
      } else {
        nextTickWarn(new Error('Unsupported tracker protocol: ' + announceUrl))
        return null
      }
    })
    .filter(Boolean)

  function nextTickWarn (err) {
    process.nextTick(function () {
      self.emit('warning', err)
    })
  }
}

/**
 * Simple convenience function to scrape a tracker for an info hash without needing to
 * create a Client, pass it a parsed torrent, etc. Support scraping a tracker for multiple
 * torrents at the same time.
 * @params {Object} opts
 * @param  {string|Array.<string>} opts.infoHash
 * @param  {string} opts.announce
 * @param  {function} cb
 */
Client.scrape = function (opts, cb) {
  cb = once(cb)

  if (!opts.infoHash) throw new Error('Option `infoHash` is required')
  if (!opts.announce) throw new Error('Option `announce` is required')

  var clientOpts = extend(opts, {
    infoHash: Array.isArray(opts.infoHash) ? opts.infoHash[0] : opts.infoHash,
    peerId: Buffer.from('01234567890123456789'), // dummy value
    port: 6881 // dummy value
  })

  var client = new Client(clientOpts)
  client.once('error', cb)
  client.once('warning', cb)

  var len = Array.isArray(opts.infoHash) ? opts.infoHash.length : 1
  var results = {}
  client.on('scrape', function (data) {
    len -= 1
    results[data.infoHash] = data
    if (len === 0) {
      client.destroy()
      var keys = Object.keys(results)
      if (keys.length === 1) {
        cb(null, results[keys[0]])
      } else {
        cb(null, results)
      }
    }
  })

  opts.infoHash = Array.isArray(opts.infoHash)
    ? opts.infoHash.map(function (infoHash) {
      return Buffer.from(infoHash, 'hex')
    })
    : Buffer.from(opts.infoHash, 'hex')
  client.scrape({ infoHash: opts.infoHash })
  return client
}

/**
 * Send a `start` announce to the trackers.
 * @param {Object} opts
 * @param {number=} opts.uploaded
 * @param {number=} opts.downloaded
 * @param {number=} opts.left (if not set, calculated automatically)
 */
Client.prototype.start = function (opts) {
  var self = this
  debug('send `start`')
  opts = self._defaultAnnounceOpts(opts)
  opts.event = 'started'
  self._announce(opts)

  // start announcing on intervals
  self._trackers.forEach(function (tracker) {
    tracker.setInterval()
  })
}

/**
 * Send a `stop` announce to the trackers.
 * @param {Object} opts
 * @param {number=} opts.uploaded
 * @param {number=} opts.downloaded
 * @param {number=} opts.numwant
 * @param {number=} opts.left (if not set, calculated automatically)
 */
Client.prototype.stop = function (opts) {
  var self = this
  debug('send `stop`')
  opts = self._defaultAnnounceOpts(opts)
  opts.event = 'stopped'
  self._announce(opts)
}

/**
 * Send a `complete` announce to the trackers.
 * @param {Object} opts
 * @param {number=} opts.uploaded
 * @param {number=} opts.downloaded
 * @param {number=} opts.numwant
 * @param {number=} opts.left (if not set, calculated automatically)
 */
Client.prototype.complete = function (opts) {
  var self = this
  debug('send `complete`')
  if (!opts) opts = {}
  opts = self._defaultAnnounceOpts(opts)
  opts.event = 'completed'
  self._announce(opts)
}

/**
 * Send a `update` announce to the trackers.
 * @param {Object} opts
 * @param {number=} opts.uploaded
 * @param {number=} opts.downloaded
 * @param {number=} opts.numwant
 * @param {number=} opts.left (if not set, calculated automatically)
 */
Client.prototype.update = function (opts) {
  var self = this
  debug('send `update`')
  opts = self._defaultAnnounceOpts(opts)
  if (opts.event) delete opts.event
  self._announce(opts)
}

Client.prototype._announce = function (opts) {
  var self = this
  self._trackers.forEach(function (tracker) {
    // tracker should not modify `opts` object, it's passed to all trackers
    tracker.announce(opts)
  })
}

/**
 * Send a scrape request to the trackers.
 * @param {Object} opts
 */
Client.prototype.scrape = function (opts) {
  var self = this
  debug('send `scrape`')
  if (!opts) opts = {}
  self._trackers.forEach(function (tracker) {
    // tracker should not modify `opts` object, it's passed to all trackers
    tracker.scrape(opts)
  })
}

Client.prototype.setInterval = function (intervalMs) {
  var self = this
  debug('setInterval %d', intervalMs)
  self._trackers.forEach(function (tracker) {
    tracker.setInterval(intervalMs)
  })
}

Client.prototype.destroy = function (cb) {
  var self = this
  if (self.destroyed) return
  self.destroyed = true
  debug('destroy')

  var tasks = self._trackers.map(function (tracker) {
    return function (cb) {
      tracker.destroy(cb)
    }
  })

  parallel(tasks, cb)

  self._trackers = []
  self._getAnnounceOpts = null
}

Client.prototype._defaultAnnounceOpts = function (opts) {
  var self = this
  if (!opts) opts = {}

  if (opts.numwant == null) opts.numwant = common.DEFAULT_ANNOUNCE_PEERS

  if (opts.uploaded == null) opts.uploaded = 0
  if (opts.downloaded == null) opts.downloaded = 0

  if (self._getAnnounceOpts) opts = extend(opts, self._getAnnounceOpts())
  return opts
}

}).call(this,require('_process'))
},{"./lib/client/http-tracker":118,"./lib/client/udp-tracker":118,"./lib/client/websocket-tracker":11,"./lib/common":12,"_process":130,"debug":13,"events":122,"inherits":30,"once":48,"run-parallel":68,"safe-buffer":70,"simple-peer":73,"uniq":94,"url":151,"xtend":113}],10:[function(require,module,exports){
module.exports = Tracker

var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

inherits(Tracker, EventEmitter)

function Tracker (client, announceUrl) {
  var self = this
  EventEmitter.call(self)
  self.client = client
  self.announceUrl = announceUrl

  self.interval = null
  self.destroyed = false
}

Tracker.prototype.setInterval = function (intervalMs) {
  var self = this
  if (intervalMs == null) intervalMs = self.DEFAULT_ANNOUNCE_INTERVAL

  clearInterval(self.interval)

  if (intervalMs) {
    self.interval = setInterval(function () {
      self.announce(self.client._defaultAnnounceOpts())
    }, intervalMs)
    if (self.interval.unref) self.interval.unref()
  }
}

},{"events":122,"inherits":30}],11:[function(require,module,exports){
module.exports = WebSocketTracker

var debug = require('debug')('bittorrent-tracker:websocket-tracker')
var extend = require('xtend')
var inherits = require('inherits')
var Peer = require('simple-peer')
var randombytes = require('randombytes')
var Socket = require('simple-websocket')

var common = require('../common')
var Tracker = require('./tracker')

// Use a socket pool, so tracker clients share WebSocket objects for the same server.
// In practice, WebSockets are pretty slow to establish, so this gives a nice performance
// boost, and saves browser resources.
var socketPool = {}

var RECONNECT_MINIMUM = 15 * 1000
var RECONNECT_MAXIMUM = 30 * 60 * 1000
var RECONNECT_VARIANCE = 30 * 1000
var OFFER_TIMEOUT = 50 * 1000

inherits(WebSocketTracker, Tracker)

function WebSocketTracker (client, announceUrl, opts) {
  var self = this
  Tracker.call(self, client, announceUrl)
  debug('new websocket tracker %s', announceUrl)

  self.peers = {} // peers (offer id -> peer)
  self.socket = null

  self.reconnecting = false
  self.retries = 0
  self.reconnectTimer = null

  // Simple boolean flag to track whether the socket has received data from
  // the websocket server since the last time socket.send() was called.
  self.expectingResponse = false

  self._openSocket()
}

WebSocketTracker.prototype.DEFAULT_ANNOUNCE_INTERVAL = 30 * 1000 // 30 seconds

WebSocketTracker.prototype.announce = function (opts) {
  var self = this
  if (self.destroyed || self.reconnecting) return
  if (!self.socket.connected) {
    self.socket.once('connect', function () {
      self.announce(opts)
    })
    return
  }

  var params = extend(opts, {
    action: 'announce',
    info_hash: self.client._infoHashBinary,
    peer_id: self.client._peerIdBinary
  })
  if (self._trackerId) params.trackerid = self._trackerId

  if (opts.event === 'stopped' || opts.event === 'completed') {
    // Don't include offers with 'stopped' or 'completed' event
    self._send(params)
  } else {
    // Limit the number of offers that are generated, since it can be slow
    var numwant = Math.min(opts.numwant, 10)

    self._generateOffers(numwant, function (offers) {
      params.numwant = numwant
      params.offers = offers
      self._send(params)
    })
  }
}

WebSocketTracker.prototype.scrape = function (opts) {
  var self = this
  if (self.destroyed || self.reconnecting) return
  if (!self.socket.connected) {
    self.socket.once('connect', function () {
      self.scrape(opts)
    })
    return
  }

  var infoHashes = (Array.isArray(opts.infoHash) && opts.infoHash.length > 0)
    ? opts.infoHash.map(function (infoHash) {
      return infoHash.toString('binary')
    })
    : (opts.infoHash && opts.infoHash.toString('binary')) || self.client._infoHashBinary
  var params = {
    action: 'scrape',
    info_hash: infoHashes
  }

  self._send(params)
}

WebSocketTracker.prototype.destroy = function (cb) {
  var self = this
  if (!cb) cb = noop
  if (self.destroyed) return cb(null)

  self.destroyed = true

  clearInterval(self.interval)
  clearTimeout(self.reconnectTimer)

  // Destroy peers
  for (var peerId in self.peers) {
    var peer = self.peers[peerId]
    clearTimeout(peer.trackerTimeout)
    peer.destroy()
  }
  self.peers = null

  if (self.socket) {
    self.socket.removeListener('connect', self._onSocketConnectBound)
    self.socket.removeListener('data', self._onSocketDataBound)
    self.socket.removeListener('close', self._onSocketCloseBound)
    self.socket.removeListener('error', self._onSocketErrorBound)
    self.socket = null
  }

  self._onSocketConnectBound = null
  self._onSocketErrorBound = null
  self._onSocketDataBound = null
  self._onSocketCloseBound = null

  if (socketPool[self.announceUrl]) {
    socketPool[self.announceUrl].consumers -= 1
  }

  // Other instances are using the socket, so there's nothing left to do here
  if (socketPool[self.announceUrl].consumers > 0) return cb()

  var socket = socketPool[self.announceUrl]
  delete socketPool[self.announceUrl]
  socket.on('error', noop) // ignore all future errors
  socket.once('close', cb)

  // If there is no data response expected, destroy immediately.
  if (!self.expectingResponse) return destroyCleanup()

  // Otherwise, wait a short time for potential responses to come in from the
  // server, then force close the socket.
  var timeout = setTimeout(destroyCleanup, common.DESTROY_TIMEOUT)

  // But, if a response comes from the server before the timeout fires, do cleanup
  // right away.
  socket.once('data', destroyCleanup)

  function destroyCleanup () {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
    socket.removeListener('data', destroyCleanup)
    socket.destroy()
    socket = null
  }
}

WebSocketTracker.prototype._openSocket = function () {
  var self = this
  self.destroyed = false

  if (!self.peers) self.peers = {}

  self._onSocketConnectBound = function () {
    self._onSocketConnect()
  }
  self._onSocketErrorBound = function (err) {
    self._onSocketError(err)
  }
  self._onSocketDataBound = function (data) {
    self._onSocketData(data)
  }
  self._onSocketCloseBound = function () {
    self._onSocketClose()
  }

  self.socket = socketPool[self.announceUrl]
  if (self.socket) {
    socketPool[self.announceUrl].consumers += 1
  } else {
    self.socket = socketPool[self.announceUrl] = new Socket(self.announceUrl)
    self.socket.consumers = 1
    self.socket.once('connect', self._onSocketConnectBound)
  }

  self.socket.on('data', self._onSocketDataBound)
  self.socket.once('close', self._onSocketCloseBound)
  self.socket.once('error', self._onSocketErrorBound)
}

WebSocketTracker.prototype._onSocketConnect = function () {
  var self = this
  if (self.destroyed) return

  if (self.reconnecting) {
    self.reconnecting = false
    self.retries = 0
    self.announce(self.client._defaultAnnounceOpts())
  }
}

WebSocketTracker.prototype._onSocketData = function (data) {
  var self = this
  if (self.destroyed) return

  self.expectingResponse = false

  try {
    data = JSON.parse(data)
  } catch (err) {
    self.client.emit('warning', new Error('Invalid tracker response'))
    return
  }

  if (data.action === 'announce') {
    self._onAnnounceResponse(data)
  } else if (data.action === 'scrape') {
    self._onScrapeResponse(data)
  } else {
    self._onSocketError(new Error('invalid action in WS response: ' + data.action))
  }
}

WebSocketTracker.prototype._onAnnounceResponse = function (data) {
  var self = this

  if (data.info_hash !== self.client._infoHashBinary) {
    debug(
      'ignoring websocket data from %s for %s (looking for %s: reused socket)',
      self.announceUrl, common.binaryToHex(data.info_hash), self.client.infoHash
    )
    return
  }

  if (data.peer_id && data.peer_id === self.client._peerIdBinary) {
    // ignore offers/answers from this client
    return
  }

  debug(
    'received %s from %s for %s',
    JSON.stringify(data), self.announceUrl, self.client.infoHash
  )

  var failure = data['failure reason']
  if (failure) return self.client.emit('warning', new Error(failure))

  var warning = data['warning message']
  if (warning) self.client.emit('warning', new Error(warning))

  var interval = data.interval || data['min interval']
  if (interval) self.setInterval(interval * 1000)

  var trackerId = data['tracker id']
  if (trackerId) {
    // If absent, do not discard previous trackerId value
    self._trackerId = trackerId
  }

  if (data.complete != null) {
    var response = Object.assign({}, data, {
      announce: self.announceUrl,
      infoHash: common.binaryToHex(data.info_hash)
    })
    self.client.emit('update', response)
  }

  var peer
  if (data.offer && data.peer_id) {
    debug('creating peer (from remote offer)')
    peer = self._createPeer()
    peer.id = common.binaryToHex(data.peer_id)
    peer.once('signal', function (answer) {
      var params = {
        action: 'announce',
        info_hash: self.client._infoHashBinary,
        peer_id: self.client._peerIdBinary,
        to_peer_id: data.peer_id,
        answer: answer,
        offer_id: data.offer_id
      }
      if (self._trackerId) params.trackerid = self._trackerId
      self._send(params)
    })
    peer.signal(data.offer)
    self.client.emit('peer', peer)
  }

  if (data.answer && data.peer_id) {
    var offerId = common.binaryToHex(data.offer_id)
    peer = self.peers[offerId]
    if (peer) {
      peer.id = common.binaryToHex(data.peer_id)
      peer.signal(data.answer)
      self.client.emit('peer', peer)

      clearTimeout(peer.trackerTimeout)
      peer.trackerTimeout = null
      delete self.peers[offerId]
    } else {
      debug('got unexpected answer: ' + JSON.stringify(data.answer))
    }
  }
}

WebSocketTracker.prototype._onScrapeResponse = function (data) {
  var self = this
  data = data.files || {}

  var keys = Object.keys(data)
  if (keys.length === 0) {
    self.client.emit('warning', new Error('invalid scrape response'))
    return
  }

  keys.forEach(function (infoHash) {
    // TODO: optionally handle data.flags.min_request_interval
    // (separate from announce interval)
    var response = Object.assign(data[infoHash], {
      announce: self.announceUrl,
      infoHash: common.binaryToHex(infoHash)
    })
    self.client.emit('scrape', response)
  })
}

WebSocketTracker.prototype._onSocketClose = function () {
  var self = this
  if (self.destroyed) return
  self.destroy()
  self._startReconnectTimer()
}

WebSocketTracker.prototype._onSocketError = function (err) {
  var self = this
  if (self.destroyed) return
  self.destroy()
  // errors will often happen if a tracker is offline, so don't treat it as fatal
  self.client.emit('warning', err)
  self._startReconnectTimer()
}

WebSocketTracker.prototype._startReconnectTimer = function () {
  var self = this
  var ms = Math.floor(Math.random() * RECONNECT_VARIANCE) + Math.min(Math.pow(2, self.retries) * RECONNECT_MINIMUM, RECONNECT_MAXIMUM)

  self.reconnecting = true
  clearTimeout(self.reconnectTimer)
  self.reconnectTimer = setTimeout(function () {
    self.retries++
    self._openSocket()
  }, ms)
  if (self.reconnectTimer.unref) self.reconnectTimer.unref()

  debug('reconnecting socket in %s ms', ms)
}

WebSocketTracker.prototype._send = function (params) {
  var self = this
  if (self.destroyed) return
  self.expectingResponse = true
  var message = JSON.stringify(params)
  debug('send %s', message)
  self.socket.send(message)
}

WebSocketTracker.prototype._generateOffers = function (numwant, cb) {
  var self = this
  var offers = []
  debug('generating %s offers', numwant)

  for (var i = 0; i < numwant; ++i) {
    generateOffer()
  }
  checkDone()

  function generateOffer () {
    var offerId = randombytes(20).toString('hex')
    debug('creating peer (from _generateOffers)')
    var peer = self.peers[offerId] = self._createPeer({ initiator: true })
    peer.once('signal', function (offer) {
      offers.push({
        offer: offer,
        offer_id: common.hexToBinary(offerId)
      })
      checkDone()
    })
    peer.trackerTimeout = setTimeout(function () {
      debug('tracker timeout: destroying peer')
      peer.trackerTimeout = null
      delete self.peers[offerId]
      peer.destroy()
    }, OFFER_TIMEOUT)
    if (peer.trackerTimeout.unref) peer.trackerTimeout.unref()
  }

  function checkDone () {
    if (offers.length === numwant) {
      debug('generated %s offers', numwant)
      cb(offers)
    }
  }
}

WebSocketTracker.prototype._createPeer = function (opts) {
  var self = this

  opts = Object.assign({
    trickle: false,
    config: self.client._rtcConfig,
    wrtc: self.client._wrtc
  }, opts)

  var peer = new Peer(opts)

  peer.once('error', onError)
  peer.once('connect', onConnect)

  return peer

  // Handle peer 'error' events that are fired *before* the peer is emitted in
  // a 'peer' event.
  function onError (err) {
    self.client.emit('warning', new Error('Connection error: ' + err.message))
    peer.destroy()
  }

  // Once the peer is emitted in a 'peer' event, then it's the consumer's
  // responsibility to listen for errors, so the listeners are removed here.
  function onConnect () {
    peer.removeListener('error', onError)
    peer.removeListener('connect', onConnect)
  }
}

function noop () {}

},{"../common":12,"./tracker":10,"debug":13,"inherits":30,"randombytes":54,"simple-peer":73,"simple-websocket":75,"xtend":113}],12:[function(require,module,exports){
/**
 * Functions/constants needed by both the client and server.
 */

var Buffer = require('safe-buffer').Buffer
var extend = require('xtend/mutable')

exports.DEFAULT_ANNOUNCE_PEERS = 50
exports.MAX_ANNOUNCE_PEERS = 82

exports.binaryToHex = function (str) {
  if (typeof str !== 'string') {
    str = String(str)
  }
  return Buffer.from(str, 'binary').toString('hex')
}

exports.hexToBinary = function (str) {
  if (typeof str !== 'string') {
    str = String(str)
  }
  return Buffer.from(str, 'hex').toString('binary')
}

var config = require('./common-node')
extend(exports, config)

},{"./common-node":118,"safe-buffer":70,"xtend/mutable":114}],13:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  '#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC',
  '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF',
  '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC',
  '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF',
  '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC',
  '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033',
  '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366',
  '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933',
  '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC',
  '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF',
  '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // Internet Explorer and Edge do not support colors.
  if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
    return false;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":14,"_process":130}],14:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * Active `debug` instances.
 */
exports.instances = [];

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  var prevTime;

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);
  debug.destroy = destroy;

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  exports.instances.push(debug);

  return debug;
}

function destroy () {
  var index = exports.instances.indexOf(this);
  if (index !== -1) {
    exports.instances.splice(index, 1);
    return true;
  } else {
    return false;
  }
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var i;
  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }

  for (i = 0; i < exports.instances.length; i++) {
    var instance = exports.instances[i];
    instance.enabled = exports.enabled(instance.namespace);
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  if (name[name.length - 1] === '*') {
    return true;
  }
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":45}],15:[function(require,module,exports){
(function (Buffer){
/* global Blob, FileReader */

module.exports = function blobToBuffer (blob, cb) {
  if (typeof Blob === 'undefined' || !(blob instanceof Blob)) {
    throw new Error('first argument must be a Blob')
  }
  if (typeof cb !== 'function') {
    throw new Error('second argument must be a function')
  }

  var reader = new FileReader()

  function onLoadEnd (e) {
    reader.removeEventListener('loadend', onLoadEnd, false)
    if (e.error) cb(e.error)
    else cb(null, new Buffer(reader.result))
  }

  reader.addEventListener('loadend', onLoadEnd, false)
  reader.readAsArrayBuffer(blob)
}

}).call(this,require("buffer").Buffer)
},{"buffer":119}],16:[function(require,module,exports){
(function (Buffer){
var inherits = require('inherits');
var Transform = require('readable-stream').Transform;
var defined = require('defined');

module.exports = Block;
inherits(Block, Transform);

function Block (size, opts) {
    if (!(this instanceof Block)) return new Block(size, opts);
    Transform.call(this);
    if (!opts) opts = {};
    if (typeof size === 'object') {
        opts = size;
        size = opts.size;
    }
    this.size = size || 512;
    
    if (opts.nopad) this._zeroPadding = false;
    else this._zeroPadding = defined(opts.zeroPadding, true);
    
    this._buffered = [];
    this._bufferedBytes = 0;
}

Block.prototype._transform = function (buf, enc, next) {
    this._bufferedBytes += buf.length;
    this._buffered.push(buf);
    
    while (this._bufferedBytes >= this.size) {
        var b = Buffer.concat(this._buffered);
        this._bufferedBytes -= this.size;
        this.push(b.slice(0, this.size));
        this._buffered = [ b.slice(this.size, b.length) ];
    }
    next();
};

Block.prototype._flush = function () {
    if (this._bufferedBytes && this._zeroPadding) {
        var zeroes = new Buffer(this.size - this._bufferedBytes);
        zeroes.fill(0);
        this._buffered.push(zeroes);
        this.push(Buffer.concat(this._buffered));
        this._buffered = null;
    }
    else if (this._bufferedBytes) {
        this.push(Buffer.concat(this._buffered));
        this._buffered = null;
    }
    this.push(null);
};

}).call(this,require("buffer").Buffer)
},{"buffer":119,"defined":24,"inherits":30,"readable-stream":64}],17:[function(require,module,exports){
module.exports = {
  "100": "Continue",
  "101": "Switching Protocols",
  "102": "Processing",
  "200": "OK",
  "201": "Created",
  "202": "Accepted",
  "203": "Non-Authoritative Information",
  "204": "No Content",
  "205": "Reset Content",
  "206": "Partial Content",
  "207": "Multi-Status",
  "208": "Already Reported",
  "226": "IM Used",
  "300": "Multiple Choices",
  "301": "Moved Permanently",
  "302": "Found",
  "303": "See Other",
  "304": "Not Modified",
  "305": "Use Proxy",
  "307": "Temporary Redirect",
  "308": "Permanent Redirect",
  "400": "Bad Request",
  "401": "Unauthorized",
  "402": "Payment Required",
  "403": "Forbidden",
  "404": "Not Found",
  "405": "Method Not Allowed",
  "406": "Not Acceptable",
  "407": "Proxy Authentication Required",
  "408": "Request Timeout",
  "409": "Conflict",
  "410": "Gone",
  "411": "Length Required",
  "412": "Precondition Failed",
  "413": "Payload Too Large",
  "414": "URI Too Long",
  "415": "Unsupported Media Type",
  "416": "Range Not Satisfiable",
  "417": "Expectation Failed",
  "418": "I'm a teapot",
  "421": "Misdirected Request",
  "422": "Unprocessable Entity",
  "423": "Locked",
  "424": "Failed Dependency",
  "425": "Unordered Collection",
  "426": "Upgrade Required",
  "428": "Precondition Required",
  "429": "Too Many Requests",
  "431": "Request Header Fields Too Large",
  "451": "Unavailable For Legal Reasons",
  "500": "Internal Server Error",
  "501": "Not Implemented",
  "502": "Bad Gateway",
  "503": "Service Unavailable",
  "504": "Gateway Timeout",
  "505": "HTTP Version Not Supported",
  "506": "Variant Also Negotiates",
  "507": "Insufficient Storage",
  "508": "Loop Detected",
  "509": "Bandwidth Limit Exceeded",
  "510": "Not Extended",
  "511": "Network Authentication Required"
}

},{}],18:[function(require,module,exports){
module.exports = ChunkStoreWriteStream

var BlockStream = require('block-stream2')
var inherits = require('inherits')
var stream = require('readable-stream')

inherits(ChunkStoreWriteStream, stream.Writable)

function ChunkStoreWriteStream (store, chunkLength, opts) {
  var self = this
  if (!(self instanceof ChunkStoreWriteStream)) {
    return new ChunkStoreWriteStream(store, chunkLength, opts)
  }
  stream.Writable.call(self, opts)
  if (!opts) opts = {}

  if (!store || !store.put || !store.get) {
    throw new Error('First argument must be an abstract-chunk-store compliant store')
  }
  chunkLength = Number(chunkLength)
  if (!chunkLength) throw new Error('Second argument must be a chunk length')

  self._blockstream = new BlockStream(chunkLength, { zeroPadding: false })

  self._blockstream
    .on('data', onData)
    .on('error', function (err) { self.destroy(err) })

  var index = 0
  function onData (chunk) {
    if (self.destroyed) return
    store.put(index, chunk)
    index += 1
  }

  self.on('finish', function () { this._blockstream.end() })
}

ChunkStoreWriteStream.prototype._write = function (chunk, encoding, callback) {
  this._blockstream.write(chunk, encoding, callback)
}

ChunkStoreWriteStream.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true

  if (err) this.emit('error', err)
  this.emit('close')
}

},{"block-stream2":16,"inherits":30,"readable-stream":64}],19:[function(require,module,exports){
var abs = Math.abs

module.exports = closest

function closest (n, arr, rndx) {
  var i, ndx, diff, best = Infinity
  var low = 0, high = arr.length - 1
  while (low <= high) {
    i = low + (high - low >> 1)
    diff = arr[i] - n
    diff < 0 ? low = i + 1 :
    diff > 0 ? high = i - 1 : void 0
    diff = abs(diff)
    if (diff < best) best = diff, ndx = i
    if (arr[i] === n) break
  }
  return rndx ? ndx : arr[ndx]
}

},{}],20:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../../../../../../usr/local/lib/node_modules/browserify/node_modules/is-buffer/index.js")})
},{"../../../../../../../usr/local/lib/node_modules/browserify/node_modules/is-buffer/index.js":126}],21:[function(require,module,exports){
(function (process,global,Buffer){
module.exports = createTorrent
module.exports.parseInput = parseInput

module.exports.announceList = [
  [ 'udp://tracker.leechers-paradise.org:6969' ],
  [ 'udp://tracker.coppersurfer.tk:6969' ],
  [ 'udp://tracker.opentrackr.org:1337' ],
  [ 'udp://explodie.org:6969' ],
  [ 'udp://tracker.empire-js.us:1337' ],
  [ 'wss://tracker.btorrent.xyz' ],
  [ 'wss://tracker.openwebtorrent.com' ],
  [ 'wss://tracker.fastcast.nz' ]
]

var bencode = require('bencode')
var BlockStream = require('block-stream2')
var calcPieceLength = require('piece-length')
var corePath = require('path')
var extend = require('xtend')
var FileReadStream = require('filestream/read')
var flatten = require('flatten')
var fs = require('fs')
var isFile = require('is-file')
var junk = require('junk')
var MultiStream = require('multistream')
var once = require('once')
var parallel = require('run-parallel')
var sha1 = require('simple-sha1')
var stream = require('readable-stream')

/**
 * Create a torrent.
 * @param  {string|File|FileList|Buffer|Stream|Array.<string|File|Buffer|Stream>} input
 * @param  {Object} opts
 * @param  {string=} opts.name
 * @param  {Date=} opts.creationDate
 * @param  {string=} opts.comment
 * @param  {string=} opts.createdBy
 * @param  {boolean|number=} opts.private
 * @param  {number=} opts.pieceLength
 * @param  {Array.<Array.<string>>=} opts.announceList
 * @param  {Array.<string>=} opts.urlList
 * @param  {function} cb
 * @return {Buffer} buffer of .torrent file data
 */
function createTorrent (input, opts, cb) {
  if (typeof opts === 'function') return createTorrent(input, null, opts)
  opts = opts ? extend(opts) : {}

  _parseInput(input, opts, function (err, files, singleFileTorrent) {
    if (err) return cb(err)
    opts.singleFileTorrent = singleFileTorrent
    onFiles(files, opts, cb)
  })
}

function parseInput (input, opts, cb) {
  if (typeof opts === 'function') return parseInput(input, null, opts)
  opts = opts ? extend(opts) : {}
  _parseInput(input, opts, cb)
}

/**
 * Parse input file and return file information.
 */
function _parseInput (input, opts, cb) {
  if (Array.isArray(input) && input.length === 0) throw new Error('invalid input type')

  if (isFileList(input)) input = Array.prototype.slice.call(input)
  if (!Array.isArray(input)) input = [ input ]

  // In Electron, use the true file path
  input = input.map(function (item) {
    if (isBlob(item) && typeof item.path === 'string' && typeof fs.stat === 'function') return item.path
    return item
  })

  // If there's just one file, allow the name to be set by `opts.name`
  if (input.length === 1 && typeof input[0] !== 'string' && !input[0].name) input[0].name = opts.name

  var commonPrefix = null
  input.forEach(function (item, i) {
    if (typeof item === 'string') {
      return
    }

    var path = item.fullPath || item.name
    if (!path) {
      path = 'Unknown File ' + (i + 1)
      item.unknownName = true
    }

    item.path = path.split('/')

    // Remove initial slash
    if (!item.path[0]) {
      item.path.shift()
    }

    if (item.path.length < 2) { // No real prefix
      commonPrefix = null
    } else if (i === 0 && input.length > 1) { // The first file has a prefix
      commonPrefix = item.path[0]
    } else if (item.path[0] !== commonPrefix) { // The prefix doesn't match
      commonPrefix = null
    }
  })

  // remove junk files
  input = input.filter(function (item) {
    if (typeof item === 'string') {
      return true
    }
    var filename = item.path[item.path.length - 1]
    return notHidden(filename) && junk.not(filename)
  })

  if (commonPrefix) {
    input.forEach(function (item) {
      var pathless = (Buffer.isBuffer(item) || isReadable(item)) && !item.path
      if (typeof item === 'string' || pathless) return
      item.path.shift()
    })
  }

  if (!opts.name && commonPrefix) {
    opts.name = commonPrefix
  }

  if (!opts.name) {
    // use first user-set file name
    input.some(function (item) {
      if (typeof item === 'string') {
        opts.name = corePath.basename(item)
        return true
      } else if (!item.unknownName) {
        opts.name = item.path[item.path.length - 1]
        return true
      }
    })
  }

  if (!opts.name) {
    opts.name = 'Unnamed Torrent ' + Date.now()
  }

  var numPaths = input.reduce(function (sum, item) {
    return sum + Number(typeof item === 'string')
  }, 0)

  var isSingleFileTorrent = (input.length === 1)

  if (input.length === 1 && typeof input[0] === 'string') {
    if (typeof fs.stat !== 'function') {
      throw new Error('filesystem paths do not work in the browser')
    }
    // If there's a single path, verify it's a file before deciding this is a single
    // file torrent
    isFile(input[0], function (err, pathIsFile) {
      if (err) return cb(err)
      isSingleFileTorrent = pathIsFile
      processInput()
    })
  } else {
    process.nextTick(function () {
      processInput()
    })
  }

  function processInput () {
    parallel(input.map(function (item) {
      return function (cb) {
        var file = {}

        if (isBlob(item)) {
          file.getStream = getBlobStream(item)
          file.length = item.size
        } else if (Buffer.isBuffer(item)) {
          file.getStream = getBufferStream(item)
          file.length = item.length
        } else if (isReadable(item)) {
          file.getStream = getStreamStream(item, file)
          file.length = 0
        } else if (typeof item === 'string') {
          if (typeof fs.stat !== 'function') {
            throw new Error('filesystem paths do not work in the browser')
          }
          var keepRoot = numPaths > 1 || isSingleFileTorrent
          getFiles(item, keepRoot, cb)
          return // early return!
        } else {
          throw new Error('invalid input type')
        }
        file.path = item.path
        cb(null, file)
      }
    }), function (err, files) {
      if (err) return cb(err)
      files = flatten(files)
      cb(null, files, isSingleFileTorrent)
    })
  }
}

function getFiles (path, keepRoot, cb) {
  traversePath(path, getFileInfo, function (err, files) {
    if (err) return cb(err)

    if (Array.isArray(files)) files = flatten(files)
    else files = [ files ]

    path = corePath.normalize(path)
    if (keepRoot) {
      path = path.slice(0, path.lastIndexOf(corePath.sep) + 1)
    }
    if (path[path.length - 1] !== corePath.sep) path += corePath.sep

    files.forEach(function (file) {
      file.getStream = getFilePathStream(file.path)
      file.path = file.path.replace(path, '').split(corePath.sep)
    })
    cb(null, files)
  })
}

function getFileInfo (path, cb) {
  cb = once(cb)
  fs.stat(path, function (err, stat) {
    if (err) return cb(err)
    var info = {
      length: stat.size,
      path: path
    }
    cb(null, info)
  })
}

function traversePath (path, fn, cb) {
  fs.stat(path, function (err, stats) {
    if (err) return cb(err)
    if (stats.isDirectory()) {
      fs.readdir(path, function (err, entries) {
        if (err) return cb(err)
        parallel(entries.filter(notHidden).filter(junk.not).map(function (entry) {
          return function (cb) {
            traversePath(corePath.join(path, entry), fn, cb)
          }
        }), cb)
      })
    } else if (stats.isFile()) {
      fn(path, cb)
    }
    // Ignore other types (not a file or directory)
  })
}

function notHidden (file) {
  return file[0] !== '.'
}

function getPieceList (files, pieceLength, cb) {
  cb = once(cb)
  var pieces = []
  var length = 0

  var streams = files.map(function (file) {
    return file.getStream
  })

  var remainingHashes = 0
  var pieceNum = 0
  var ended = false

  var multistream = new MultiStream(streams)
  var blockstream = new BlockStream(pieceLength, { zeroPadding: false })

  multistream.on('error', onError)

  multistream
    .pipe(blockstream)
    .on('data', onData)
    .on('end', onEnd)
    .on('error', onError)

  function onData (chunk) {
    length += chunk.length

    var i = pieceNum
    sha1(chunk, function (hash) {
      pieces[i] = hash
      remainingHashes -= 1
      maybeDone()
    })
    remainingHashes += 1
    pieceNum += 1
  }

  function onEnd () {
    ended = true
    maybeDone()
  }

  function onError (err) {
    cleanup()
    cb(err)
  }

  function cleanup () {
    multistream.removeListener('error', onError)
    blockstream.removeListener('data', onData)
    blockstream.removeListener('end', onEnd)
    blockstream.removeListener('error', onError)
  }

  function maybeDone () {
    if (ended && remainingHashes === 0) {
      cleanup()
      cb(null, Buffer.from(pieces.join(''), 'hex'), length)
    }
  }
}

function onFiles (files, opts, cb) {
  var announceList = opts.announceList

  if (!announceList) {
    if (typeof opts.announce === 'string') announceList = [ [ opts.announce ] ]
    else if (Array.isArray(opts.announce)) {
      announceList = opts.announce.map(function (u) { return [ u ] })
    }
  }

  if (!announceList) announceList = []

  if (global.WEBTORRENT_ANNOUNCE) {
    if (typeof global.WEBTORRENT_ANNOUNCE === 'string') {
      announceList.push([ [ global.WEBTORRENT_ANNOUNCE ] ])
    } else if (Array.isArray(global.WEBTORRENT_ANNOUNCE)) {
      announceList = announceList.concat(global.WEBTORRENT_ANNOUNCE.map(function (u) {
        return [ u ]
      }))
    }
  }

  // When no trackers specified, use some reasonable defaults
  if (opts.announce === undefined && opts.announceList === undefined) {
    announceList = announceList.concat(module.exports.announceList)
  }

  if (typeof opts.urlList === 'string') opts.urlList = [ opts.urlList ]

  var torrent = {
    info: {
      name: opts.name
    },
    'creation date': Math.ceil((Number(opts.creationDate) || Date.now()) / 1000),
    encoding: 'UTF-8'
  }

  if (announceList.length !== 0) {
    torrent.announce = announceList[0][0]
    torrent['announce-list'] = announceList
  }

  if (opts.comment !== undefined) torrent.comment = opts.comment

  if (opts.createdBy !== undefined) torrent['created by'] = opts.createdBy

  if (opts.private !== undefined) torrent.info.private = Number(opts.private)

  // "ssl-cert" key is for SSL torrents, see:
  //   - http://blog.libtorrent.org/2012/01/bittorrent-over-ssl/
  //   - http://www.libtorrent.org/manual-ref.html#ssl-torrents
  //   - http://www.libtorrent.org/reference-Create_Torrents.html
  if (opts.sslCert !== undefined) torrent.info['ssl-cert'] = opts.sslCert

  if (opts.urlList !== undefined) torrent['url-list'] = opts.urlList

  var pieceLength = opts.pieceLength || calcPieceLength(files.reduce(sumLength, 0))
  torrent.info['piece length'] = pieceLength

  getPieceList(files, pieceLength, function (err, pieces, torrentLength) {
    if (err) return cb(err)
    torrent.info.pieces = pieces

    files.forEach(function (file) {
      delete file.getStream
    })

    if (opts.singleFileTorrent) {
      torrent.info.length = torrentLength
    } else {
      torrent.info.files = files
    }

    cb(null, bencode.encode(torrent))
  })
}

/**
 * Accumulator to sum file lengths
 * @param  {number} sum
 * @param  {Object} file
 * @return {number}
 */
function sumLength (sum, file) {
  return sum + file.length
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob (obj) {
  return typeof Blob !== 'undefined' && obj instanceof Blob
}

/**
 * Check if `obj` is a W3C `FileList` object
 * @param  {*} obj
 * @return {boolean}
 */
function isFileList (obj) {
  return typeof FileList !== 'undefined' && obj instanceof FileList
}

/**
 * Check if `obj` is a node Readable stream
 * @param  {*} obj
 * @return {boolean}
 */
function isReadable (obj) {
  return typeof obj === 'object' && obj != null && typeof obj.pipe === 'function'
}

/**
 * Convert a `File` to a lazy readable stream.
 * @param  {File|Blob} file
 * @return {function}
 */
function getBlobStream (file) {
  return function () {
    return new FileReadStream(file)
  }
}

/**
 * Convert a `Buffer` to a lazy readable stream.
 * @param  {Buffer} buffer
 * @return {function}
 */
function getBufferStream (buffer) {
  return function () {
    var s = new stream.PassThrough()
    s.end(buffer)
    return s
  }
}

/**
 * Convert a file path to a lazy readable stream.
 * @param  {string} path
 * @return {function}
 */
function getFilePathStream (path) {
  return function () {
    return fs.createReadStream(path)
  }
}

/**
 * Convert a readable stream to a lazy readable stream. Adds instrumentation to track
 * the number of bytes in the stream and set `file.length`.
 *
 * @param  {Stream} stream
 * @param  {Object} file
 * @return {function}
 */
function getStreamStream (readable, file) {
  return function () {
    var counter = new stream.Transform()
    counter._transform = function (buf, enc, done) {
      file.length += buf.length
      this.push(buf)
      done()
    }
    readable.pipe(counter)
    return counter
  }
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"_process":130,"bencode":5,"block-stream2":16,"buffer":119,"filestream/read":26,"flatten":27,"fs":116,"is-file":32,"junk":35,"multistream":46,"once":48,"path":128,"piece-length":51,"readable-stream":64,"run-parallel":68,"simple-sha1":74,"xtend":113}],22:[function(require,module,exports){
(function (process){
/**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = require('./debug');
exports.log = log;
exports.formatArgs = formatArgs;
exports.save = save;
exports.load = load;
exports.useColors = useColors;
exports.storage = 'undefined' != typeof chrome
               && 'undefined' != typeof chrome.storage
                  ? chrome.storage.local
                  : localstorage();

/**
 * Colors.
 */

exports.colors = [
  'lightseagreen',
  'forestgreen',
  'goldenrod',
  'dodgerblue',
  'darkorchid',
  'crimson'
];

/**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */

function useColors() {
  // NB: In an Electron preload script, document will be defined but not fully
  // initialized. Since we know we're in Chrome, we'll just detect this case
  // explicitly
  if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
    return true;
  }

  // is webkit? http://stackoverflow.com/a/16459606/376773
  // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632
  return (typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance) ||
    // is firebug? http://stackoverflow.com/a/398120/376773
    (typeof window !== 'undefined' && window.console && (window.console.firebug || (window.console.exception && window.console.table))) ||
    // is firefox >= v31?
    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31) ||
    // double check webkit in userAgent just in case we are in a worker
    (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/));
}

/**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */

exports.formatters.j = function(v) {
  try {
    return JSON.stringify(v);
  } catch (err) {
    return '[UnexpectedJSONParseError]: ' + err.message;
  }
};


/**
 * Colorize log arguments if enabled.
 *
 * @api public
 */

function formatArgs(args) {
  var useColors = this.useColors;

  args[0] = (useColors ? '%c' : '')
    + this.namespace
    + (useColors ? ' %c' : ' ')
    + args[0]
    + (useColors ? '%c ' : ' ')
    + '+' + exports.humanize(this.diff);

  if (!useColors) return;

  var c = 'color: ' + this.color;
  args.splice(1, 0, c, 'color: inherit')

  // the final "%c" is somewhat tricky, because there could be other
  // arguments passed either before or after the %c, so we need to
  // figure out the correct index to insert the CSS into
  var index = 0;
  var lastC = 0;
  args[0].replace(/%[a-zA-Z%]/g, function(match) {
    if ('%%' === match) return;
    index++;
    if ('%c' === match) {
      // we only are interested in the *last* %c
      // (the user may have provided their own)
      lastC = index;
    }
  });

  args.splice(lastC, 0, c);
}

/**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */

function log() {
  // this hackery is required for IE8/9, where
  // the `console.log` function doesn't have 'apply'
  return 'object' === typeof console
    && console.log
    && Function.prototype.apply.call(console.log, console, arguments);
}

/**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */

function save(namespaces) {
  try {
    if (null == namespaces) {
      exports.storage.removeItem('debug');
    } else {
      exports.storage.debug = namespaces;
    }
  } catch(e) {}
}

/**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */

function load() {
  var r;
  try {
    r = exports.storage.debug;
  } catch(e) {}

  // If debug isn't set in LS, and we're in Electron, try to load $DEBUG
  if (!r && typeof process !== 'undefined' && 'env' in process) {
    r = process.env.DEBUG;
  }

  return r;
}

/**
 * Enable namespaces listed in `localStorage.debug` initially.
 */

exports.enable(load());

/**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */

function localstorage() {
  try {
    return window.localStorage;
  } catch (e) {}
}

}).call(this,require('_process'))
},{"./debug":23,"_process":130}],23:[function(require,module,exports){

/**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */

exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
exports.coerce = coerce;
exports.disable = disable;
exports.enable = enable;
exports.enabled = enabled;
exports.humanize = require('ms');

/**
 * The currently active debug mode names, and names to skip.
 */

exports.names = [];
exports.skips = [];

/**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
 */

exports.formatters = {};

/**
 * Previous log timestamp.
 */

var prevTime;

/**
 * Select a color.
 * @param {String} namespace
 * @return {Number}
 * @api private
 */

function selectColor(namespace) {
  var hash = 0, i;

  for (i in namespace) {
    hash  = ((hash << 5) - hash) + namespace.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }

  return exports.colors[Math.abs(hash) % exports.colors.length];
}

/**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */

function createDebug(namespace) {

  function debug() {
    // disabled?
    if (!debug.enabled) return;

    var self = debug;

    // set `diff` timestamp
    var curr = +new Date();
    var ms = curr - (prevTime || curr);
    self.diff = ms;
    self.prev = prevTime;
    self.curr = curr;
    prevTime = curr;

    // turn the `arguments` into a proper Array
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }

    args[0] = exports.coerce(args[0]);

    if ('string' !== typeof args[0]) {
      // anything else let's inspect with %O
      args.unshift('%O');
    }

    // apply any `formatters` transformations
    var index = 0;
    args[0] = args[0].replace(/%([a-zA-Z%])/g, function(match, format) {
      // if we encounter an escaped % then don't increase the array index
      if (match === '%%') return match;
      index++;
      var formatter = exports.formatters[format];
      if ('function' === typeof formatter) {
        var val = args[index];
        match = formatter.call(self, val);

        // now we need to remove `args[index]` since it's inlined in the `format`
        args.splice(index, 1);
        index--;
      }
      return match;
    });

    // apply env-specific formatting (colors, etc.)
    exports.formatArgs.call(self, args);

    var logFn = debug.log || exports.log || console.log.bind(console);
    logFn.apply(self, args);
  }

  debug.namespace = namespace;
  debug.enabled = exports.enabled(namespace);
  debug.useColors = exports.useColors();
  debug.color = selectColor(namespace);

  // env-specific initialization logic for debug instances
  if ('function' === typeof exports.init) {
    exports.init(debug);
  }

  return debug;
}

/**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */

function enable(namespaces) {
  exports.save(namespaces);

  exports.names = [];
  exports.skips = [];

  var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
  var len = split.length;

  for (var i = 0; i < len; i++) {
    if (!split[i]) continue; // ignore empty strings
    namespaces = split[i].replace(/\*/g, '.*?');
    if (namespaces[0] === '-') {
      exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
    } else {
      exports.names.push(new RegExp('^' + namespaces + '$'));
    }
  }
}

/**
 * Disable debug output.
 *
 * @api public
 */

function disable() {
  exports.enable('');
}

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

function enabled(name) {
  var i, len;
  for (i = 0, len = exports.skips.length; i < len; i++) {
    if (exports.skips[i].test(name)) {
      return false;
    }
  }
  for (i = 0, len = exports.names.length; i < len; i++) {
    if (exports.names[i].test(name)) {
      return true;
    }
  }
  return false;
}

/**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

},{"ms":45}],24:[function(require,module,exports){
module.exports = function () {
    for (var i = 0; i < arguments.length; i++) {
        if (arguments[i] !== undefined) return arguments[i];
    }
};

},{}],25:[function(require,module,exports){
var once = require('once');

var noop = function() {};

var isRequest = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos(stream, null, opts);
	if (!opts) opts = {};

	callback = once(callback || noop);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		if (readable && !(rs && rs.ended)) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && ws.ended)) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

module.exports = eos;

},{"once":48}],26:[function(require,module,exports){
var Readable = require('readable-stream').Readable;
var inherits = require('inherits');
var reExtension = /^.*\.(\w+)$/;
var toBuffer = require('typedarray-to-buffer');

function FileReadStream(file, opts) {
  var readStream = this;
  if (! (this instanceof FileReadStream)) {
    return new FileReadStream(file, opts);
  }
  opts = opts || {};

  // inherit readable
  Readable.call(this, opts);

  // save the read offset
  this._offset = 0;
  this._ready = false;
  this._file = file;
  this._size = file.size;
  this._chunkSize = opts.chunkSize || Math.max(this._size / 1000, 200 * 1024);

  // create the reader
  this.reader = new FileReader();

  // generate the header blocks that we will send as part of the initial payload
  this._generateHeaderBlocks(file, opts, function(err, blocks) {
    // if we encountered an error, emit it
    if (err) {
      return readStream.emit('error', err);
    }

    // push the header blocks out to the stream
    if (Array.isArray(blocks)) {
      blocks.forEach(function (block) {
        readStream.push(block);
      });
    }

    readStream._ready = true;
    readStream.emit('_ready');
  });
}

inherits(FileReadStream, Readable);
module.exports = FileReadStream;

FileReadStream.prototype._generateHeaderBlocks = function(file, opts, callback) {
  callback(null, []);
};

FileReadStream.prototype._read = function() {
  if (!this._ready) {
    this.once('_ready', this._read.bind(this));
    return;
  }
  var readStream = this;
  var reader = this.reader;

  var startOffset = this._offset;
  var endOffset = this._offset + this._chunkSize;
  if (endOffset > this._size) endOffset = this._size;

  if (startOffset === this._size) {
    this.destroy();
    this.push(null);
    return;
  }

  reader.onload = function() {
    // update the stream offset
    readStream._offset = endOffset;

    // get the data chunk
    readStream.push(toBuffer(reader.result));
  }
  reader.onerror = function() {
    readStream.emit('error', reader.error);
  }

  reader.readAsArrayBuffer(this._file.slice(startOffset, endOffset));
};

FileReadStream.prototype.destroy = function() {
  this._file = null;
  if (this.reader) {
    this.reader.onload = null;
    this.reader.onerror = null;
    try { this.reader.abort(); } catch (e) {};
  }
  this.reader = null;
}

},{"inherits":30,"readable-stream":64,"typedarray-to-buffer":92}],27:[function(require,module,exports){
module.exports = function flatten(list, depth) {
  depth = (typeof depth == 'number') ? depth : Infinity;

  if (!depth) {
    if (Array.isArray(list)) {
      return list.map(function(i) { return i; });
    }
    return list;
  }

  return _flatten(list, 1);

  function _flatten(list, d) {
    return list.reduce(function (acc, item) {
      if (Array.isArray(item) && d < depth) {
        return acc.concat(_flatten(item, d + 1));
      }
      else {
        return acc.concat(item);
      }
    }, []);
  }
};

},{}],28:[function(require,module,exports){
// originally pulled out of simple-peer

module.exports = function getBrowserRTC () {
  if (typeof window === 'undefined') return null
  var wrtc = {
    RTCPeerConnection: window.RTCPeerConnection || window.mozRTCPeerConnection ||
      window.webkitRTCPeerConnection,
    RTCSessionDescription: window.RTCSessionDescription ||
      window.mozRTCSessionDescription || window.webkitRTCSessionDescription,
    RTCIceCandidate: window.RTCIceCandidate || window.mozRTCIceCandidate ||
      window.webkitRTCIceCandidate
  }
  if (!wrtc.RTCPeerConnection) return null
  return wrtc
}

},{}],29:[function(require,module,exports){
(function (process){
module.exports = ImmediateStore

function ImmediateStore (store) {
  if (!(this instanceof ImmediateStore)) return new ImmediateStore(store)

  this.store = store
  this.chunkLength = store.chunkLength

  if (!this.store || !this.store.get || !this.store.put) {
    throw new Error('First argument must be abstract-chunk-store compliant')
  }

  this.mem = []
}

ImmediateStore.prototype.put = function (index, buf, cb) {
  var self = this
  self.mem[index] = buf
  self.store.put(index, buf, function (err) {
    self.mem[index] = null
    if (cb) cb(err)
  })
}

ImmediateStore.prototype.get = function (index, opts, cb) {
  if (typeof opts === 'function') return this.get(index, null, opts)

  var start = (opts && opts.offset) || 0
  var end = opts && opts.length && (start + opts.length)

  var buf = this.mem[index]
  if (buf) return nextTick(cb, null, opts ? buf.slice(start, end) : buf)

  this.store.get(index, opts, cb)
}

ImmediateStore.prototype.close = function (cb) {
  this.store.close(cb)
}

ImmediateStore.prototype.destroy = function (cb) {
  this.store.destroy(cb)
}

function nextTick (cb, err, val) {
  process.nextTick(function () {
    if (cb) cb(err, val)
  })
}

}).call(this,require('_process'))
},{"_process":130}],30:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],31:[function(require,module,exports){
/* (c) 2016 Ari Porad (@ariporad) <http://ariporad.com>. License: ariporad.mit-license.org */

// Partially from http://stackoverflow.com/a/94049/1928484, and from another SO answer, which told me that the highest
// char code that's ascii is 127, but I can't find the link for. Sorry.

var MAX_ASCII_CHAR_CODE = 127;

module.exports = function isAscii(str) {
  for (var i = 0, strLen = str.length; i < strLen; ++i) {
    if (str.charCodeAt(i) > MAX_ASCII_CHAR_CODE) return false;
  }
  return true;
};

},{}],32:[function(require,module,exports){
'use strict';

var fs = require('fs');

module.exports = function isFile(path, cb){
  if(!cb)return isFileSync(path);

  fs.stat(path, function(err, stats){
    if(err)return cb(err);
    return cb(null, stats.isFile());
  });
};

module.exports.sync = isFileSync;

function isFileSync(path){
  return fs.existsSync(path) && fs.statSync(path).isFile();
}

},{"fs":116}],33:[function(require,module,exports){
module.exports      = isTypedArray
isTypedArray.strict = isStrictTypedArray
isTypedArray.loose  = isLooseTypedArray

var toString = Object.prototype.toString
var names = {
    '[object Int8Array]': true
  , '[object Int16Array]': true
  , '[object Int32Array]': true
  , '[object Uint8Array]': true
  , '[object Uint8ClampedArray]': true
  , '[object Uint16Array]': true
  , '[object Uint32Array]': true
  , '[object Float32Array]': true
  , '[object Float64Array]': true
}

function isTypedArray(arr) {
  return (
       isStrictTypedArray(arr)
    || isLooseTypedArray(arr)
  )
}

function isStrictTypedArray(arr) {
  return (
       arr instanceof Int8Array
    || arr instanceof Int16Array
    || arr instanceof Int32Array
    || arr instanceof Uint8Array
    || arr instanceof Uint8ClampedArray
    || arr instanceof Uint16Array
    || arr instanceof Uint32Array
    || arr instanceof Float32Array
    || arr instanceof Float64Array
  )
}

function isLooseTypedArray(arr) {
  return names[toString.call(arr)]
}

},{}],34:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],35:[function(require,module,exports){
'use strict';

// # All
// /^npm-debug\.log$/,           // npm error log
// /^\..*\.swp$/,                // Vim state

// # macOS
// /^\.DS_Store$/,               // Stores custom folder attributes
// /^\.AppleDouble$/,            // Stores additional file resources
// /^\.LSOverride$/,             // Contains the absolute path to the app to be used
// /^Icon\r$/,                   // Custom Finder icon: http://superuser.com/questions/298785/icon-file-on-os-x-desktop
// /^\._.*/,                     // Thumbnail
// /^\.Spotlight-V100(?:$|\/)/,  // Directory that might appear on external disk
// /\.Trashes/,                  // File that might appear on external disk
// /^__MACOSX$/,                 // Resource fork

// # Linux
// /~$/,                         // Backup file

// # Windows
// /^Thumbs\.db$/,               // Image file cache
// /^ehthumbs\.db$/,             // Folder config file
// /^Desktop\.ini$/              // Stores custom folder attributes
// /^@eaDir$/                    // Synology Diskstation "hidden" folder where the server stores thumbnails

exports.regex = exports.re = /^npm-debug\.log$|^\..*\.swp$|^\.DS_Store$|^\.AppleDouble$|^\.LSOverride$|^Icon\r$|^\._.*|^\.Spotlight-V100(?:$|\/)|\.Trashes|^__MACOSX$|~$|^Thumbs\.db$|^ehthumbs\.db$|^Desktop\.ini$|^@eaDir$/;

exports.is = filename => exports.re.test(filename);

exports.not = filename => !exports.is(filename);

},{}],36:[function(require,module,exports){
module.exports = magnetURIDecode
module.exports.decode = magnetURIDecode
module.exports.encode = magnetURIEncode

var base32 = require('thirty-two')
var Buffer = require('safe-buffer').Buffer
var extend = require('xtend')
var uniq = require('uniq')

/**
 * Parse a magnet URI and return an object of keys/values
 *
 * @param  {string} uri
 * @return {Object} parsed uri
 */
function magnetURIDecode (uri) {
  var result = {}

  // Support 'magnet:' and 'stream-magnet:' uris
  var data = uri.split('magnet:?')[1]

  var params = (data && data.length >= 0)
    ? data.split('&')
    : []

  params.forEach(function (param) {
    var keyval = param.split('=')

    // This keyval is invalid, skip it
    if (keyval.length !== 2) return

    var key = keyval[0]
    var val = keyval[1]

    // Clean up torrent name
    if (key === 'dn') val = decodeURIComponent(val).replace(/\+/g, ' ')

    // Address tracker (tr), exact source (xs), and acceptable source (as) are encoded
    // URIs, so decode them
    if (key === 'tr' || key === 'xs' || key === 'as' || key === 'ws') {
      val = decodeURIComponent(val)
    }

    // Return keywords as an array
    if (key === 'kt') val = decodeURIComponent(val).split('+')

    // Cast file index (ix) to a number
    if (key === 'ix') val = Number(val)

    // If there are repeated parameters, return an array of values
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(val)
      } else {
        var old = result[key]
        result[key] = [old, val]
      }
    } else {
      result[key] = val
    }
  })

  // Convenience properties for parity with `parse-torrent-file` module
  var m
  if (result.xt) {
    var xts = Array.isArray(result.xt) ? result.xt : [ result.xt ]
    xts.forEach(function (xt) {
      if ((m = xt.match(/^urn:btih:(.{40})/))) {
        result.infoHash = m[1].toLowerCase()
      } else if ((m = xt.match(/^urn:btih:(.{32})/))) {
        var decodedStr = base32.decode(m[1])
        result.infoHash = Buffer.from(decodedStr, 'binary').toString('hex')
      }
    })
  }
  if (result.infoHash) result.infoHashBuffer = Buffer.from(result.infoHash, 'hex')

  if (result.dn) result.name = result.dn
  if (result.kt) result.keywords = result.kt

  if (typeof result.tr === 'string') result.announce = [ result.tr ]
  else if (Array.isArray(result.tr)) result.announce = result.tr
  else result.announce = []

  result.urlList = []
  if (typeof result.as === 'string' || Array.isArray(result.as)) {
    result.urlList = result.urlList.concat(result.as)
  }
  if (typeof result.ws === 'string' || Array.isArray(result.ws)) {
    result.urlList = result.urlList.concat(result.ws)
  }

  uniq(result.announce)
  uniq(result.urlList)

  return result
}

function magnetURIEncode (obj) {
  obj = extend(obj) // clone obj, so we can mutate it

  // support using convenience names, in addition to spec names
  // (example: `infoHash` for `xt`, `name` for `dn`)
  if (obj.infoHashBuffer) obj.xt = 'urn:btih:' + obj.infoHashBuffer.toString('hex')
  if (obj.infoHash) obj.xt = 'urn:btih:' + obj.infoHash
  if (obj.name) obj.dn = obj.name
  if (obj.keywords) obj.kt = obj.keywords
  if (obj.announce) obj.tr = obj.announce
  if (obj.urlList) {
    obj.ws = obj.urlList
    delete obj.as
  }

  var result = 'magnet:?'
  Object.keys(obj)
    .filter(function (key) {
      return key.length === 2
    })
    .forEach(function (key, i) {
      var values = Array.isArray(obj[key]) ? obj[key] : [ obj[key] ]
      values.forEach(function (val, j) {
        if ((i > 0 || j > 0) && (key !== 'kt' || j === 0)) result += '&'

        if (key === 'dn') val = encodeURIComponent(val).replace(/%20/g, '+')
        if (key === 'tr' || key === 'xs' || key === 'as' || key === 'ws') {
          val = encodeURIComponent(val)
        }
        if (key === 'kt') val = encodeURIComponent(val)

        if (key === 'kt' && j > 0) result += '+' + val
        else result += key + '=' + val
      })
    })

  return result
}

},{"safe-buffer":70,"thirty-two":87,"uniq":94,"xtend":113}],37:[function(require,module,exports){
module.exports = MediaElementWrapper

var inherits = require('inherits')
var stream = require('readable-stream')
var toArrayBuffer = require('to-arraybuffer')

var MediaSource = typeof window !== 'undefined' && window.MediaSource

var DEFAULT_BUFFER_DURATION = 60 // seconds

function MediaElementWrapper (elem, opts) {
  var self = this
  if (!(self instanceof MediaElementWrapper)) return new MediaElementWrapper(elem, opts)

  if (!MediaSource) throw new Error('web browser lacks MediaSource support')

  if (!opts) opts = {}
  self._bufferDuration = opts.bufferDuration || DEFAULT_BUFFER_DURATION
  self._elem = elem
  self._mediaSource = new MediaSource()
  self._streams = []
  self.detailedError = null

  self._errorHandler = function () {
    self._elem.removeEventListener('error', self._errorHandler)
    var streams = self._streams.slice()
    streams.forEach(function (stream) {
      stream.destroy(self._elem.error)
    })
  }
  self._elem.addEventListener('error', self._errorHandler)

  self._elem.src = window.URL.createObjectURL(self._mediaSource)
}

/*
 * `obj` can be a previous value returned by this function
 * or a string
 */
MediaElementWrapper.prototype.createWriteStream = function (obj) {
  var self = this

  return new MediaSourceStream(self, obj)
}

/*
 * Use to trigger an error on the underlying media element
 */
MediaElementWrapper.prototype.error = function (err) {
  var self = this

  // be careful not to overwrite any existing detailedError values
  if (!self.detailedError) {
    self.detailedError = err
  }
  try {
    self._mediaSource.endOfStream('decode')
  } catch (err) {}
}

inherits(MediaSourceStream, stream.Writable)

function MediaSourceStream (wrapper, obj) {
  var self = this
  stream.Writable.call(self)

  self._wrapper = wrapper
  self._elem = wrapper._elem
  self._mediaSource = wrapper._mediaSource
  self._allStreams = wrapper._streams
  self._allStreams.push(self)
  self._bufferDuration = wrapper._bufferDuration
  self._sourceBuffer = null

  self._openHandler = function () {
    self._onSourceOpen()
  }
  self._flowHandler = function () {
    self._flow()
  }

  if (typeof obj === 'string') {
    self._type = obj
    // Need to create a new sourceBuffer
    if (self._mediaSource.readyState === 'open') {
      self._createSourceBuffer()
    } else {
      self._mediaSource.addEventListener('sourceopen', self._openHandler)
    }
  } else if (obj._sourceBuffer === null) {
    obj.destroy()
    self._type = obj._type // The old stream was created but hasn't finished initializing
    self._mediaSource.addEventListener('sourceopen', self._openHandler)
  } else if (obj._sourceBuffer) {
    obj.destroy()
    self._type = obj._type
    self._sourceBuffer = obj._sourceBuffer // Copy over the old sourceBuffer
    self._sourceBuffer.addEventListener('updateend', self._flowHandler)
  } else {
    throw new Error('The argument to MediaElementWrapper.createWriteStream must be a string or a previous stream returned from that function')
  }

  self._elem.addEventListener('timeupdate', self._flowHandler)

  self.on('error', function (err) {
    self._wrapper.error(err)
  })

  self.on('finish', function () {
    if (self.destroyed) return
    self._finished = true
    if (self._allStreams.every(function (other) { return other._finished })) {
      try {
        self._mediaSource.endOfStream()
      } catch (err) {}
    }
  })
}

MediaSourceStream.prototype._onSourceOpen = function () {
  var self = this
  if (self.destroyed) return

  self._mediaSource.removeEventListener('sourceopen', self._openHandler)
  self._createSourceBuffer()
}

MediaSourceStream.prototype.destroy = function (err) {
  var self = this
  if (self.destroyed) return
  self.destroyed = true

  // Remove from allStreams
  self._allStreams.splice(self._allStreams.indexOf(self), 1)

  self._mediaSource.removeEventListener('sourceopen', self._openHandler)
  self._elem.removeEventListener('timeupdate', self._flowHandler)
  if (self._sourceBuffer) {
    self._sourceBuffer.removeEventListener('updateend', self._flowHandler)
    if (self._mediaSource.readyState === 'open') {
      self._sourceBuffer.abort()
    }
  }

  if (err) self.emit('error', err)
  self.emit('close')
}

MediaSourceStream.prototype._createSourceBuffer = function () {
  var self = this
  if (self.destroyed) return

  if (MediaSource.isTypeSupported(self._type)) {
    self._sourceBuffer = self._mediaSource.addSourceBuffer(self._type)
    self._sourceBuffer.addEventListener('updateend', self._flowHandler)
    if (self._cb) {
      var cb = self._cb
      self._cb = null
      cb()
    }
  } else {
    self.destroy(new Error('The provided type is not supported'))
  }
}

MediaSourceStream.prototype._write = function (chunk, encoding, cb) {
  var self = this
  if (self.destroyed) return
  if (!self._sourceBuffer) {
    self._cb = function (err) {
      if (err) return cb(err)
      self._write(chunk, encoding, cb)
    }
    return
  }

  if (self._sourceBuffer.updating) {
    return cb(new Error('Cannot append buffer while source buffer updating'))
  }

  try {
    self._sourceBuffer.appendBuffer(toArrayBuffer(chunk))
  } catch (err) {
    // appendBuffer can throw for a number of reasons, most notably when the data
    // being appended is invalid or if appendBuffer is called after another error
    // already occurred on the media element. In Chrome, there may be useful debugging
    // info in chrome://media-internals
    self.destroy(err)
    return
  }
  self._cb = cb
}

MediaSourceStream.prototype._flow = function () {
  var self = this

  if (self.destroyed || !self._sourceBuffer || self._sourceBuffer.updating) {
    return
  }

  if (self._mediaSource.readyState === 'open') {
    // check buffer size
    if (self._getBufferDuration() > self._bufferDuration) {
      return
    }
  }

  if (self._cb) {
    var cb = self._cb
    self._cb = null
    cb()
  }
}

// TODO: if zero actually works in all browsers, remove the logic associated with this below
var EPSILON = 0

MediaSourceStream.prototype._getBufferDuration = function () {
  var self = this

  var buffered = self._sourceBuffer.buffered
  var currentTime = self._elem.currentTime
  var bufferEnd = -1 // end of the buffer
  // This is a little over complex because some browsers seem to separate the
  // buffered region into multiple sections with slight gaps.
  for (var i = 0; i < buffered.length; i++) {
    var start = buffered.start(i)
    var end = buffered.end(i) + EPSILON

    if (start > currentTime) {
      // Reached past the joined buffer
      break
    } else if (bufferEnd >= 0 || currentTime <= end) {
      // Found the start/continuation of the joined buffer
      bufferEnd = end
    }
  }

  var bufferedTime = bufferEnd - currentTime
  if (bufferedTime < 0) {
    bufferedTime = 0
  }

  return bufferedTime
}

},{"inherits":30,"readable-stream":64,"to-arraybuffer":89}],38:[function(require,module,exports){
(function (process){
module.exports = Storage

function Storage (chunkLength, opts) {
  if (!(this instanceof Storage)) return new Storage(chunkLength, opts)
  if (!opts) opts = {}

  this.chunkLength = Number(chunkLength)
  if (!this.chunkLength) throw new Error('First argument must be a chunk length')

  this.chunks = []
  this.closed = false
  this.length = Number(opts.length) || Infinity

  if (this.length !== Infinity) {
    this.lastChunkLength = (this.length % this.chunkLength) || this.chunkLength
    this.lastChunkIndex = Math.ceil(this.length / this.chunkLength) - 1
  }
}

Storage.prototype.put = function (index, buf, cb) {
  if (this.closed) return nextTick(cb, new Error('Storage is closed'))

  var isLastChunk = (index === this.lastChunkIndex)
  if (isLastChunk && buf.length !== this.lastChunkLength) {
    return nextTick(cb, new Error('Last chunk length must be ' + this.lastChunkLength))
  }
  if (!isLastChunk && buf.length !== this.chunkLength) {
    return nextTick(cb, new Error('Chunk length must be ' + this.chunkLength))
  }
  this.chunks[index] = buf
  nextTick(cb, null)
}

Storage.prototype.get = function (index, opts, cb) {
  if (typeof opts === 'function') return this.get(index, null, opts)
  if (this.closed) return nextTick(cb, new Error('Storage is closed'))
  var buf = this.chunks[index]
  if (!buf) {
    var err = new Error('Chunk not found')
    err.notFound = true
    return nextTick(cb, err)
  }
  if (!opts) return nextTick(cb, null, buf)
  var offset = opts.offset || 0
  var len = opts.length || (buf.length - offset)
  nextTick(cb, null, buf.slice(offset, len + offset))
}

Storage.prototype.close = Storage.prototype.destroy = function (cb) {
  if (this.closed) return nextTick(cb, new Error('Storage is closed'))
  this.closed = true
  this.chunks = null
  nextTick(cb, null)
}

function nextTick (cb, err, val) {
  process.nextTick(function () {
    if (cb) cb(err, val)
  })
}

}).call(this,require('_process'))
},{"_process":130}],39:[function(require,module,exports){
(function (Buffer){
// This is an intentionally recursive require. I don't like it either.
var Box = require('./index')
var Descriptor = require('./descriptor')

var TIME_OFFSET = 2082844800000

/*
TODO:
test these
add new box versions
*/

// These have 'version' and 'flags' fields in the headers
exports.fullBoxes = {}
var fullBoxes = [
  'mvhd',
  'tkhd',
  'mdhd',
  'vmhd',
  'smhd',
  'stsd',
  'esds',
  'stsz',
  'stco',
  'stss',
  'stts',
  'ctts',
  'stsc',
  'dref',
  'elst',
  'hdlr',
  'mehd',
  'trex',
  'mfhd',
  'tfhd',
  'tfdt',
  'trun'
]
fullBoxes.forEach(function (type) {
  exports.fullBoxes[type] = true
})

exports.ftyp = {}
exports.ftyp.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(exports.ftyp.encodingLength(box))
  var brands = box.compatibleBrands || []
  buf.write(box.brand, 0, 4, 'ascii')
  buf.writeUInt32BE(box.brandVersion, 4)
  for (var i = 0; i < brands.length; i++) buf.write(brands[i], 8 + (i * 4), 4, 'ascii')
  exports.ftyp.encode.bytes = 8 + brands.length * 4
  return buf
}
exports.ftyp.decode = function (buf, offset) {
  buf = buf.slice(offset)
  var brand = buf.toString('ascii', 0, 4)
  var version = buf.readUInt32BE(4)
  var compatibleBrands = []
  for (var i = 8; i < buf.length; i += 4) compatibleBrands.push(buf.toString('ascii', i, i + 4))
  return {
    brand: brand,
    brandVersion: version,
    compatibleBrands: compatibleBrands
  }
}
exports.ftyp.encodingLength = function (box) {
  return 8 + (box.compatibleBrands || []).length * 4
}

exports.mvhd = {}
exports.mvhd.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(96)
  writeDate(box.ctime || new Date(), buf, 0)
  writeDate(box.mtime || new Date(), buf, 4)
  buf.writeUInt32BE(box.timeScale || 0, 8)
  buf.writeUInt32BE(box.duration || 0, 12)
  writeFixed32(box.preferredRate || 0, buf, 16)
  writeFixed16(box.preferredVolume || 0, buf, 20)
  writeReserved(buf, 22, 32)
  writeMatrix(box.matrix, buf, 32)
  buf.writeUInt32BE(box.previewTime || 0, 68)
  buf.writeUInt32BE(box.previewDuration || 0, 72)
  buf.writeUInt32BE(box.posterTime || 0, 76)
  buf.writeUInt32BE(box.selectionTime || 0, 80)
  buf.writeUInt32BE(box.selectionDuration || 0, 84)
  buf.writeUInt32BE(box.currentTime || 0, 88)
  buf.writeUInt32BE(box.nextTrackId || 0, 92)
  exports.mvhd.encode.bytes = 96
  return buf
}
exports.mvhd.decode = function (buf, offset) {
  buf = buf.slice(offset)
  return {
    ctime: readDate(buf, 0),
    mtime: readDate(buf, 4),
    timeScale: buf.readUInt32BE(8),
    duration: buf.readUInt32BE(12),
    preferredRate: readFixed32(buf, 16),
    preferredVolume: readFixed16(buf, 20),
    matrix: readMatrix(buf.slice(32, 68)),
    previewTime: buf.readUInt32BE(68),
    previewDuration: buf.readUInt32BE(72),
    posterTime: buf.readUInt32BE(76),
    selectionTime: buf.readUInt32BE(80),
    selectionDuration: buf.readUInt32BE(84),
    currentTime: buf.readUInt32BE(88),
    nextTrackId: buf.readUInt32BE(92)
  }
}
exports.mvhd.encodingLength = function (box) {
  return 96
}

exports.tkhd = {}
exports.tkhd.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(80)
  writeDate(box.ctime || new Date(), buf, 0)
  writeDate(box.mtime || new Date(), buf, 4)
  buf.writeUInt32BE(box.trackId || 0, 8)
  writeReserved(buf, 12, 16)
  buf.writeUInt32BE(box.duration || 0, 16)
  writeReserved(buf, 20, 28)
  buf.writeUInt16BE(box.layer || 0, 28)
  buf.writeUInt16BE(box.alternateGroup || 0, 30)
  buf.writeUInt16BE(box.volume || 0, 32)
  writeMatrix(box.matrix, buf, 36)
  buf.writeUInt32BE(box.trackWidth || 0, 72)
  buf.writeUInt32BE(box.trackHeight || 0, 76)
  exports.tkhd.encode.bytes = 80
  return buf
}
exports.tkhd.decode = function (buf, offset) {
  buf = buf.slice(offset)
  return {
    ctime: readDate(buf, 0),
    mtime: readDate(buf, 4),
    trackId: buf.readUInt32BE(8),
    duration: buf.readUInt32BE(16),
    layer: buf.readUInt16BE(28),
    alternateGroup: buf.readUInt16BE(30),
    volume: buf.readUInt16BE(32),
    matrix: readMatrix(buf.slice(36, 72)),
    trackWidth: buf.readUInt32BE(72),
    trackHeight: buf.readUInt32BE(76)
  }
}
exports.tkhd.encodingLength = function (box) {
  return 80
}

exports.mdhd = {}
exports.mdhd.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(20)
  writeDate(box.ctime || new Date(), buf, 0)
  writeDate(box.mtime || new Date(), buf, 4)
  buf.writeUInt32BE(box.timeScale || 0, 8)
  buf.writeUInt32BE(box.duration || 0, 12)
  buf.writeUInt16BE(box.language || 0, 16)
  buf.writeUInt16BE(box.quality || 0, 18)
  exports.mdhd.encode.bytes = 20
  return buf
}
exports.mdhd.decode = function (buf, offset) {
  buf = buf.slice(offset)
  return {
    ctime: readDate(buf, 0),
    mtime: readDate(buf, 4),
    timeScale: buf.readUInt32BE(8),
    duration: buf.readUInt32BE(12),
    language: buf.readUInt16BE(16),
    quality: buf.readUInt16BE(18)
  }
}
exports.mdhd.encodingLength = function (box) {
  return 20
}

exports.vmhd = {}
exports.vmhd.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(8)
  buf.writeUInt16BE(box.graphicsMode || 0, 0)
  var opcolor = box.opcolor || [0, 0, 0]
  buf.writeUInt16BE(opcolor[0], 2)
  buf.writeUInt16BE(opcolor[1], 4)
  buf.writeUInt16BE(opcolor[2], 6)
  exports.vmhd.encode.bytes = 8
  return buf
}
exports.vmhd.decode = function (buf, offset) {
  buf = buf.slice(offset)
  return {
    graphicsMode: buf.readUInt16BE(0),
    opcolor: [buf.readUInt16BE(2), buf.readUInt16BE(4), buf.readUInt16BE(6)]
  }
}
exports.vmhd.encodingLength = function (box) {
  return 8
}

exports.smhd = {}
exports.smhd.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(4)
  buf.writeUInt16BE(box.balance || 0, 0)
  writeReserved(buf, 2, 4)
  exports.smhd.encode.bytes = 4
  return buf
}
exports.smhd.decode = function (buf, offset) {
  buf = buf.slice(offset)
  return {
    balance: buf.readUInt16BE(0)
  }
}
exports.smhd.encodingLength = function (box) {
  return 4
}

exports.stsd = {}
exports.stsd.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(exports.stsd.encodingLength(box))
  var entries = box.entries || []

  buf.writeUInt32BE(entries.length, 0)

  var ptr = 4
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i]
    Box.encode(entry, buf, ptr)
    ptr += Box.encode.bytes
  }

  exports.stsd.encode.bytes = ptr
  return buf
}
exports.stsd.decode = function (buf, offset, end) {
  buf = buf.slice(offset)
  var num = buf.readUInt32BE(0)
  var entries = new Array(num)
  var ptr = 4

  for (var i = 0; i < num; i++) {
    var entry = Box.decode(buf, ptr, end)
    entries[i] = entry
    ptr += entry.length
  }

  return {
    entries: entries
  }
}
exports.stsd.encodingLength = function (box) {
  var totalSize = 4
  if (!box.entries) return totalSize
  for (var i = 0; i < box.entries.length; i++) {
    totalSize += Box.encodingLength(box.entries[i])
  }
  return totalSize
}

exports.avc1 = exports.VisualSampleEntry = {}
exports.VisualSampleEntry.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(exports.VisualSampleEntry.encodingLength(box))

  writeReserved(buf, 0, 6)
  buf.writeUInt16BE(box.dataReferenceIndex || 0, 6)
  writeReserved(buf, 8, 24)
  buf.writeUInt16BE(box.width || 0, 24)
  buf.writeUInt16BE(box.height || 0, 26)
  buf.writeUInt32BE(box.hResolution || 0x480000, 28)
  buf.writeUInt32BE(box.vResolution || 0x480000, 32)
  writeReserved(buf, 36, 40)
  buf.writeUInt16BE(box.frameCount || 1, 40)
  var compressorName = box.compressorName || ''
  var nameLen = Math.min(compressorName.length, 31)
  buf.writeUInt8(nameLen, 42)
  buf.write(compressorName, 43, nameLen, 'utf8')
  buf.writeUInt16BE(box.depth || 0x18, 74)
  buf.writeInt16BE(-1, 76)

  var ptr = 78
  var children = box.children || []
  children.forEach(function (child) {
    Box.encode(child, buf, ptr)
    ptr += Box.encode.bytes
  })
  exports.VisualSampleEntry.encode.bytes = ptr
}
exports.VisualSampleEntry.decode = function (buf, offset, end) {
  buf = buf.slice(offset)
  var length = end - offset
  var nameLen = Math.min(buf.readUInt8(42), 31)
  var box = {
    dataReferenceIndex: buf.readUInt16BE(6),
    width: buf.readUInt16BE(24),
    height: buf.readUInt16BE(26),
    hResolution: buf.readUInt32BE(28),
    vResolution: buf.readUInt32BE(32),
    frameCount: buf.readUInt16BE(40),
    compressorName: buf.toString('utf8', 43, 43 + nameLen),
    depth: buf.readUInt16BE(74),
    children: []
  }

  var ptr = 78
  while (length - ptr >= 8) {
    var child = Box.decode(buf, ptr, length)
    box.children.push(child)
    box[child.type] = child
    ptr += child.length
  }

  return box
}
exports.VisualSampleEntry.encodingLength = function (box) {
  var len = 78
  var children = box.children || []
  children.forEach(function (child) {
    len += Box.encodingLength(child)
  })
  return len
}

exports.avcC = {}
exports.avcC.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : Buffer(box.buffer.length)

  box.buffer.copy(buf)
  exports.avcC.encode.bytes = box.buffer.length
}
exports.avcC.decode = function (buf, offset, end) {
  buf = buf.slice(offset, end)

  return {
    mimeCodec: buf.toString('hex', 1, 4),
    buffer: new Buffer(buf)
  }
}
exports.avcC.encodingLength = function (box) {
  return box.buffer.length
}

exports.mp4a = exports.AudioSampleEntry = {}
exports.AudioSampleEntry.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(exports.AudioSampleEntry.encodingLength(box))

  writeReserved(buf, 0, 6)
  buf.writeUInt16BE(box.dataReferenceIndex || 0, 6)
  writeReserved(buf, 8, 16)
  buf.writeUInt16BE(box.channelCount || 2, 16)
  buf.writeUInt16BE(box.sampleSize || 16, 18)
  writeReserved(buf, 20, 24)
  buf.writeUInt32BE(box.sampleRate || 0, 24)

  var ptr = 28
  var children = box.children || []
  children.forEach(function (child) {
    Box.encode(child, buf, ptr)
    ptr += Box.encode.bytes
  })
  exports.AudioSampleEntry.encode.bytes = ptr
}
exports.AudioSampleEntry.decode = function (buf, offset, end) {
  buf = buf.slice(offset, end)
  var length = end - offset
  var box = {
    dataReferenceIndex: buf.readUInt16BE(6),
    channelCount: buf.readUInt16BE(16),
    sampleSize: buf.readUInt16BE(18),
    sampleRate: buf.readUInt32BE(24),
    children: []
  }

  var ptr = 28
  while (length - ptr >= 8) {
    var child = Box.decode(buf, ptr, length)
    box.children.push(child)
    box[child.type] = child
    ptr += child.length
  }

  return box
}
exports.AudioSampleEntry.encodingLength = function (box) {
  var len = 28
  var children = box.children || []
  children.forEach(function (child) {
    len += Box.encodingLength(child)
  })
  return len
}

exports.esds = {}
exports.esds.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : Buffer(box.buffer.length)

  box.buffer.copy(buf, 0)
  exports.esds.encode.bytes = box.buffer.length
}
exports.esds.decode = function (buf, offset, end) {
  buf = buf.slice(offset, end)

  var desc = Descriptor.Descriptor.decode(buf, 0, buf.length)
  var esd = (desc.tagName === 'ESDescriptor') ? desc : {}
  var dcd = esd.DecoderConfigDescriptor || {}
  var oti = dcd.oti || 0
  var dsi = dcd.DecoderSpecificInfo
  var audioConfig = dsi ? (dsi.buffer.readUInt8(0) & 0xf8) >> 3 : 0

  var mimeCodec = null
  if (oti) {
    mimeCodec = oti.toString(16)
    if (audioConfig) {
      mimeCodec += '.' + audioConfig
    }
  }

  return {
    mimeCodec: mimeCodec,
    buffer: new Buffer(buf.slice(0))
  }
}
exports.esds.encodingLength = function (box) {
  return box.buffer.length
}

// TODO: integrate the two versions in a saner way
exports.stsz = {}
exports.stsz.encode = function (box, buf, offset) {
  var entries = box.entries || []
  buf = buf ? buf.slice(offset) : Buffer(exports.stsz.encodingLength(box))

  buf.writeUInt32BE(0, 0)
  buf.writeUInt32BE(entries.length, 4)

  for (var i = 0; i < entries.length; i++) {
    buf.writeUInt32BE(entries[i], i * 4 + 8)
  }

  exports.stsz.encode.bytes = 8 + entries.length * 4
  return buf
}
exports.stsz.decode = function (buf, offset) {
  buf = buf.slice(offset)
  var size = buf.readUInt32BE(0)
  var num = buf.readUInt32BE(4)
  var entries = new Array(num)

  for (var i = 0; i < num; i++) {
    if (size === 0) {
      entries[i] = buf.readUInt32BE(i * 4 + 8)
    } else {
      entries[i] = size
    }
  }

  return {
    entries: entries
  }
}
exports.stsz.encodingLength = function (box) {
  return 8 + box.entries.length * 4
}

exports.stss =
exports.stco = {}
exports.stco.encode = function (box, buf, offset) {
  var entries = box.entries || []
  buf = buf ? buf.slice(offset) : new Buffer(exports.stco.encodingLength(box))

  buf.writeUInt32BE(entries.length, 0)

  for (var i = 0; i < entries.length; i++) {
    buf.writeUInt32BE(entries[i], i * 4 + 4)
  }

  exports.stco.encode.bytes = 4 + entries.length * 4
  return buf
}
exports.stco.decode = function (buf, offset) {
  buf = buf.slice(offset)
  var num = buf.readUInt32BE(0)
  var entries = new Array(num)

  for (var i = 0; i < num; i++) {
    entries[i] = buf.readUInt32BE(i * 4 + 4)
  }

  return {
    entries: entries
  }
}
exports.stco.encodingLength = function (box) {
  return 4 + box.entries.length * 4
}

exports.stts = {}
exports.stts.encode = function (box, buf, offset) {
  var entries = box.entries || []
  buf = buf ? buf.slice(offset) : new Buffer(exports.stts.encodingLength(box))

  buf.writeUInt32BE(entries.length, 0)

  for (var i = 0; i < entries.length; i++) {
    var ptr = i * 8 + 4
    buf.writeUInt32BE(entries[i].count || 0, ptr)
    buf.writeUInt32BE(entries[i].duration || 0, ptr + 4)
  }

  exports.stts.encode.bytes = 4 + box.entries.length * 8
  return buf
}
exports.stts.decode = function (buf, offset) {
  buf = buf.slice(offset)
  var num = buf.readUInt32BE(0)
  var entries = new Array(num)

  for (var i = 0; i < num; i++) {
    var ptr = i * 8 + 4
    entries[i] = {
      count: buf.readUInt32BE(ptr),
      duration: buf.readUInt32BE(ptr + 4)
    }
  }

  return {
    entries: entries
  }
}
exports.stts.encodingLength = function (box) {
  return 4 + box.entries.length * 8
}

exports.ctts = {}
exports.ctts.encode = function (box, buf, offset) {
  var entries = box.entries || []
  buf = buf ? buf.slice(offset) : new Buffer(exports.ctts.encodingLength(box))

  buf.writeUInt32BE(entries.length, 0)

  for (var i = 0; i < entries.length; i++) {
    var ptr = i * 8 + 4
    buf.writeUInt32BE(entries[i].count || 0, ptr)
    buf.writeUInt32BE(entries[i].compositionOffset || 0, ptr + 4)
  }

  exports.ctts.encode.bytes = 4 + entries.length * 8
  return buf
}
exports.ctts.decode = function (buf, offset) {
  buf = buf.slice(offset)
  var num = buf.readUInt32BE(0)
  var entries = new Array(num)

  for (var i = 0; i < num; i++) {
    var ptr = i * 8 + 4
    entries[i] = {
      count: buf.readUInt32BE(ptr),
      compositionOffset: buf.readInt32BE(ptr + 4)
    }
  }

  return {
    entries: entries
  }
}
exports.ctts.encodingLength = function (box) {
  return 4 + box.entries.length * 8
}

exports.stsc = {}
exports.stsc.encode = function (box, buf, offset) {
  var entries = box.entries || []
  buf = buf ? buf.slice(offset) : new Buffer(exports.stsc.encodingLength(box))

  buf.writeUInt32BE(entries.length, 0)

  for (var i = 0; i < entries.length; i++) {
    var ptr = i * 12 + 4
    buf.writeUInt32BE(entries[i].firstChunk || 0, ptr)
    buf.writeUInt32BE(entries[i].samplesPerChunk || 0, ptr + 4)
    buf.writeUInt32BE(entries[i].sampleDescriptionId || 0, ptr + 8)
  }

  exports.stsc.encode.bytes = 4 + entries.length * 12
  return buf
}
exports.stsc.decode = function (buf, offset) {
  buf = buf.slice(offset)
  var num = buf.readUInt32BE(0)
  var entries = new Array(num)

  for (var i = 0; i < num; i++) {
    var ptr = i * 12 + 4
    entries[i] = {
      firstChunk: buf.readUInt32BE(ptr),
      samplesPerChunk: buf.readUInt32BE(ptr + 4),
      sampleDescriptionId: buf.readUInt32BE(ptr + 8)
    }
  }

  return {
    entries: entries
  }
}
exports.stsc.encodingLength = function (box) {
  return 4 + box.entries.length * 12
}

exports.dref = {}
exports.dref.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(exports.dref.encodingLength(box))
  var entries = box.entries || []

  buf.writeUInt32BE(entries.length, 0)

  var ptr = 4
  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i]
    var size = (entry.buf ? entry.buf.length : 0) + 4 + 4

    buf.writeUInt32BE(size, ptr)
    ptr += 4

    buf.write(entry.type, ptr, 4, 'ascii')
    ptr += 4

    if (entry.buf) {
      entry.buf.copy(buf, ptr)
      ptr += entry.buf.length
    }
  }

  exports.dref.encode.bytes = ptr
  return buf
}
exports.dref.decode = function (buf, offset) {
  buf = buf.slice(offset)
  var num = buf.readUInt32BE(0)
  var entries = new Array(num)
  var ptr = 4

  for (var i = 0; i < num; i++) {
    var size = buf.readUInt32BE(ptr)
    var type = buf.toString('ascii', ptr + 4, ptr + 8)
    var tmp = buf.slice(ptr + 8, ptr + size)
    ptr += size

    entries[i] = {
      type: type,
      buf: tmp
    }
  }

  return {
    entries: entries
  }
}
exports.dref.encodingLength = function (box) {
  var totalSize = 4
  if (!box.entries) return totalSize
  for (var i = 0; i < box.entries.length; i++) {
    var buf = box.entries[i].buf
    totalSize += (buf ? buf.length : 0) + 4 + 4
  }
  return totalSize
}

exports.elst = {}
exports.elst.encode = function (box, buf, offset) {
  var entries = box.entries || []
  buf = buf ? buf.slice(offset) : new Buffer(exports.elst.encodingLength(box))

  buf.writeUInt32BE(entries.length, 0)

  for (var i = 0; i < entries.length; i++) {
    var ptr = i * 12 + 4
    buf.writeUInt32BE(entries[i].trackDuration || 0, ptr)
    buf.writeUInt32BE(entries[i].mediaTime || 0, ptr + 4)
    writeFixed32(entries[i].mediaRate || 0, buf, ptr + 8)
  }

  exports.elst.encode.bytes = 4 + entries.length * 12
  return buf
}
exports.elst.decode = function (buf, offset) {
  buf = buf.slice(offset)
  var num = buf.readUInt32BE(0)
  var entries = new Array(num)

  for (var i = 0; i < num; i++) {
    var ptr = i * 12 + 4
    entries[i] = {
      trackDuration: buf.readUInt32BE(ptr),
      mediaTime: buf.readInt32BE(ptr + 4),
      mediaRate: readFixed32(buf, ptr + 8)
    }
  }

  return {
    entries: entries
  }
}
exports.elst.encodingLength = function (box) {
  return 4 + box.entries.length * 12
}

exports.hdlr = {}
exports.hdlr.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(exports.hdlr.encodingLength(box))

  var len = 21 + (box.name || '').length
  buf.fill(0, 0, len)

  buf.write(box.handlerType || '', 4, 4, 'ascii')
  writeString(box.name || '', buf, 20)

  exports.hdlr.encode.bytes = len
  return buf
}
exports.hdlr.decode = function (buf, offset, end) {
  buf = buf.slice(offset)
  return {
    handlerType: buf.toString('ascii', 4, 8),
    name: readString(buf, 20, end)
  }
}
exports.hdlr.encodingLength = function (box) {
  return 21 + (box.name || '').length
}

exports.mehd = {}
exports.mehd.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(4)

  buf.writeUInt32BE(box.fragmentDuration || 0, 0)
  exports.mehd.encode.bytes = 4
  return buf
}
exports.mehd.decode = function (buf, offset) {
  buf = buf.slice(offset)
  return {
    fragmentDuration: buf.readUInt32BE(0)
  }
}
exports.mehd.encodingLength = function (box) {
  return 4
}

exports.trex = {}
exports.trex.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(20)

  buf.writeUInt32BE(box.trackId || 0, 0)
  buf.writeUInt32BE(box.defaultSampleDescriptionIndex || 0, 4)
  buf.writeUInt32BE(box.defaultSampleDuration || 0, 8)
  buf.writeUInt32BE(box.defaultSampleSize || 0, 12)
  buf.writeUInt32BE(box.defaultSampleFlags || 0, 16)
  exports.trex.encode.bytes = 20
  return buf
}
exports.trex.decode = function (buf, offset) {
  buf = buf.slice(offset)
  return {
    trackId: buf.readUInt32BE(0),
    defaultSampleDescriptionIndex: buf.readUInt32BE(4),
    defaultSampleDuration: buf.readUInt32BE(8),
    defaultSampleSize: buf.readUInt32BE(12),
    defaultSampleFlags: buf.readUInt32BE(16)
  }
}
exports.trex.encodingLength = function (box) {
  return 20
}

exports.mfhd = {}
exports.mfhd.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(4)

  buf.writeUInt32BE(box.sequenceNumber || 0, 0)
  exports.mfhd.encode.bytes = 4
  return buf
}
exports.mfhd.decode = function (buf, offset) {
  return {
    sequenceNumber: buf.readUint32BE(0)
  }
}
exports.mfhd.encodingLength = function (box) {
  return 4
}

exports.tfhd = {}
exports.tfhd.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(4)
  buf.writeUInt32BE(box.trackId, 0)
  exports.tfhd.encode.bytes = 4
  return buf
}
exports.tfhd.decode = function (buf, offset) {
  // TODO: this
}
exports.tfhd.encodingLength = function (box) {
  // TODO: this is wrong!
  return 4
}

exports.tfdt = {}
exports.tfdt.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(4)

  buf.writeUInt32BE(box.baseMediaDecodeTime || 0, 0)
  exports.tfdt.encode.bytes = 4
  return buf
}
exports.tfdt.decode = function (buf, offset) {
  // TODO: this
}
exports.tfdt.encodingLength = function (box) {
  return 4
}

exports.trun = {}
exports.trun.encode = function (box, buf, offset) {
  buf = buf ? buf.slice(offset) : new Buffer(8 + box.entries.length * 16)

  // TODO: this is wrong
  buf.writeUInt32BE(box.entries.length, 0)
  buf.writeInt32BE(box.dataOffset, 4)
  var ptr = 8
  for (var i = 0; i < box.entries.length; i++) {
    var entry = box.entries[i]
    buf.writeUInt32BE(entry.sampleDuration, ptr)
    ptr += 4

    buf.writeUInt32BE(entry.sampleSize, ptr)
    ptr += 4

    buf.writeUInt32BE(entry.sampleFlags, ptr)
    ptr += 4

    buf.writeUInt32BE(entry.sampleCompositionTimeOffset, ptr)
    ptr += 4
  }
  exports.trun.encode.bytes = ptr
}
exports.trun.decode = function (buf, offset) {
  // TODO: this
}
exports.trun.encodingLength = function (box) {
  // TODO: this is wrong
  return 8 + box.entries.length * 16
}

exports.mdat = {}
exports.mdat.encode = function (box, buf, offset) {
  if (box.buffer) {
    box.buffer.copy(buf, offset)
    exports.mdat.encode.bytes = box.buffer.length
  } else {
    exports.mdat.encode.bytes = exports.mdat.encodingLength(box)
  }
}
exports.mdat.decode = function (buf, start, end) {
  return {
    buffer: new Buffer(buf.slice(start, end))
  }
}
exports.mdat.encodingLength = function (box) {
  return box.buffer ? box.buffer.length : box.contentLength
}

function writeReserved (buf, offset, end) {
  for (var i = offset; i < end; i++) buf[i] = 0
}

function writeDate (date, buf, offset) {
  buf.writeUInt32BE(Math.floor((date.getTime() + TIME_OFFSET) / 1000), offset)
}

// TODO: think something is wrong here
function writeFixed32 (num, buf, offset) {
  buf.writeUInt16BE(Math.floor(num) % (256 * 256), offset)
  buf.writeUInt16BE(Math.floor(num * 256 * 256) % (256 * 256), offset + 2)
}

function writeFixed16 (num, buf, offset) {
  buf[offset] = Math.floor(num) % 256
  buf[offset + 1] = Math.floor(num * 256) % 256
}

function writeMatrix (list, buf, offset) {
  if (!list) list = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  for (var i = 0; i < list.length; i++) {
    writeFixed32(list[i], buf, offset + i * 4)
  }
}

function writeString (str, buf, offset) {
  var strBuffer = new Buffer(str, 'utf8')
  strBuffer.copy(buf, offset)
  buf[offset + strBuffer.length] = 0
}

function readMatrix (buf) {
  var list = new Array(buf.length / 4)
  for (var i = 0; i < list.length; i++) list[i] = readFixed32(buf, i * 4)
  return list
}

function readDate (buf, offset) {
  return new Date(buf.readUInt32BE(offset) * 1000 - TIME_OFFSET)
}

function readFixed32 (buf, offset) {
  return buf.readUInt16BE(offset) + buf.readUInt16BE(offset + 2) / (256 * 256)
}

function readFixed16 (buf, offset) {
  return buf[offset] + buf[offset + 1] / 256
}

function readString (buf, offset, length) {
  var i
  for (i = 0; i < length; i++) {
    if (buf[offset + i] === 0) {
      break
    }
  }
  return buf.toString('utf8', offset, offset + i)
}

}).call(this,require("buffer").Buffer)
},{"./descriptor":40,"./index":41,"buffer":119}],40:[function(require,module,exports){
(function (Buffer){
var tagToName = {
  0x03: 'ESDescriptor',
  0x04: 'DecoderConfigDescriptor',
  0x05: 'DecoderSpecificInfo',
  0x06: 'SLConfigDescriptor'
}

exports.Descriptor = {}
exports.Descriptor.decode = function (buf, start, end) {
  var tag = buf.readUInt8(start)
  var ptr = start + 1
  var lenByte
  var len = 0
  do {
    lenByte = buf.readUInt8(ptr++)
    len = (len << 7) | (lenByte & 0x7f)
  } while (lenByte & 0x80)

  var obj
  var tagName = tagToName[tag] // May be undefined; that's ok
  if (exports[tagName]) {
    obj = exports[tagName].decode(buf, ptr, end)
  } else {
    obj = {
      buffer: new Buffer(buf.slice(ptr, ptr + len))
    }
  }

  obj.tag = tag
  obj.tagName = tagName
  obj.length = (ptr - start) + len
  obj.contentsLen = len
  return obj
}

exports.DescriptorArray = {}
exports.DescriptorArray.decode = function (buf, start, end) {
  var ptr = start
  var obj = {}
  while (ptr + 2 <= end) {
    var descriptor = exports.Descriptor.decode(buf, ptr, end)
    ptr += descriptor.length
    var tagName = tagToName[descriptor.tag] || ('Descriptor' + descriptor.tag)
    obj[tagName] = descriptor
  }
  return obj
}

exports.ESDescriptor = {}
exports.ESDescriptor.decode = function (buf, start, end) {
  var flags = buf.readUInt8(start + 2)
  var ptr = start + 3
  if (flags & 0x80) {
    ptr += 2
  }
  if (flags & 0x40) {
    var len = buf.readUInt8(ptr)
    ptr += len + 1
  }
  if (flags & 0x20) {
    ptr += 2
  }
  return exports.DescriptorArray.decode(buf, ptr, end)
}

exports.DecoderConfigDescriptor = {}
exports.DecoderConfigDescriptor.decode = function (buf, start, end) {
  var oti = buf.readUInt8(start)
  var obj = exports.DescriptorArray.decode(buf, start + 13, end)
  obj.oti = oti
  return obj
}

}).call(this,require("buffer").Buffer)
},{"buffer":119}],41:[function(require,module,exports){
(function (Buffer){
// var assert = require('assert')
var uint64be = require('uint64be')

var boxes = require('./boxes')

var UINT32_MAX = 4294967295

var Box = exports

/*
 * Lists the proper order for boxes inside containers.
 * Five-character names ending in 's' indicate arrays instead of single elements.
 */
var containers = exports.containers = {
  'moov': ['mvhd', 'meta', 'traks', 'mvex'],
  'trak': ['tkhd', 'tref', 'trgr', 'edts', 'meta', 'mdia', 'udta'],
  'edts': ['elst'],
  'mdia': ['mdhd', 'hdlr', 'elng', 'minf'],
  'minf': ['vmhd', 'smhd', 'hmhd', 'sthd', 'nmhd', 'dinf', 'stbl'],
  'dinf': ['dref'],
  'stbl': ['stsd', 'stts', 'ctts', 'cslg', 'stsc', 'stsz', 'stz2', 'stco', 'co64', 'stss', 'stsh', 'padb', 'stdp', 'sdtp', 'sbgps', 'sgpds', 'subss', 'saizs', 'saios'],
  'mvex': ['mehd', 'trexs', 'leva'],
  'moof': ['mfhd', 'meta', 'trafs'],
  'traf': ['tfhd', 'trun', 'sbgps', 'sgpds', 'subss', 'saizs', 'saios', 'tfdt', 'meta']
}

Box.encode = function (obj, buffer, offset) {
  Box.encodingLength(obj) // sets every level appropriately
  offset = offset || 0
  buffer = buffer || new Buffer(obj.length)
  return Box._encode(obj, buffer, offset)
}

Box._encode = function (obj, buffer, offset) {
  var type = obj.type
  var len = obj.length
  if (len > UINT32_MAX) {
    len = 1
  }
  buffer.writeUInt32BE(len, offset)
  buffer.write(obj.type, offset + 4, 4, 'ascii')
  var ptr = offset + 8
  if (len === 1) {
    uint64be.encode(obj.length, buffer, ptr)
    ptr += 8
  }
  if (boxes.fullBoxes[type]) {
    buffer.writeUInt32BE(obj.flags || 0, ptr)
    buffer.writeUInt8(obj.version || 0, ptr)
    ptr += 4
  }

  if (containers[type]) {
    var contents = containers[type]
    contents.forEach(function (childType) {
      if (childType.length === 5) {
        var entry = obj[childType] || []
        childType = childType.substr(0, 4)
        entry.forEach(function (child) {
          Box._encode(child, buffer, ptr)
          ptr += Box.encode.bytes
        })
      } else if (obj[childType]) {
        Box._encode(obj[childType], buffer, ptr)
        ptr += Box.encode.bytes
      }
    })
    if (obj.otherBoxes) {
      obj.otherBoxes.forEach(function (child) {
        Box._encode(child, buffer, ptr)
        ptr += Box.encode.bytes
      })
    }
  } else if (boxes[type]) {
    var encode = boxes[type].encode
    encode(obj, buffer, ptr)
    ptr += encode.bytes
  } else if (obj.buffer) {
    var buf = obj.buffer
    buf.copy(buffer, ptr)
    ptr += obj.buffer.length
  } else {
    throw new Error('Either `type` must be set to a known type (not\'' + type + '\') or `buffer` must be set')
  }

  Box.encode.bytes = ptr - offset
  // assert.equal(ptr - offset, obj.length, 'Error encoding \'' + type + '\': wrote ' + ptr - offset + ' bytes, expecting ' + obj.length)
  return buffer
}

/*
 * Returns an object with `type` and `size` fields,
 * or if there isn't enough data, returns the total
 * number of bytes needed to read the headers
 */
Box.readHeaders = function (buffer, start, end) {
  start = start || 0
  end = end || buffer.length
  if (end - start < 8) {
    return 8
  }

  var len = buffer.readUInt32BE(start)
  var type = buffer.toString('ascii', start + 4, start + 8)
  var ptr = start + 8

  if (len === 1) {
    if (end - start < 16) {
      return 16
    }

    len = uint64be.decode(buffer, ptr)
    ptr += 8
  }

  var version
  var flags
  if (boxes.fullBoxes[type]) {
    version = buffer.readUInt8(ptr)
    flags = buffer.readUInt32BE(ptr) & 0xffffff
    ptr += 4
  }

  return {
    length: len,
    headersLen: ptr - start,
    contentLen: len - (ptr - start),
    type: type,
    version: version,
    flags: flags
  }
}

Box.decode = function (buffer, start, end) {
  start = start || 0
  end = end || buffer.length
  var headers = Box.readHeaders(buffer, start, end)
  if (!headers || headers.length > end - start) {
    throw new Error('Data too short')
  }

  return Box.decodeWithoutHeaders(headers, buffer, start + headers.headersLen, start + headers.length)
}

Box.decodeWithoutHeaders = function (headers, buffer, start, end) {
  start = start || 0
  end = end || buffer.length
  var type = headers.type
  var obj = {}
  if (containers[type]) {
    obj.otherBoxes = []
    var contents = containers[type]
    var ptr = start
    while (end - ptr >= 8) {
      var child = Box.decode(buffer, ptr, end)
      ptr += child.length
      if (contents.indexOf(child.type) >= 0) {
        obj[child.type] = child
      } else if (contents.indexOf(child.type + 's') >= 0) {
        var childType = child.type + 's'
        var entry = obj[childType] = obj[childType] || []
        entry.push(child)
      } else {
        obj.otherBoxes.push(child)
      }
    }
  } else if (boxes[type]) {
    var decode = boxes[type].decode
    obj = decode(buffer, start, end)
  } else {
    obj.buffer = new Buffer(buffer.slice(start, end))
  }

  obj.length = headers.length
  obj.contentLen = headers.contentLen
  obj.type = headers.type
  obj.version = headers.version
  obj.flags = headers.flags
  return obj
}

Box.encodingLength = function (obj) {
  var type = obj.type

  var len = 8
  if (boxes.fullBoxes[type]) {
    len += 4
  }

  if (containers[type]) {
    var contents = containers[type]
    contents.forEach(function (childType) {
      if (childType.length === 5) {
        var entry = obj[childType] || []
        childType = childType.substr(0, 4)
        entry.forEach(function (child) {
          child.type = childType
          len += Box.encodingLength(child)
        })
      } else if (obj[childType]) {
        var child = obj[childType]
        child.type = childType
        len += Box.encodingLength(child)
      }
    })
    if (obj.otherBoxes) {
      obj.otherBoxes.forEach(function (child) {
        len += Box.encodingLength(child)
      })
    }
  } else if (boxes[type]) {
    len += boxes[type].encodingLength(obj)
  } else if (obj.buffer) {
    len += obj.buffer.length
  } else {
    throw new Error('Either `type` must be set to a known type (not\'' + type + '\') or `buffer` must be set')
  }

  if (len > UINT32_MAX) {
    len += 8
  }

  obj.length = len
  return len
}

}).call(this,require("buffer").Buffer)
},{"./boxes":39,"buffer":119,"uint64be":93}],42:[function(require,module,exports){
(function (Buffer){
var stream = require('readable-stream')
var inherits = require('inherits')
var nextEvent = require('next-event')
var Box = require('mp4-box-encoding')

var EMPTY = new Buffer(0)

module.exports = Decoder

function Decoder () {
  if (!(this instanceof Decoder)) return new Decoder()
  stream.Writable.call(this)

  this.destroyed = false

  this._pending = 0
  this._missing = 0
  this._buf = null
  this._str = null
  this._cb = null
  this._ondrain = null
  this._writeBuffer = null
  this._writeCb = null

  this._ondrain = null
  this._kick()
}

inherits(Decoder, stream.Writable)

Decoder.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  if (err) this.emit('error', err)
  this.emit('close')
}

Decoder.prototype._write = function (data, enc, next) {
  if (this.destroyed) return
  var drained = !this._str || !this._str._writableState.needDrain

  while (data.length && !this.destroyed) {
    if (!this._missing) {
      this._writeBuffer = data
      this._writeCb = next
      return
    }

    var consumed = data.length < this._missing ? data.length : this._missing
    if (this._buf) data.copy(this._buf, this._buf.length - this._missing)
    else if (this._str) drained = this._str.write(consumed === data.length ? data : data.slice(0, consumed))

    this._missing -= consumed

    if (!this._missing) {
      var buf = this._buf
      var cb = this._cb
      var stream = this._str

      this._buf = this._cb = this._str = this._ondrain = null
      drained = true

      if (stream) stream.end()
      if (cb) cb(buf)
    }

    data = consumed === data.length ? EMPTY : data.slice(consumed)
  }

  if (this._pending && !this._missing) {
    this._writeBuffer = data
    this._writeCb = next
    return
  }

  if (drained) next()
  else this._ondrain(next)
}

Decoder.prototype._buffer = function (size, cb) {
  this._missing = size
  this._buf = new Buffer(size)
  this._cb = cb
}

Decoder.prototype._stream = function (size, cb) {
  var self = this
  this._missing = size
  this._str = new MediaData(this)
  this._ondrain = nextEvent(this._str, 'drain')
  this._pending++
  this._str.on('end', function () {
    self._pending--
    self._kick()
  })
  this._cb = cb
  return this._str
}

Decoder.prototype._readBox = function () {
  var self = this
  bufferHeaders(8)

  function bufferHeaders (len, buf) {
    self._buffer(len, function (additionalBuf) {
      if (buf) {
        buf = Buffer.concat([buf, additionalBuf])
      } else {
        buf = additionalBuf
      }
      var headers = Box.readHeaders(buf)
      if (typeof headers === 'number') {
        bufferHeaders(headers - buf.length, buf)
      } else {
        self._pending++
        self._headers = headers
        self.emit('box', headers)
      }
    })
  }
}

Decoder.prototype.stream = function () {
  var self = this
  if (!self._headers) throw new Error('this function can only be called once after \'box\' is emitted')
  var headers = self._headers
  self._headers = null

  return self._stream(headers.contentLen, null)
}

Decoder.prototype.decode = function (cb) {
  var self = this
  if (!self._headers) throw new Error('this function can only be called once after \'box\' is emitted')
  var headers = self._headers
  self._headers = null

  self._buffer(headers.contentLen, function (buf) {
    var box = Box.decodeWithoutHeaders(headers, buf)
    cb(box)
    self._pending--
    self._kick()
  })
}

Decoder.prototype.ignore = function () {
  var self = this
  if (!self._headers) throw new Error('this function can only be called once after \'box\' is emitted')
  var headers = self._headers
  self._headers = null

  this._missing = headers.contentLen
  this._cb = function () {
    self._pending--
    self._kick()
  }
}

Decoder.prototype._kick = function () {
  if (this._pending) return
  if (!this._buf && !this._str) this._readBox()
  if (this._writeBuffer) {
    var next = this._writeCb
    var buffer = this._writeBuffer
    this._writeBuffer = null
    this._writeCb = null
    this._write(buffer, null, next)
  }
}

function MediaData (parent) {
  this._parent = parent
  this.destroyed = false
  stream.PassThrough.call(this)
}

inherits(MediaData, stream.PassThrough)

MediaData.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  this._parent.destroy(err)
  if (err) this.emit('error', err)
  this.emit('close')
}

}).call(this,require("buffer").Buffer)
},{"buffer":119,"inherits":30,"mp4-box-encoding":41,"next-event":47,"readable-stream":64}],43:[function(require,module,exports){
(function (process,Buffer){
var stream = require('readable-stream')
var inherits = require('inherits')
var Box = require('mp4-box-encoding')

module.exports = Encoder

function noop () {}

function Encoder () {
  if (!(this instanceof Encoder)) return new Encoder()
  stream.Readable.call(this)

  this.destroyed = false

  this._reading = false
  this._stream = null
  this._drain = null
  this._want = false
  this._onreadable = onreadable
  this._onend = onend

  var self = this

  function onreadable () {
    if (!self._want) return
    self._want = false
    self._read()
  }

  function onend () {
    self._stream = null
  }
}

inherits(Encoder, stream.Readable)

Encoder.prototype.mediaData =
Encoder.prototype.mdat = function (size, cb) {
  var stream = new MediaData(this)
  this.box({type: 'mdat', contentLength: size, encodeBufferLen: 8, stream: stream}, cb)
  return stream
}

Encoder.prototype.box = function (box, cb) {
  if (!cb) cb = noop
  if (this.destroyed) return cb(new Error('Encoder is destroyed'))

  var buf
  if (box.encodeBufferLen) {
    buf = new Buffer(box.encodeBufferLen)
  }
  if (box.stream) {
    box.buffer = null
    buf = Box.encode(box, buf)
    this.push(buf)
    this._stream = box.stream
    this._stream.on('readable', this._onreadable)
    this._stream.on('end', this._onend)
    this._stream.on('end', cb)
    this._forward()
  } else {
    buf = Box.encode(box, buf)
    var drained = this.push(buf)
    if (drained) return process.nextTick(cb)
    this._drain = cb
  }
}

Encoder.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  if (this._stream && this._stream.destroy) this._stream.destroy()
  this._stream = null
  if (this._drain) {
    var cb = this._drain
    this._drain = null
    cb(err)
  }
  if (err) this.emit('error', err)
  this.emit('close')
}

Encoder.prototype.finalize = function () {
  this.push(null)
}

Encoder.prototype._forward = function () {
  if (!this._stream) return

  while (!this.destroyed) {
    var buf = this._stream.read()

    if (!buf) {
      this._want = !!this._stream
      return
    }

    if (!this.push(buf)) return
  }
}

Encoder.prototype._read = function () {
  if (this._reading || this.destroyed) return
  this._reading = true

  if (this._stream) this._forward()
  if (this._drain) {
    var drain = this._drain
    this._drain = null
    drain()
  }

  this._reading = false
}

function MediaData (parent) {
  this._parent = parent
  this.destroyed = false
  stream.PassThrough.call(this)
}

inherits(MediaData, stream.PassThrough)

MediaData.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true
  this._parent.destroy(err)
  if (err) this.emit('error', err)
  this.emit('close')
}

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":130,"buffer":119,"inherits":30,"mp4-box-encoding":41,"readable-stream":64}],44:[function(require,module,exports){
exports.decode = require('./decode')
exports.encode = require('./encode')

},{"./decode":42,"./encode":43}],45:[function(require,module,exports){
/**
 * Helpers.
 */

var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
var y = d * 365.25;

/**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} [options]
 * @throws {Error} throw an error if val is not a non-empty string or a number
 * @return {String|Number}
 * @api public
 */

module.exports = function(val, options) {
  options = options || {};
  var type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isNaN(val) === false) {
    return options.long ? fmtLong(val) : fmtShort(val);
  }
  throw new Error(
    'val is not a non-empty string or a valid number. val=' +
      JSON.stringify(val)
  );
};

/**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */

function parse(str) {
  str = String(str);
  if (str.length > 100) {
    return;
  }
  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(
    str
  );
  if (!match) {
    return;
  }
  var n = parseFloat(match[1]);
  var type = (match[2] || 'ms').toLowerCase();
  switch (type) {
    case 'years':
    case 'year':
    case 'yrs':
    case 'yr':
    case 'y':
      return n * y;
    case 'days':
    case 'day':
    case 'd':
      return n * d;
    case 'hours':
    case 'hour':
    case 'hrs':
    case 'hr':
    case 'h':
      return n * h;
    case 'minutes':
    case 'minute':
    case 'mins':
    case 'min':
    case 'm':
      return n * m;
    case 'seconds':
    case 'second':
    case 'secs':
    case 'sec':
    case 's':
      return n * s;
    case 'milliseconds':
    case 'millisecond':
    case 'msecs':
    case 'msec':
    case 'ms':
      return n;
    default:
      return undefined;
  }
}

/**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtShort(ms) {
  if (ms >= d) {
    return Math.round(ms / d) + 'd';
  }
  if (ms >= h) {
    return Math.round(ms / h) + 'h';
  }
  if (ms >= m) {
    return Math.round(ms / m) + 'm';
  }
  if (ms >= s) {
    return Math.round(ms / s) + 's';
  }
  return ms + 'ms';
}

/**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */

function fmtLong(ms) {
  return plural(ms, d, 'day') ||
    plural(ms, h, 'hour') ||
    plural(ms, m, 'minute') ||
    plural(ms, s, 'second') ||
    ms + ' ms';
}

/**
 * Pluralization helper.
 */

function plural(ms, n, name) {
  if (ms < n) {
    return;
  }
  if (ms < n * 1.5) {
    return Math.floor(ms / n) + ' ' + name;
  }
  return Math.ceil(ms / n) + ' ' + name + 's';
}

},{}],46:[function(require,module,exports){
module.exports = MultiStream

var inherits = require('inherits')
var stream = require('readable-stream')

inherits(MultiStream, stream.Readable)

function MultiStream (streams, opts) {
  var self = this
  if (!(self instanceof MultiStream)) return new MultiStream(streams, opts)
  stream.Readable.call(self, opts)

  self.destroyed = false

  self._drained = false
  self._forwarding = false
  self._current = null

  if (typeof streams === 'function') {
    self._queue = streams
  } else {
    self._queue = streams.map(toStreams2)
    self._queue.forEach(function (stream) {
      if (typeof stream !== 'function') self._attachErrorListener(stream)
    })
  }

  self._next()
}

MultiStream.obj = function (streams) {
  return new MultiStream(streams, { objectMode: true, highWaterMark: 16 })
}

MultiStream.prototype._read = function () {
  this._drained = true
  this._forward()
}

MultiStream.prototype._forward = function () {
  if (this._forwarding || !this._drained || !this._current) return
  this._forwarding = true

  var chunk
  while ((chunk = this._current.read()) !== null) {
    this._drained = this.push(chunk)
  }

  this._forwarding = false
}

MultiStream.prototype.destroy = function (err) {
  if (this.destroyed) return
  this.destroyed = true

  if (this._current && this._current.destroy) this._current.destroy()
  if (typeof this._queue !== 'function') {
    this._queue.forEach(function (stream) {
      if (stream.destroy) stream.destroy()
    })
  }

  if (err) this.emit('error', err)
  this.emit('close')
}

MultiStream.prototype._next = function () {
  var self = this
  self._current = null

  if (typeof self._queue === 'function') {
    self._queue(function (err, stream) {
      if (err) return self.destroy(err)
      stream = toStreams2(stream)
      self._attachErrorListener(stream)
      self._gotNextStream(stream)
    })
  } else {
    var stream = self._queue.shift()
    if (typeof stream === 'function') {
      stream = toStreams2(stream())
      self._attachErrorListener(stream)
    }
    self._gotNextStream(stream)
  }
}

MultiStream.prototype._gotNextStream = function (stream) {
  var self = this

  if (!stream) {
    self.push(null)
    self.destroy()
    return
  }

  self._current = stream
  self._forward()

  stream.on('readable', onReadable)
  stream.once('end', onEnd)
  stream.once('close', onClose)

  function onReadable () {
    self._forward()
  }

  function onClose () {
    if (!stream._readableState.ended) {
      self.destroy()
    }
  }

  function onEnd () {
    self._current = null
    stream.removeListener('readable', onReadable)
    stream.removeListener('end', onEnd)
    stream.removeListener('close', onClose)
    self._next()
  }
}

MultiStream.prototype._attachErrorListener = function (stream) {
  var self = this
  if (!stream) return

  stream.once('error', onError)

  function onError (err) {
    stream.removeListener('error', onError)
    self.destroy(err)
  }
}

function toStreams2 (s) {
  if (!s || typeof s === 'function' || s._readableState) return s

  var wrap = new stream.Readable().wrap(s)
  if (s.destroy) {
    wrap.destroy = s.destroy.bind(s)
  }
  return wrap
}

},{"inherits":30,"readable-stream":64}],47:[function(require,module,exports){
module.exports = nextEvent

function nextEvent (emitter, name) {
  var next = null
  emitter.on(name, function (data) {
    if (!next) return
    var fn = next
    next = null
    fn(data)
  })

  return function (once) {
    next = once
  }
}

},{}],48:[function(require,module,exports){
var wrappy = require('wrappy')
module.exports = wrappy(once)
module.exports.strict = wrappy(onceStrict)

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  })
})

function once (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  f.called = false
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true
    return f.value = fn.apply(this, arguments)
  }
  var name = fn.name || 'Function wrapped with `once`'
  f.onceError = name + " shouldn't be called more than once"
  f.called = false
  return f
}

},{"wrappy":112}],49:[function(require,module,exports){
(function (Buffer){
module.exports = decodeTorrentFile
module.exports.decode = decodeTorrentFile
module.exports.encode = encodeTorrentFile

var bencode = require('bencode')
var path = require('path')
var sha1 = require('simple-sha1')
var uniq = require('uniq')

/**
 * Parse a torrent. Throws an exception if the torrent is missing required fields.
 * @param  {Buffer|Object} torrent
 * @return {Object}        parsed torrent
 */
function decodeTorrentFile (torrent) {
  if (Buffer.isBuffer(torrent)) {
    torrent = bencode.decode(torrent)
  }

  // sanity check
  ensure(torrent.info, 'info')
  ensure(torrent.info['name.utf-8'] || torrent.info.name, 'info.name')
  ensure(torrent.info['piece length'], 'info[\'piece length\']')
  ensure(torrent.info.pieces, 'info.pieces')

  if (torrent.info.files) {
    torrent.info.files.forEach(function (file) {
      ensure(typeof file.length === 'number', 'info.files[0].length')
      ensure(file['path.utf-8'] || file.path, 'info.files[0].path')
    })
  } else {
    ensure(typeof torrent.info.length === 'number', 'info.length')
  }

  var result = {}
  result.info = torrent.info
  result.infoBuffer = bencode.encode(torrent.info)
  result.infoHash = sha1.sync(result.infoBuffer)
  result.infoHashBuffer = Buffer.from(result.infoHash, 'hex')

  result.name = (torrent.info['name.utf-8'] || torrent.info.name).toString()

  if (torrent.info.private !== undefined) result.private = !!torrent.info.private

  if (torrent['creation date']) result.created = new Date(torrent['creation date'] * 1000)
  if (torrent['created by']) result.createdBy = torrent['created by'].toString()

  if (Buffer.isBuffer(torrent.comment)) result.comment = torrent.comment.toString()

  // announce and announce-list will be missing if metadata fetched via ut_metadata
  result.announce = []
  if (torrent['announce-list'] && torrent['announce-list'].length) {
    torrent['announce-list'].forEach(function (urls) {
      urls.forEach(function (url) {
        result.announce.push(url.toString())
      })
    })
  } else if (torrent.announce) {
    result.announce.push(torrent.announce.toString())
  }

  // handle url-list (BEP19 / web seeding)
  if (Buffer.isBuffer(torrent['url-list'])) {
    // some clients set url-list to empty string
    torrent['url-list'] = torrent['url-list'].length > 0
      ? [ torrent['url-list'] ]
      : []
  }
  result.urlList = (torrent['url-list'] || []).map(function (url) {
    return url.toString()
  })

  uniq(result.announce)
  uniq(result.urlList)

  var files = torrent.info.files || [ torrent.info ]
  result.files = files.map(function (file, i) {
    var parts = [].concat(result.name, file['path.utf-8'] || file.path || []).map(function (p) {
      return p.toString()
    })
    return {
      path: path.join.apply(null, [path.sep].concat(parts)).slice(1),
      name: parts[parts.length - 1],
      length: file.length,
      offset: files.slice(0, i).reduce(sumLength, 0)
    }
  })

  result.length = files.reduce(sumLength, 0)

  var lastFile = result.files[result.files.length - 1]

  result.pieceLength = torrent.info['piece length']
  result.lastPieceLength = ((lastFile.offset + lastFile.length) % result.pieceLength) || result.pieceLength
  result.pieces = splitPieces(torrent.info.pieces)

  return result
}

/**
 * Convert a parsed torrent object back into a .torrent file buffer.
 * @param  {Object} parsed parsed torrent
 * @return {Buffer}
 */
function encodeTorrentFile (parsed) {
  var torrent = {
    info: parsed.info
  }

  torrent['announce-list'] = (parsed.announce || []).map(function (url) {
    if (!torrent.announce) torrent.announce = url
    url = Buffer.from(url, 'utf8')
    return [ url ]
  })

  torrent['url-list'] = parsed.urlList || []

  if (parsed.created) {
    torrent['creation date'] = (parsed.created.getTime() / 1000) | 0
  }

  if (parsed.createdBy) {
    torrent['created by'] = parsed.createdBy
  }

  if (parsed.comment) {
    torrent.comment = parsed.comment
  }

  return bencode.encode(torrent)
}

function sumLength (sum, file) {
  return sum + file.length
}

function splitPieces (buf) {
  var pieces = []
  for (var i = 0; i < buf.length; i += 20) {
    pieces.push(buf.slice(i, i + 20).toString('hex'))
  }
  return pieces
}

function ensure (bool, fieldName) {
  if (!bool) throw new Error('Torrent is missing required field: ' + fieldName)
}

}).call(this,require("buffer").Buffer)
},{"bencode":5,"buffer":119,"path":128,"simple-sha1":74,"uniq":94}],50:[function(require,module,exports){
(function (process,Buffer){
/* global Blob */

module.exports = parseTorrent
module.exports.remote = parseTorrentRemote

var blobToBuffer = require('blob-to-buffer')
var fs = require('fs') // browser exclude
var get = require('simple-get')
var magnet = require('magnet-uri')
var parseTorrentFile = require('parse-torrent-file')

module.exports.toMagnetURI = magnet.encode
module.exports.toTorrentFile = parseTorrentFile.encode

/**
 * Parse a torrent identifier (magnet uri, .torrent file, info hash)
 * @param  {string|Buffer|Object} torrentId
 * @return {Object}
 */
function parseTorrent (torrentId) {
  if (typeof torrentId === 'string' && /^(stream-)?magnet:/.test(torrentId)) {
    // magnet uri (string)
    return magnet(torrentId)
  } else if (typeof torrentId === 'string' && (/^[a-f0-9]{40}$/i.test(torrentId) || /^[a-z2-7]{32}$/i.test(torrentId))) {
    // info hash (hex/base-32 string)
    return magnet('magnet:?xt=urn:btih:' + torrentId)
  } else if (Buffer.isBuffer(torrentId) && torrentId.length === 20) {
    // info hash (buffer)
    return magnet('magnet:?xt=urn:btih:' + torrentId.toString('hex'))
  } else if (Buffer.isBuffer(torrentId)) {
    // .torrent file (buffer)
    return parseTorrentFile(torrentId) // might throw
  } else if (torrentId && torrentId.infoHash) {
    // parsed torrent (from `parse-torrent`, `parse-torrent-file`, or `magnet-uri`)
    if (!torrentId.announce) torrentId.announce = []
    if (typeof torrentId.announce === 'string') {
      torrentId.announce = [ torrentId.announce ]
    }
    if (!torrentId.urlList) torrentId.urlList = []
    return torrentId
  } else {
    throw new Error('Invalid torrent identifier')
  }
}

function parseTorrentRemote (torrentId, cb) {
  var parsedTorrent
  if (typeof cb !== 'function') throw new Error('second argument must be a Function')

  try {
    parsedTorrent = parseTorrent(torrentId)
  } catch (err) {
    // If torrent fails to parse, it could be a Blob, http/https URL or
    // filesystem path, so don't consider it an error yet.
  }

  if (parsedTorrent && parsedTorrent.infoHash) {
    process.nextTick(function () {
      cb(null, parsedTorrent)
    })
  } else if (isBlob(torrentId)) {
    blobToBuffer(torrentId, function (err, torrentBuf) {
      if (err) return cb(new Error('Error converting Blob: ' + err.message))
      parseOrThrow(torrentBuf)
    })
  } else if (typeof get === 'function' && /^https?:/.test(torrentId)) {
    // http, or https url to torrent file
    get.concat({
      url: torrentId,
      timeout: 30 * 1000,
      headers: { 'user-agent': 'WebTorrent (http://webtorrent.io)' }
    }, function (err, res, torrentBuf) {
      if (err) return cb(new Error('Error downloading torrent: ' + err.message))
      parseOrThrow(torrentBuf)
    })
  } else if (typeof fs.readFile === 'function' && typeof torrentId === 'string') {
    // assume it's a filesystem path
    fs.readFile(torrentId, function (err, torrentBuf) {
      if (err) return cb(new Error('Invalid torrent identifier'))
      parseOrThrow(torrentBuf)
    })
  } else {
    process.nextTick(function () {
      cb(new Error('Invalid torrent identifier'))
    })
  }

  function parseOrThrow (torrentBuf) {
    try {
      parsedTorrent = parseTorrent(torrentBuf)
    } catch (err) {
      return cb(err)
    }
    if (parsedTorrent && parsedTorrent.infoHash) cb(null, parsedTorrent)
    else cb(new Error('Invalid torrent identifier'))
  }
}

/**
 * Check if `obj` is a W3C `Blob` or `File` object
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob (obj) {
  return typeof Blob !== 'undefined' && obj instanceof Blob
}

// Workaround Browserify v13 bug
// https://github.com/substack/node-browserify/issues/1483
;(function () { Buffer.alloc(0) })()

}).call(this,require('_process'),require("buffer").Buffer)
},{"_process":130,"blob-to-buffer":15,"buffer":119,"fs":116,"magnet-uri":36,"parse-torrent-file":49,"simple-get":72}],51:[function(require,module,exports){
var closest = require('closest-to')
var kB = Math.pow(2, 10)

// Create a range from 16kb–4mb
var p = 13, range = []
while (p++ < 22) range.push(Math.pow(2, p))

module.exports = function (bytes) {
  return closest(bytes / kB, range)
}

},{"closest-to":19}],52:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = nextTick;
} else {
  module.exports = process.nextTick;
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}

}).call(this,require('_process'))
},{"_process":130}],53:[function(require,module,exports){
var iterate = function (list) {
  var offset = 0
  return function () {
    if (offset === list.length) return null

    var len = list.length - offset
    var i = (Math.random() * len) | 0
    var el = list[offset + i]

    var tmp = list[offset]
    list[offset] = el
    list[offset + i] = tmp
    offset++

    return el
  }
}

module.exports = iterate

},{}],54:[function(require,module,exports){
(function (process,global){
'use strict'

function oldBrowser () {
  throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
}

var Buffer = require('safe-buffer').Buffer
var crypto = global.crypto || global.msCrypto

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes
} else {
  module.exports = oldBrowser
}

function randomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > 65536) throw new Error('requested too many random bytes')
  // in case browserify  isn't using the Uint8Array version
  var rawBytes = new global.Uint8Array(size)

  // This will not work in older browsers.
  // See https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
  if (size > 0) {  // getRandomValues fails on IE if size == 0
    crypto.getRandomValues(rawBytes)
  }

  // XXX: phantomjs doesn't like a buffer being passed here
  var bytes = Buffer.from(rawBytes.buffer)

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes)
    })
  }

  return bytes
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":130,"safe-buffer":70}],55:[function(require,module,exports){
/*
Instance of writable stream.

call .get(length) or .discard(length) to get a stream (relative to the last end)

emits 'stalled' once everything is written


*/
var inherits = require('inherits')
var stream = require('readable-stream')

module.exports = RangeSliceStream

inherits(RangeSliceStream, stream.Writable)

function RangeSliceStream (offset, opts) {
	var self = this
	if (!(self instanceof RangeSliceStream)) return new RangeSliceStream(offset)
	stream.Writable.call(self, opts)

	self.destroyed = false
	self._queue = []
	self._position = offset || 0
	self._cb = null
	self._buffer = null
	self._out = null
}

RangeSliceStream.prototype._write = function (chunk, encoding, cb) {
	var self = this

	var drained = true

	while (true) {
		if (self.destroyed) {
			return
		}

		// Wait for more queue entries
		if (self._queue.length === 0) {
			self._buffer = chunk
			self._cb = cb
			return
		}

		self._buffer = null
		var currRange = self._queue[0]
		// Relative to the start of chunk, what data do we need?
		var writeStart = Math.max(currRange.start - self._position, 0)
		var writeEnd = currRange.end - self._position

		// Check if we need to throw it all away
		if (writeStart >= chunk.length) {
			self._position += chunk.length
			return cb(null)
		}

		// Check if we need to use it all
		var toWrite
		if (writeEnd > chunk.length) {
			self._position += chunk.length
			if (writeStart === 0) {
				toWrite = chunk
			} else {
				toWrite = chunk.slice(writeStart)
			}
			drained = currRange.stream.write(toWrite) && drained
			break
		}

		self._position += writeEnd
		if (writeStart === 0 && writeEnd === chunk.length) {
			toWrite = chunk
		} else {
			toWrite = chunk.slice(writeStart, writeEnd)
		}
		drained = currRange.stream.write(toWrite) && drained
		if (currRange.last) {
			currRange.stream.end()
		}
		chunk = chunk.slice(writeEnd)
		self._queue.shift()
	}

	if (drained) {
		cb(null)
	} else {
		currRange.stream.once('drain', cb.bind(null, null))
	}
}

RangeSliceStream.prototype.slice = function (ranges) {
	var self = this

	if (self.destroyed) return null

	if (!(ranges instanceof Array)) {
		ranges = [ranges]
	}

	var str = new stream.PassThrough()

	ranges.forEach(function (range, i) {
		self._queue.push({
			start: range.start,
			end: range.end,
			stream: str,
			last: i === (ranges.length - 1)
		})
	})
	if (self._buffer) {
		self._write(self._buffer, null, self._cb)
	}

	return str
}

RangeSliceStream.prototype.destroy = function (err) {
	var self = this
	if (self.destroyed) return
	self.destroyed = true

	if (err) self.emit('error', err)
}

},{"inherits":30,"readable-stream":64}],56:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

var keys = objectKeys(Writable.prototype);
for (var v = 0; v < keys.length; v++) {
  var method = keys[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  processNextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  processNextTick(cb, err);
};

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}
},{"./_stream_readable":58,"./_stream_writable":60,"core-util-is":20,"inherits":30,"process-nextick-args":52}],57:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":59,"core-util-is":20,"inherits":30}],58:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

// TODO(bmeurer): Change this back to const once hole checks are
// properly optimized away early in Ignition+TurboFan.
/*<replacement>*/
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
  }
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) processNextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    processNextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) processNextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        processNextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    processNextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], self.emit.bind(self, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    processNextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":56,"./internal/streams/BufferList":61,"./internal/streams/destroy":62,"./internal/streams/stream":63,"_process":130,"core-util-is":20,"events":122,"inherits":30,"isarray":34,"process-nextick-args":52,"safe-buffer":70,"string_decoder/":86,"util":118}],59:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return stream.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er, data) {
      done(stream, er, data);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data !== null && data !== undefined) stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":56,"core-util-is":20,"inherits":30}],60:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : processNextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/
var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}
/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  processNextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    processNextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = _isUint8Array(chunk) && !state.objectMode;

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    processNextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    processNextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      processNextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) processNextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":56,"./internal/streams/destroy":62,"./internal/streams/stream":63,"_process":130,"core-util-is":20,"inherits":30,"process-nextick-args":52,"safe-buffer":70,"util-deprecate":97}],61:[function(require,module,exports){
'use strict';

/*<replacement>*/

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();
},{"safe-buffer":70}],62:[function(require,module,exports){
'use strict';

/*<replacement>*/

var processNextTick = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      processNextTick(emitErrorNT, this, err);
    }
    return;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      processNextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":52}],63:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":122}],64:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":56,"./lib/_stream_passthrough.js":57,"./lib/_stream_readable.js":58,"./lib/_stream_transform.js":59,"./lib/_stream_writable.js":60}],65:[function(require,module,exports){
exports.render = render
exports.append = append
exports.mime = require('./lib/mime.json')

var debug = require('debug')('render-media')
var isAscii = require('is-ascii')
var MediaElementWrapper = require('mediasource')
var path = require('path')
var streamToBlobURL = require('stream-to-blob-url')
var videostream = require('videostream')

var VIDEOSTREAM_EXTS = [
  '.m4a',
  '.m4v',
  '.mp4'
]

var MEDIASOURCE_VIDEO_EXTS = [
  '.m4v',
  '.mkv',
  '.mp4',
  '.webm'
]

var MEDIASOURCE_AUDIO_EXTS = [
  '.m4a',
  '.mp3'
]

var MEDIASOURCE_EXTS = [].concat(
  MEDIASOURCE_VIDEO_EXTS,
  MEDIASOURCE_AUDIO_EXTS
)

var AUDIO_EXTS = [
  '.aac',
  '.oga',
  '.ogg',
  '.wav'
]

var IMAGE_EXTS = [
  '.bmp',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg'
]

var IFRAME_EXTS = [
  '.css',
  '.html',
  '.js',
  '.md',
  '.pdf',
  '.txt'
]

// Maximum file length for which the Blob URL strategy will be attempted
// See: https://github.com/feross/render-media/issues/18
var MAX_BLOB_LENGTH = 200 * 1000 * 1000 // 200 MB

var MediaSource = typeof window !== 'undefined' && window.MediaSource

function render (file, elem, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}
  if (!cb) cb = function () {}

  validateFile(file)
  parseOpts(opts)

  if (typeof elem === 'string') elem = document.querySelector(elem)

  renderMedia(file, function (tagName) {
    if (elem.nodeName !== tagName.toUpperCase()) {
      var extname = path.extname(file.name).toLowerCase()

      throw new Error(
        'Cannot render "' + extname + '" inside a "' +
        elem.nodeName.toLowerCase() + '" element, expected "' + tagName + '"'
      )
    }

    return elem
  }, opts, cb)
}

function append (file, rootElem, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }
  if (!opts) opts = {}
  if (!cb) cb = function () {}

  validateFile(file)
  parseOpts(opts)

  if (typeof rootElem === 'string') rootElem = document.querySelector(rootElem)

  if (rootElem && (rootElem.nodeName === 'VIDEO' || rootElem.nodeName === 'AUDIO')) {
    throw new Error(
      'Invalid video/audio node argument. Argument must be root element that ' +
      'video/audio tag will be appended to.'
    )
  }

  renderMedia(file, getElem, opts, done)

  function getElem (tagName) {
    if (tagName === 'video' || tagName === 'audio') return createMedia(tagName)
    else return createElem(tagName)
  }

  function createMedia (tagName) {
    var elem = createElem(tagName)
    if (opts.controls) elem.controls = true
    if (opts.autoplay) elem.autoplay = true
    rootElem.appendChild(elem)
    return elem
  }

  function createElem (tagName) {
    var elem = document.createElement(tagName)
    rootElem.appendChild(elem)
    return elem
  }

  function done (err, elem) {
    if (err && elem) elem.remove()
    cb(err, elem)
  }
}

function renderMedia (file, getElem, opts, cb) {
  var extname = path.extname(file.name).toLowerCase()
  var currentTime = 0
  var elem

  if (MEDIASOURCE_EXTS.indexOf(extname) >= 0) {
    renderMediaSource()
  } else if (AUDIO_EXTS.indexOf(extname) >= 0) {
    renderAudio()
  } else if (IMAGE_EXTS.indexOf(extname) >= 0) {
    renderImage()
  } else if (IFRAME_EXTS.indexOf(extname) >= 0) {
    renderIframe()
  } else {
    tryRenderIframe()
  }

  function renderMediaSource () {
    var tagName = MEDIASOURCE_VIDEO_EXTS.indexOf(extname) >= 0 ? 'video' : 'audio'

    if (MediaSource) {
      if (VIDEOSTREAM_EXTS.indexOf(extname) >= 0) {
        useVideostream()
      } else {
        useMediaSource()
      }
    } else {
      useBlobURL()
    }

    function useVideostream () {
      debug('Use `videostream` package for ' + file.name)
      prepareElem()
      elem.addEventListener('error', fallbackToMediaSource)
      elem.addEventListener('loadstart', onLoadStart)
      elem.addEventListener('canplay', onCanPlay)
      videostream(file, elem)
    }

    function useMediaSource () {
      debug('Use MediaSource API for ' + file.name)
      prepareElem()
      elem.addEventListener('error', fallbackToBlobURL)
      elem.addEventListener('loadstart', onLoadStart)
      elem.addEventListener('canplay', onCanPlay)

      var wrapper = new MediaElementWrapper(elem)
      var writable = wrapper.createWriteStream(getCodec(file.name))
      file.createReadStream().pipe(writable)

      if (currentTime) elem.currentTime = currentTime
    }

    function useBlobURL () {
      debug('Use Blob URL for ' + file.name)
      prepareElem()
      elem.addEventListener('error', fatalError)
      elem.addEventListener('loadstart', onLoadStart)
      elem.addEventListener('canplay', onCanPlay)
      getBlobURL(file, function (err, url) {
        if (err) return fatalError(err)
        elem.src = url
        if (currentTime) elem.currentTime = currentTime
      })
    }

    function fallbackToMediaSource (err) {
      debug('videostream error: fallback to MediaSource API: %o', err.message || err)
      elem.removeEventListener('error', fallbackToMediaSource)
      elem.removeEventListener('canplay', onCanPlay)

      useMediaSource()
    }

    function fallbackToBlobURL (err) {
      debug('MediaSource API error: fallback to Blob URL: %o', err.message || err)

      if (typeof file.length === 'number' && file.length > opts.maxBlobLength) {
        debug(
          'File length too large for Blob URL approach: %d (max: %d)',
          file.length, opts.maxBlobLength
        )
        return fatalError(new Error(
          'File length too large for Blob URL approach: ' + file.length +
          ' (max: ' + opts.maxBlobLength + ')'
        ))
      }

      elem.removeEventListener('error', fallbackToBlobURL)
      elem.removeEventListener('canplay', onCanPlay)

      useBlobURL()
    }

    function prepareElem () {
      if (!elem) {
        elem = getElem(tagName)

        elem.addEventListener('progress', function () {
          currentTime = elem.currentTime
        })
      }
    }
  }

  function renderAudio () {
    elem = getElem('audio')
    getBlobURL(file, function (err, url) {
      if (err) return fatalError(err)
      elem.addEventListener('error', fatalError)
      elem.addEventListener('loadstart', onLoadStart)
      elem.addEventListener('canplay', onCanPlay)
      elem.src = url
    })
  }

  function onLoadStart () {
    elem.removeEventListener('loadstart', onLoadStart)
    if (opts.autoplay) elem.play()
  }

  function onCanPlay () {
    elem.removeEventListener('canplay', onCanPlay)
    cb(null, elem)
  }

  function renderImage () {
    elem = getElem('img')
    getBlobURL(file, function (err, url) {
      if (err) return fatalError(err)
      elem.src = url
      elem.alt = file.name
      cb(null, elem)
    })
  }

  function renderIframe () {
    elem = getElem('iframe')

    getBlobURL(file, function (err, url) {
      if (err) return fatalError(err)
      elem.src = url
      if (extname !== '.pdf') elem.sandbox = 'allow-forms allow-scripts'
      cb(null, elem)
    })
  }

  function tryRenderIframe () {
    debug('Unknown file extension "%s" - will attempt to render into iframe', extname)

    var str = ''
    file.createReadStream({ start: 0, end: 1000 })
      .setEncoding('utf8')
      .on('data', function (chunk) {
        str += chunk
      })
      .on('end', done)
      .on('error', cb)

    function done () {
      if (isAscii(str)) {
        debug('File extension "%s" appears ascii, so will render.', extname)
        renderIframe()
      } else {
        debug('File extension "%s" appears non-ascii, will not render.', extname)
        cb(new Error('Unsupported file type "' + extname + '": Cannot append to DOM'))
      }
    }
  }

  function fatalError (err) {
    err.message = 'Error rendering file "' + file.name + '": ' + err.message
    debug(err.message)
    cb(err)
  }
}

function getBlobURL (file, cb) {
  var extname = path.extname(file.name).toLowerCase()
  streamToBlobURL(file.createReadStream(), exports.mime[extname], cb)
}

function validateFile (file) {
  if (file == null) {
    throw new Error('file cannot be null or undefined')
  }
  if (typeof file.name !== 'string') {
    throw new Error('missing or invalid file.name property')
  }
  if (typeof file.createReadStream !== 'function') {
    throw new Error('missing or invalid file.createReadStream property')
  }
}

function getCodec (name) {
  var extname = path.extname(name).toLowerCase()
  return {
    '.m4a': 'audio/mp4; codecs="mp4a.40.5"',
    '.m4v': 'video/mp4; codecs="avc1.640029, mp4a.40.5"',
    '.mkv': 'video/webm; codecs="avc1.640029, mp4a.40.5"',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4; codecs="avc1.640029, mp4a.40.5"',
    '.webm': 'video/webm; codecs="vorbis, vp8"'
  }[extname]
}

function parseOpts (opts) {
  if (opts.autoplay == null) opts.autoplay = true
  if (opts.controls == null) opts.controls = true
  if (opts.maxBlobLength == null) opts.maxBlobLength = MAX_BLOB_LENGTH
}

},{"./lib/mime.json":66,"debug":22,"is-ascii":31,"mediasource":37,"path":128,"stream-to-blob-url":83,"videostream":100}],66:[function(require,module,exports){
module.exports={
  ".3gp": "video/3gpp",
  ".aac": "audio/aac",
  ".aif": "audio/x-aiff",
  ".aiff": "audio/x-aiff",
  ".atom": "application/atom+xml",
  ".avi": "video/x-msvideo",
  ".bmp": "image/bmp",
  ".bz2": "application/x-bzip2",
  ".conf": "text/plain",
  ".css": "text/css",
  ".csv": "text/plain",
  ".diff": "text/x-diff",
  ".doc": "application/msword",
  ".flv": "video/x-flv",
  ".gif": "image/gif",
  ".gz": "application/x-gzip",
  ".htm": "text/html",
  ".html": "text/html",
  ".ico": "image/vnd.microsoft.icon",
  ".ics": "text/calendar",
  ".iso": "application/octet-stream",
  ".jar": "application/java-archive",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "application/javascript",
  ".json": "application/json",
  ".less": "text/css",
  ".log": "text/plain",
  ".m3u": "audio/x-mpegurl",
  ".m4a": "audio/mp4",
  ".m4v": "video/mp4",
  ".manifest": "text/cache-manifest",
  ".markdown": "text/x-markdown",
  ".mathml": "application/mathml+xml",
  ".md": "text/x-markdown",
  ".mid": "audio/midi",
  ".midi": "audio/midi",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".mp4v": "video/mp4",
  ".mpeg": "video/mpeg",
  ".mpg": "video/mpeg",
  ".odp": "application/vnd.oasis.opendocument.presentation",
  ".ods": "application/vnd.oasis.opendocument.spreadsheet",
  ".odt": "application/vnd.oasis.opendocument.text",
  ".oga": "audio/ogg",
  ".ogg": "application/ogg",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".pps": "application/vnd.ms-powerpoint",
  ".ppt": "application/vnd.ms-powerpoint",
  ".ps": "application/postscript",
  ".psd": "image/vnd.adobe.photoshop",
  ".qt": "video/quicktime",
  ".rar": "application/x-rar-compressed",
  ".rdf": "application/rdf+xml",
  ".rss": "application/rss+xml",
  ".rtf": "application/rtf",
  ".svg": "image/svg+xml",
  ".svgz": "image/svg+xml",
  ".swf": "application/x-shockwave-flash",
  ".tar": "application/x-tar",
  ".tbz": "application/x-bzip-compressed-tar",
  ".text": "text/plain",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".torrent": "application/x-bittorrent",
  ".ttf": "application/x-font-ttf",
  ".txt": "text/plain",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".wma": "audio/x-ms-wma",
  ".wmv": "video/x-ms-wmv",
  ".xls": "application/vnd.ms-excel",
  ".xml": "application/xml",
  ".yaml": "text/yaml",
  ".yml": "text/yaml",
  ".zip": "application/zip"
}

},{}],67:[function(require,module,exports){
(function (process){
module.exports = function (tasks, limit, cb) {
  if (typeof limit !== 'number') throw new Error('second argument must be a Number')
  var results, len, pending, keys, isErrored
  var isSync = true

  if (Array.isArray(tasks)) {
    results = []
    pending = len = tasks.length
  } else {
    keys = Object.keys(tasks)
    results = {}
    pending = len = keys.length
  }

  function done (err) {
    function end () {
      if (cb) cb(err, results)
      cb = null
    }
    if (isSync) process.nextTick(end)
    else end()
  }

  function each (i, err, result) {
    results[i] = result
    if (err) isErrored = true
    if (--pending === 0 || err) {
      done(err)
    } else if (!isErrored && next < len) {
      var key
      if (keys) {
        key = keys[next]
        next += 1
        tasks[key](function (err, result) { each(key, err, result) })
      } else {
        key = next
        next += 1
        tasks[key](function (err, result) { each(key, err, result) })
      }
    }
  }

  var next = limit
  if (!pending) {
    // empty
    done(null)
  } else if (keys) {
    // object
    keys.some(function (key, i) {
      tasks[key](function (err, result) { each(key, err, result) })
      if (i === limit - 1) return true // early return
    })
  } else {
    // array
    tasks.some(function (task, i) {
      task(function (err, result) { each(i, err, result) })
      if (i === limit - 1) return true // early return
    })
  }

  isSync = false
}

}).call(this,require('_process'))
},{"_process":130}],68:[function(require,module,exports){
(function (process){
module.exports = function (tasks, cb) {
  var results, pending, keys
  var isSync = true

  if (Array.isArray(tasks)) {
    results = []
    pending = tasks.length
  } else {
    keys = Object.keys(tasks)
    results = {}
    pending = keys.length
  }

  function done (err) {
    function end () {
      if (cb) cb(err, results)
      cb = null
    }
    if (isSync) process.nextTick(end)
    else end()
  }

  function each (i, err, result) {
    results[i] = result
    if (--pending === 0 || err) {
      done(err)
    }
  }

  if (!pending) {
    // empty
    done(null)
  } else if (keys) {
    // object
    keys.forEach(function (key) {
      tasks[key](function (err, result) { each(key, err, result) })
    })
  } else {
    // array
    tasks.forEach(function (task, i) {
      task(function (err, result) { each(i, err, result) })
    })
  }

  isSync = false
}

}).call(this,require('_process'))
},{"_process":130}],69:[function(require,module,exports){
(function (global){
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Rusha = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn, options) {
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp && exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            'function(require,module,exports){' + fn + '(self); }',
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        'function(require,module,exports){' +
            // try to call default if defined to also support babel esmodule exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);' +
        '}',
        scache
    ];

    var workerSources = {};
    resolveSources(skey);

    function resolveSources(key) {
        workerSources[key] = true;

        for (var depPath in sources[key][1]) {
            var depKey = sources[key][1][depPath];
            if (!workerSources[depKey]) {
                resolveSources(depKey);
            }
        }
    }

    var src = '(' + bundleFn + ')({'
        + Object.keys(workerSources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    var blob = new Blob([src], { type: 'text/javascript' });
    if (options && options.bare) { return blob; }
    var workerUrl = URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    worker.objectURL = workerUrl;
    return worker;
};

},{}],2:[function(_dereq_,module,exports){
(function (global){
"use strict";
/* eslint-env commonjs, browser */

var reader = void 0;
if (typeof self !== 'undefined' && typeof self.FileReaderSync !== 'undefined') {
  reader = new self.FileReaderSync();
}

// Convert a binary string and write it to the heap.
// A binary string is expected to only contain char codes < 256.
var convStr = function (str, H8, H32, start, len, off) {
  var i = void 0,
      om = off % 4,
      lm = (len + om) % 4,
      j = len - lm;
  switch (om) {
    case 0:
      H8[off] = str.charCodeAt(start + 3);
    case 1:
      H8[off + 1 - (om << 1) | 0] = str.charCodeAt(start + 2);
    case 2:
      H8[off + 2 - (om << 1) | 0] = str.charCodeAt(start + 1);
    case 3:
      H8[off + 3 - (om << 1) | 0] = str.charCodeAt(start);
  }
  if (len < lm + (4 - om)) {
    return;
  }
  for (i = 4 - om; i < j; i = i + 4 | 0) {
    H32[off + i >> 2] = str.charCodeAt(start + i) << 24 | str.charCodeAt(start + i + 1) << 16 | str.charCodeAt(start + i + 2) << 8 | str.charCodeAt(start + i + 3);
  }
  switch (lm) {
    case 3:
      H8[off + j + 1 | 0] = str.charCodeAt(start + j + 2);
    case 2:
      H8[off + j + 2 | 0] = str.charCodeAt(start + j + 1);
    case 1:
      H8[off + j + 3 | 0] = str.charCodeAt(start + j);
  }
};

// Convert a buffer or array and write it to the heap.
// The buffer or array is expected to only contain elements < 256.
var convBuf = function (buf, H8, H32, start, len, off) {
  var i = void 0,
      om = off % 4,
      lm = (len + om) % 4,
      j = len - lm;
  switch (om) {
    case 0:
      H8[off] = buf[start + 3];
    case 1:
      H8[off + 1 - (om << 1) | 0] = buf[start + 2];
    case 2:
      H8[off + 2 - (om << 1) | 0] = buf[start + 1];
    case 3:
      H8[off + 3 - (om << 1) | 0] = buf[start];
  }
  if (len < lm + (4 - om)) {
    return;
  }
  for (i = 4 - om; i < j; i = i + 4 | 0) {
    H32[off + i >> 2 | 0] = buf[start + i] << 24 | buf[start + i + 1] << 16 | buf[start + i + 2] << 8 | buf[start + i + 3];
  }
  switch (lm) {
    case 3:
      H8[off + j + 1 | 0] = buf[start + j + 2];
    case 2:
      H8[off + j + 2 | 0] = buf[start + j + 1];
    case 1:
      H8[off + j + 3 | 0] = buf[start + j];
  }
};

var convBlob = function (blob, H8, H32, start, len, off) {
  var i = void 0,
      om = off % 4,
      lm = (len + om) % 4,
      j = len - lm;
  var buf = new Uint8Array(reader.readAsArrayBuffer(blob.slice(start, start + len)));
  switch (om) {
    case 0:
      H8[off] = buf[3];
    case 1:
      H8[off + 1 - (om << 1) | 0] = buf[2];
    case 2:
      H8[off + 2 - (om << 1) | 0] = buf[1];
    case 3:
      H8[off + 3 - (om << 1) | 0] = buf[0];
  }
  if (len < lm + (4 - om)) {
    return;
  }
  for (i = 4 - om; i < j; i = i + 4 | 0) {
    H32[off + i >> 2 | 0] = buf[i] << 24 | buf[i + 1] << 16 | buf[i + 2] << 8 | buf[i + 3];
  }
  switch (lm) {
    case 3:
      H8[off + j + 1 | 0] = buf[j + 2];
    case 2:
      H8[off + j + 2 | 0] = buf[j + 1];
    case 1:
      H8[off + j + 3 | 0] = buf[j];
  }
};

module.exports = function (data, H8, H32, start, len, off) {
  if (typeof data === 'string') {
    return convStr(data, H8, H32, start, len, off);
  }
  if (data instanceof Array) {
    return convBuf(data, H8, H32, start, len, off);
  }
  if (global.Buffer && global.Buffer.isBuffer(data)) {
    return convBuf(data, H8, H32, start, len, off);
  }
  if (data instanceof ArrayBuffer) {
    return convBuf(new Uint8Array(data), H8, H32, start, len, off);
  }
  if (data.buffer instanceof ArrayBuffer) {
    return convBuf(new Uint8Array(data.buffer, data.byteOffset, data.byteLength), H8, H32, start, len, off);
  }
  if (data instanceof Blob) {
    return convBlob(data, H8, H32, start, len, off);
  }
  throw new Error('Unsupported data type.');
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],3:[function(_dereq_,module,exports){
'use strict';
// The low-level RushCore module provides the heart of Rusha,
// a high-speed sha1 implementation working on an Int32Array heap.
// At first glance, the implementation seems complicated, however
// with the SHA1 spec at hand, it is obvious this almost a textbook
// implementation that has a few functions hand-inlined and a few loops
// hand-unrolled.
module.exports = function RushaCore(stdlib$1186, foreign$1187, heap$1188) {
    'use asm';
    var H$1189 = new stdlib$1186.Int32Array(heap$1188);
    function hash$1190(k$1191, x$1192) {
        // k in bytes
        k$1191 = k$1191 | 0;
        x$1192 = x$1192 | 0;
        var i$1193 = 0, j$1194 = 0, y0$1195 = 0, z0$1196 = 0, y1$1197 = 0, z1$1198 = 0, y2$1199 = 0, z2$1200 = 0, y3$1201 = 0, z3$1202 = 0, y4$1203 = 0, z4$1204 = 0, t0$1205 = 0, t1$1206 = 0;
        y0$1195 = H$1189[x$1192 + 320 >> 2] | 0;
        y1$1197 = H$1189[x$1192 + 324 >> 2] | 0;
        y2$1199 = H$1189[x$1192 + 328 >> 2] | 0;
        y3$1201 = H$1189[x$1192 + 332 >> 2] | 0;
        y4$1203 = H$1189[x$1192 + 336 >> 2] | 0;
        for (i$1193 = 0; (i$1193 | 0) < (k$1191 | 0); i$1193 = i$1193 + 64 | 0) {
            z0$1196 = y0$1195;
            z1$1198 = y1$1197;
            z2$1200 = y2$1199;
            z3$1202 = y3$1201;
            z4$1204 = y4$1203;
            for (j$1194 = 0; (j$1194 | 0) < 64; j$1194 = j$1194 + 4 | 0) {
                t1$1206 = H$1189[i$1193 + j$1194 >> 2] | 0;
                t0$1205 = ((y0$1195 << 5 | y0$1195 >>> 27) + (y1$1197 & y2$1199 | ~y1$1197 & y3$1201) | 0) + ((t1$1206 + y4$1203 | 0) + 1518500249 | 0) | 0;
                y4$1203 = y3$1201;
                y3$1201 = y2$1199;
                y2$1199 = y1$1197 << 30 | y1$1197 >>> 2;
                y1$1197 = y0$1195;
                y0$1195 = t0$1205;
                H$1189[k$1191 + j$1194 >> 2] = t1$1206;
            }
            for (j$1194 = k$1191 + 64 | 0; (j$1194 | 0) < (k$1191 + 80 | 0); j$1194 = j$1194 + 4 | 0) {
                t1$1206 = (H$1189[j$1194 - 12 >> 2] ^ H$1189[j$1194 - 32 >> 2] ^ H$1189[j$1194 - 56 >> 2] ^ H$1189[j$1194 - 64 >> 2]) << 1 | (H$1189[j$1194 - 12 >> 2] ^ H$1189[j$1194 - 32 >> 2] ^ H$1189[j$1194 - 56 >> 2] ^ H$1189[j$1194 - 64 >> 2]) >>> 31;
                t0$1205 = ((y0$1195 << 5 | y0$1195 >>> 27) + (y1$1197 & y2$1199 | ~y1$1197 & y3$1201) | 0) + ((t1$1206 + y4$1203 | 0) + 1518500249 | 0) | 0;
                y4$1203 = y3$1201;
                y3$1201 = y2$1199;
                y2$1199 = y1$1197 << 30 | y1$1197 >>> 2;
                y1$1197 = y0$1195;
                y0$1195 = t0$1205;
                H$1189[j$1194 >> 2] = t1$1206;
            }
            for (j$1194 = k$1191 + 80 | 0; (j$1194 | 0) < (k$1191 + 160 | 0); j$1194 = j$1194 + 4 | 0) {
                t1$1206 = (H$1189[j$1194 - 12 >> 2] ^ H$1189[j$1194 - 32 >> 2] ^ H$1189[j$1194 - 56 >> 2] ^ H$1189[j$1194 - 64 >> 2]) << 1 | (H$1189[j$1194 - 12 >> 2] ^ H$1189[j$1194 - 32 >> 2] ^ H$1189[j$1194 - 56 >> 2] ^ H$1189[j$1194 - 64 >> 2]) >>> 31;
                t0$1205 = ((y0$1195 << 5 | y0$1195 >>> 27) + (y1$1197 ^ y2$1199 ^ y3$1201) | 0) + ((t1$1206 + y4$1203 | 0) + 1859775393 | 0) | 0;
                y4$1203 = y3$1201;
                y3$1201 = y2$1199;
                y2$1199 = y1$1197 << 30 | y1$1197 >>> 2;
                y1$1197 = y0$1195;
                y0$1195 = t0$1205;
                H$1189[j$1194 >> 2] = t1$1206;
            }
            for (j$1194 = k$1191 + 160 | 0; (j$1194 | 0) < (k$1191 + 240 | 0); j$1194 = j$1194 + 4 | 0) {
                t1$1206 = (H$1189[j$1194 - 12 >> 2] ^ H$1189[j$1194 - 32 >> 2] ^ H$1189[j$1194 - 56 >> 2] ^ H$1189[j$1194 - 64 >> 2]) << 1 | (H$1189[j$1194 - 12 >> 2] ^ H$1189[j$1194 - 32 >> 2] ^ H$1189[j$1194 - 56 >> 2] ^ H$1189[j$1194 - 64 >> 2]) >>> 31;
                t0$1205 = ((y0$1195 << 5 | y0$1195 >>> 27) + (y1$1197 & y2$1199 | y1$1197 & y3$1201 | y2$1199 & y3$1201) | 0) + ((t1$1206 + y4$1203 | 0) - 1894007588 | 0) | 0;
                y4$1203 = y3$1201;
                y3$1201 = y2$1199;
                y2$1199 = y1$1197 << 30 | y1$1197 >>> 2;
                y1$1197 = y0$1195;
                y0$1195 = t0$1205;
                H$1189[j$1194 >> 2] = t1$1206;
            }
            for (j$1194 = k$1191 + 240 | 0; (j$1194 | 0) < (k$1191 + 320 | 0); j$1194 = j$1194 + 4 | 0) {
                t1$1206 = (H$1189[j$1194 - 12 >> 2] ^ H$1189[j$1194 - 32 >> 2] ^ H$1189[j$1194 - 56 >> 2] ^ H$1189[j$1194 - 64 >> 2]) << 1 | (H$1189[j$1194 - 12 >> 2] ^ H$1189[j$1194 - 32 >> 2] ^ H$1189[j$1194 - 56 >> 2] ^ H$1189[j$1194 - 64 >> 2]) >>> 31;
                t0$1205 = ((y0$1195 << 5 | y0$1195 >>> 27) + (y1$1197 ^ y2$1199 ^ y3$1201) | 0) + ((t1$1206 + y4$1203 | 0) - 899497514 | 0) | 0;
                y4$1203 = y3$1201;
                y3$1201 = y2$1199;
                y2$1199 = y1$1197 << 30 | y1$1197 >>> 2;
                y1$1197 = y0$1195;
                y0$1195 = t0$1205;
                H$1189[j$1194 >> 2] = t1$1206;
            }
            y0$1195 = y0$1195 + z0$1196 | 0;
            y1$1197 = y1$1197 + z1$1198 | 0;
            y2$1199 = y2$1199 + z2$1200 | 0;
            y3$1201 = y3$1201 + z3$1202 | 0;
            y4$1203 = y4$1203 + z4$1204 | 0;
        }
        H$1189[x$1192 + 320 >> 2] = y0$1195;
        H$1189[x$1192 + 324 >> 2] = y1$1197;
        H$1189[x$1192 + 328 >> 2] = y2$1199;
        H$1189[x$1192 + 332 >> 2] = y3$1201;
        H$1189[x$1192 + 336 >> 2] = y4$1203;
    }
    return { hash: hash$1190 };
};

},{}],4:[function(_dereq_,module,exports){
"use strict";
/* eslint-env commonjs, browser */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rusha = _dereq_('./rusha');

var _require = _dereq_('./utils'),
    toHex = _require.toHex;

var Hash = function () {
  function Hash() {
    _classCallCheck(this, Hash);

    this._rusha = new Rusha();
    this._rusha.resetState();
  }

  Hash.prototype.update = function update(data) {
    this._rusha.append(data);
    return this;
  };

  Hash.prototype.digest = function digest(encoding) {
    var digest = this._rusha.rawEnd().buffer;
    if (!encoding) {
      return digest;
    }
    if (encoding === 'hex') {
      return toHex(digest);
    }
    throw new Error('unsupported digest encoding');
  };

  return Hash;
}();

module.exports = function () {
  return new Hash();
};

},{"./rusha":6,"./utils":7}],5:[function(_dereq_,module,exports){
"use strict";
/* eslint-env commonjs, browser */

var webworkify = _dereq_('webworkify');

var Rusha = _dereq_('./rusha');
var createHash = _dereq_('./hash');
var runWorker = _dereq_('./worker');

var _require = _dereq_('./utils'),
    isDedicatedWorkerScope = _require.isDedicatedWorkerScope;

var isRunningInDedicatedWorker = typeof self !== 'undefined' && isDedicatedWorkerScope(self);

Rusha.disableWorkerBehaviour = isRunningInDedicatedWorker ? runWorker() : function () {};

Rusha.createWorker = function () {
  var worker = webworkify(_dereq_('./worker'));
  var terminate = worker.terminate;
  worker.terminate = function () {
    URL.revokeObjectURL(worker.objectURL);
    terminate.call(worker);
  };
  return worker;
};

Rusha.createHash = createHash;

module.exports = Rusha;

},{"./hash":4,"./rusha":6,"./utils":7,"./worker":8,"webworkify":1}],6:[function(_dereq_,module,exports){
"use strict";
/* eslint-env commonjs, browser */

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RushaCore = _dereq_('./core.sjs');

var _require = _dereq_('./utils'),
    toHex = _require.toHex,
    ceilHeapSize = _require.ceilHeapSize;

var conv = _dereq_('./conv');

// Calculate the length of buffer that the sha1 routine uses
// including the padding.
var padlen = function (len) {
  for (len += 9; len % 64 > 0; len += 1) {}
  return len;
};

var padZeroes = function (bin, len) {
  var h8 = new Uint8Array(bin.buffer);
  var om = len % 4,
      align = len - om;
  switch (om) {
    case 0:
      h8[align + 3] = 0;
    case 1:
      h8[align + 2] = 0;
    case 2:
      h8[align + 1] = 0;
    case 3:
      h8[align + 0] = 0;
  }
  for (var i = (len >> 2) + 1; i < bin.length; i++) {
    bin[i] = 0;
  }
};

var padData = function (bin, chunkLen, msgLen) {
  bin[chunkLen >> 2] |= 0x80 << 24 - (chunkLen % 4 << 3);
  // To support msgLen >= 2 GiB, use a float division when computing the
  // high 32-bits of the big-endian message length in bits.
  bin[((chunkLen >> 2) + 2 & ~0x0f) + 14] = msgLen / (1 << 29) | 0;
  bin[((chunkLen >> 2) + 2 & ~0x0f) + 15] = msgLen << 3;
};

var getRawDigest = function (heap, padMaxChunkLen) {
  var io = new Int32Array(heap, padMaxChunkLen + 320, 5);
  var out = new Int32Array(5);
  var arr = new DataView(out.buffer);
  arr.setInt32(0, io[0], false);
  arr.setInt32(4, io[1], false);
  arr.setInt32(8, io[2], false);
  arr.setInt32(12, io[3], false);
  arr.setInt32(16, io[4], false);
  return out;
};

var Rusha = function () {
  function Rusha(chunkSize) {
    _classCallCheck(this, Rusha);

    chunkSize = chunkSize || 64 * 1024;
    if (chunkSize % 64 > 0) {
      throw new Error('Chunk size must be a multiple of 128 bit');
    }
    this._offset = 0;
    this._maxChunkLen = chunkSize;
    this._padMaxChunkLen = padlen(chunkSize);
    // The size of the heap is the sum of:
    // 1. The padded input message size
    // 2. The extended space the algorithm needs (320 byte)
    // 3. The 160 bit state the algoritm uses
    this._heap = new ArrayBuffer(ceilHeapSize(this._padMaxChunkLen + 320 + 20));
    this._h32 = new Int32Array(this._heap);
    this._h8 = new Int8Array(this._heap);
    this._core = new RushaCore({ Int32Array: Int32Array }, {}, this._heap);
  }

  Rusha.prototype._initState = function _initState(heap, padMsgLen) {
    this._offset = 0;
    var io = new Int32Array(heap, padMsgLen + 320, 5);
    io[0] = 1732584193;
    io[1] = -271733879;
    io[2] = -1732584194;
    io[3] = 271733878;
    io[4] = -1009589776;
  };

  Rusha.prototype._padChunk = function _padChunk(chunkLen, msgLen) {
    var padChunkLen = padlen(chunkLen);
    var view = new Int32Array(this._heap, 0, padChunkLen >> 2);
    padZeroes(view, chunkLen);
    padData(view, chunkLen, msgLen);
    return padChunkLen;
  };

  Rusha.prototype._write = function _write(data, chunkOffset, chunkLen, off) {
    conv(data, this._h8, this._h32, chunkOffset, chunkLen, off || 0);
  };

  Rusha.prototype._coreCall = function _coreCall(data, chunkOffset, chunkLen, msgLen, finalize) {
    var padChunkLen = chunkLen;
    this._write(data, chunkOffset, chunkLen);
    if (finalize) {
      padChunkLen = this._padChunk(chunkLen, msgLen);
    }
    this._core.hash(padChunkLen, this._padMaxChunkLen);
  };

  Rusha.prototype.rawDigest = function rawDigest(str) {
    var msgLen = str.byteLength || str.length || str.size || 0;
    this._initState(this._heap, this._padMaxChunkLen);
    var chunkOffset = 0,
        chunkLen = this._maxChunkLen;
    for (chunkOffset = 0; msgLen > chunkOffset + chunkLen; chunkOffset += chunkLen) {
      this._coreCall(str, chunkOffset, chunkLen, msgLen, false);
    }
    this._coreCall(str, chunkOffset, msgLen - chunkOffset, msgLen, true);
    return getRawDigest(this._heap, this._padMaxChunkLen);
  };

  Rusha.prototype.digest = function digest(str) {
    return toHex(this.rawDigest(str).buffer);
  };

  Rusha.prototype.digestFromString = function digestFromString(str) {
    return this.digest(str);
  };

  Rusha.prototype.digestFromBuffer = function digestFromBuffer(str) {
    return this.digest(str);
  };

  Rusha.prototype.digestFromArrayBuffer = function digestFromArrayBuffer(str) {
    return this.digest(str);
  };

  Rusha.prototype.resetState = function resetState() {
    this._initState(this._heap, this._padMaxChunkLen);
    return this;
  };

  Rusha.prototype.append = function append(chunk) {
    var chunkOffset = 0;
    var chunkLen = chunk.byteLength || chunk.length || chunk.size || 0;
    var turnOffset = this._offset % this._maxChunkLen;
    var inputLen = void 0;

    this._offset += chunkLen;
    while (chunkOffset < chunkLen) {
      inputLen = Math.min(chunkLen - chunkOffset, this._maxChunkLen - turnOffset);
      this._write(chunk, chunkOffset, inputLen, turnOffset);
      turnOffset += inputLen;
      chunkOffset += inputLen;
      if (turnOffset === this._maxChunkLen) {
        this._core.hash(this._maxChunkLen, this._padMaxChunkLen);
        turnOffset = 0;
      }
    }
    return this;
  };

  Rusha.prototype.getState = function getState() {
    var turnOffset = this._offset % this._maxChunkLen;
    var heap = void 0;
    if (!turnOffset) {
      var io = new Int32Array(this._heap, this._padMaxChunkLen + 320, 5);
      heap = io.buffer.slice(io.byteOffset, io.byteOffset + io.byteLength);
    } else {
      heap = this._heap.slice(0);
    }
    return {
      offset: this._offset,
      heap: heap
    };
  };

  Rusha.prototype.setState = function setState(state) {
    this._offset = state.offset;
    if (state.heap.byteLength === 20) {
      var io = new Int32Array(this._heap, this._padMaxChunkLen + 320, 5);
      io.set(new Int32Array(state.heap));
    } else {
      this._h32.set(new Int32Array(state.heap));
    }
    return this;
  };

  Rusha.prototype.rawEnd = function rawEnd() {
    var msgLen = this._offset;
    var chunkLen = msgLen % this._maxChunkLen;
    var padChunkLen = this._padChunk(chunkLen, msgLen);
    this._core.hash(padChunkLen, this._padMaxChunkLen);
    var result = getRawDigest(this._heap, this._padMaxChunkLen);
    this._initState(this._heap, this._padMaxChunkLen);
    return result;
  };

  Rusha.prototype.end = function end() {
    return toHex(this.rawEnd().buffer);
  };

  return Rusha;
}();

module.exports = Rusha;
module.exports._core = RushaCore;

},{"./conv":2,"./core.sjs":3,"./utils":7}],7:[function(_dereq_,module,exports){
"use strict";
/* eslint-env commonjs, browser */

//
// toHex
//

var precomputedHex = new Array(256);
for (var i = 0; i < 256; i++) {
  precomputedHex[i] = (i < 0x10 ? '0' : '') + i.toString(16);
}

module.exports.toHex = function (arrayBuffer) {
  var binarray = new Uint8Array(arrayBuffer);
  var res = new Array(arrayBuffer.byteLength);
  for (var _i = 0; _i < res.length; _i++) {
    res[_i] = precomputedHex[binarray[_i]];
  }
  return res.join('');
};

//
// ceilHeapSize
//

module.exports.ceilHeapSize = function (v) {
  // The asm.js spec says:
  // The heap object's byteLength must be either
  // 2^n for n in [12, 24) or 2^24 * n for n ≥ 1.
  // Also, byteLengths smaller than 2^16 are deprecated.
  var p = 0;
  // If v is smaller than 2^16, the smallest possible solution
  // is 2^16.
  if (v <= 65536) return 65536;
  // If v < 2^24, we round up to 2^n,
  // otherwise we round up to 2^24 * n.
  if (v < 16777216) {
    for (p = 1; p < v; p = p << 1) {}
  } else {
    for (p = 16777216; p < v; p += 16777216) {}
  }
  return p;
};

//
// isDedicatedWorkerScope
//

module.exports.isDedicatedWorkerScope = function (self) {
  var isRunningInWorker = 'WorkerGlobalScope' in self && self instanceof self.WorkerGlobalScope;
  var isRunningInSharedWorker = 'SharedWorkerGlobalScope' in self && self instanceof self.SharedWorkerGlobalScope;
  var isRunningInServiceWorker = 'ServiceWorkerGlobalScope' in self && self instanceof self.ServiceWorkerGlobalScope;

  // Detects whether we run inside a dedicated worker or not.
  //
  // We can't just check for `DedicatedWorkerGlobalScope`, since IE11
  // has a bug where it only supports `WorkerGlobalScope`.
  //
  // Therefore, we consider us as running inside a dedicated worker
  // when we are running inside a worker, but not in a shared or service worker.
  //
  // When new types of workers are introduced, we will need to adjust this code.
  return isRunningInWorker && !isRunningInSharedWorker && !isRunningInServiceWorker;
};

},{}],8:[function(_dereq_,module,exports){
"use strict";
/* eslint-env commonjs, worker */

module.exports = function () {
  var Rusha = _dereq_('./rusha');

  var hashData = function (hasher, data, cb) {
    try {
      return cb(null, hasher.digest(data));
    } catch (e) {
      return cb(e);
    }
  };

  var hashFile = function (hasher, readTotal, blockSize, file, cb) {
    var reader = new self.FileReader();
    reader.onloadend = function onloadend() {
      if (reader.error) {
        return cb(reader.error);
      }
      var buffer = reader.result;
      readTotal += reader.result.byteLength;
      try {
        hasher.append(buffer);
      } catch (e) {
        cb(e);
        return;
      }
      if (readTotal < file.size) {
        hashFile(hasher, readTotal, blockSize, file, cb);
      } else {
        cb(null, hasher.end());
      }
    };
    reader.readAsArrayBuffer(file.slice(readTotal, readTotal + blockSize));
  };

  var workerBehaviourEnabled = true;

  self.onmessage = function (event) {
    if (!workerBehaviourEnabled) {
      return;
    }

    var data = event.data.data,
        file = event.data.file,
        id = event.data.id;
    if (typeof id === 'undefined') return;
    if (!file && !data) return;
    var blockSize = event.data.blockSize || 4 * 1024 * 1024;
    var hasher = new Rusha(blockSize);
    hasher.resetState();
    var done = function (err, hash) {
      if (!err) {
        self.postMessage({ id: id, hash: hash });
      } else {
        self.postMessage({ id: id, error: err.name });
      }
    };
    if (data) hashData(hasher, data, done);
    if (file) hashFile(hasher, 0, blockSize, file, done);
  };

  return function () {
    workerBehaviourEnabled = false;
  };
};

},{"./rusha":6}]},{},[5])(5)
});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],70:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":119}],71:[function(require,module,exports){
(function (Buffer){
module.exports = function (stream, cb) {
  var chunks = []
  stream.on('data', function (chunk) {
    chunks.push(chunk)
  })
  stream.once('end', function () {
    if (cb) cb(null, Buffer.concat(chunks))
    cb = null
  })
  stream.once('error', function (err) {
    if (cb) cb(err)
    cb = null
  })
}

}).call(this,require("buffer").Buffer)
},{"buffer":119}],72:[function(require,module,exports){
(function (Buffer){
module.exports = simpleGet

var concat = require('simple-concat')
var http = require('http')
var https = require('https')
var once = require('once')
var querystring = require('querystring')
var decompressResponse = require('decompress-response') // excluded from browser build
var url = require('url')

function simpleGet (opts, cb) {
  opts = typeof opts === 'string' ? {url: opts} : Object.assign({}, opts)
  opts.headers = Object.assign({}, opts.headers)
  cb = once(cb)

  if (opts.url) parseOptsUrl(opts)
  if (opts.maxRedirects == null) opts.maxRedirects = 10

  var body
  if (opts.form) body = typeof opts.form === 'string' ? opts.form : querystring.stringify(opts.form)
  if (opts.body) body = opts.json && !isStream(opts.body) ? JSON.stringify(opts.body) : opts.body

  if (opts.json) opts.headers.accept = 'application/json'
  if (opts.json && body) opts.headers['content-type'] = 'application/json'
  if (opts.form) opts.headers['content-type'] = 'application/x-www-form-urlencoded'
  if (body && !isStream(body)) opts.headers['content-length'] = Buffer.byteLength(body)
  delete opts.body
  delete opts.form

  if (body && !opts.method) opts.method = 'POST'
  if (opts.method) opts.method = opts.method.toUpperCase()

  // Request gzip/deflate
  var customAcceptEncoding = Object.keys(opts.headers).some(function (h) {
    return h.toLowerCase() === 'accept-encoding'
  })
  if (!customAcceptEncoding) opts.headers['accept-encoding'] = 'gzip, deflate'

  // Support http/https urls
  var protocol = opts.protocol === 'https:' ? https : http
  var req = protocol.request(opts, function (res) {
    // Follow 3xx redirects
    if (res.statusCode >= 300 && res.statusCode < 400 && 'location' in res.headers) {
      opts.url = res.headers.location
      res.resume() // Discard response

      if (opts.maxRedirects > 0) {
        opts.maxRedirects -= 1
        simpleGet(opts, cb)
      } else {
        cb(new Error('too many redirects'))
      }
      return
    }

    var tryUnzip = typeof decompressResponse === 'function' && opts.method !== 'HEAD'
    cb(null, tryUnzip ? decompressResponse(res) : res)
  })
  req.on('timeout', function () {
    req.abort()
    cb(new Error('Request timed out'))
  })
  req.on('error', cb)

  if (body && isStream(body)) body.on('error', cb).pipe(req)
  else req.end(body)

  return req
}

simpleGet.concat = function (opts, cb) {
  return simpleGet(opts, function (err, res) {
    if (err) return cb(err)
    concat(res, function (err, data) {
      if (err) return cb(err)
      if (opts.json) {
        try {
          data = JSON.parse(data.toString())
        } catch (err) {
          return cb(err, res, data)
        }
      }
      cb(null, res, data)
    })
  })
}

;['get', 'post', 'put', 'patch', 'head', 'delete'].forEach(function (method) {
  simpleGet[method] = function (opts, cb) {
    if (typeof opts === 'string') opts = {url: opts}
    opts.method = method.toUpperCase()
    return simpleGet(opts, cb)
  }
})

function parseOptsUrl (opts) {
  var loc = url.parse(opts.url)
  if (loc.hostname) opts.hostname = loc.hostname
  if (loc.port) opts.port = loc.port
  if (loc.protocol) opts.protocol = loc.protocol
  if (loc.auth) opts.auth = loc.auth
  opts.path = loc.path
  delete opts.url
}

function isStream (obj) { return typeof obj.pipe === 'function' }

}).call(this,require("buffer").Buffer)
},{"buffer":119,"decompress-response":118,"http":145,"https":123,"once":48,"querystring":134,"simple-concat":71,"url":151}],73:[function(require,module,exports){
(function (Buffer){
module.exports = Peer

var debug = require('debug')('simple-peer')
var getBrowserRTC = require('get-browser-rtc')
var inherits = require('inherits')
var randombytes = require('randombytes')
var stream = require('readable-stream')

var MAX_BUFFERED_AMOUNT = 64 * 1024

inherits(Peer, stream.Duplex)

/**
 * WebRTC peer connection. Same API as node core `net.Socket`, plus a few extra methods.
 * Duplex stream.
 * @param {Object} opts
 */
function Peer (opts) {
  var self = this
  if (!(self instanceof Peer)) return new Peer(opts)

  self._id = randombytes(4).toString('hex').slice(0, 7)
  self._debug('new peer %o', opts)

  opts = Object.assign({
    allowHalfOpen: false
  }, opts)

  stream.Duplex.call(self, opts)

  self.channelName = opts.initiator
    ? opts.channelName || randombytes(20).toString('hex')
    : null

  // Needed by _transformConstraints, so set this early
  self._isChromium = typeof window !== 'undefined' && !!window.webkitRTCPeerConnection

  self.initiator = opts.initiator || false
  self.channelConfig = opts.channelConfig || Peer.channelConfig
  self.config = opts.config || Peer.config
  self.constraints = self._transformConstraints(opts.constraints || Peer.constraints)
  self.offerConstraints = self._transformConstraints(opts.offerConstraints || {})
  self.answerConstraints = self._transformConstraints(opts.answerConstraints || {})
  self.reconnectTimer = opts.reconnectTimer || false
  self.sdpTransform = opts.sdpTransform || function (sdp) { return sdp }
  self.stream = opts.stream || false
  self.trickle = opts.trickle !== undefined ? opts.trickle : true
  self._earlyMessage = null

  self.destroyed = false
  self.connected = false

  self.remoteAddress = undefined
  self.remoteFamily = undefined
  self.remotePort = undefined
  self.localAddress = undefined
  self.localPort = undefined

  self._wrtc = (opts.wrtc && typeof opts.wrtc === 'object')
    ? opts.wrtc
    : getBrowserRTC()

  if (!self._wrtc) {
    if (typeof window === 'undefined') {
      throw new Error('No WebRTC support: Specify `opts.wrtc` option in this environment')
    } else {
      throw new Error('No WebRTC support: Not a supported browser')
    }
  }

  self._pcReady = false
  self._channelReady = false
  self._iceComplete = false // ice candidate trickle done (got null candidate)
  self._channel = null
  self._pendingCandidates = []
  self._previousStreams = []

  self._chunk = null
  self._cb = null
  self._interval = null
  self._reconnectTimeout = null

  self._pc = new (self._wrtc.RTCPeerConnection)(self.config, self.constraints)

  // We prefer feature detection whenever possible, but sometimes that's not
  // possible for certain implementations.
  self._isWrtc = Array.isArray(self._pc.RTCIceConnectionStates)
  self._isReactNativeWebrtc = typeof self._pc._peerConnectionId === 'number'

  self._pc.oniceconnectionstatechange = function () {
    self._onIceStateChange()
  }
  self._pc.onicegatheringstatechange = function () {
    self._onIceStateChange()
  }
  self._pc.onsignalingstatechange = function () {
    self._onSignalingStateChange()
  }
  self._pc.onicecandidate = function (event) {
    self._onIceCandidate(event)
  }

  // Other spec events, unused by this implementation:
  // - onconnectionstatechange
  // - onicecandidateerror
  // - onfingerprintfailure

  if (self.initiator) {
    var createdOffer = false
    self._pc.onnegotiationneeded = function () {
      if (!createdOffer) self._createOffer()
      createdOffer = true
    }

    self._setupData({
      channel: self._pc.createDataChannel(self.channelName, self.channelConfig)
    })
  } else {
    self._pc.ondatachannel = function (event) {
      self._setupData(event)
    }
  }

  if ('addTrack' in self._pc) {
    // WebRTC Spec, Firefox
    if (self.stream) {
      self.stream.getTracks().forEach(function (track) {
        self._pc.addTrack(track, self.stream)
      })
    }
    self._pc.ontrack = function (event) {
      self._onTrack(event)
    }
  } else {
    // Chrome, etc. This can be removed once all browsers support `ontrack`
    if (self.stream) self._pc.addStream(self.stream)
    self._pc.onaddstream = function (event) {
      self._onAddStream(event)
    }
  }

  // HACK: wrtc doesn't fire the 'negotionneeded' event
  if (self.initiator && self._isWrtc) {
    self._pc.onnegotiationneeded()
  }

  self._onFinishBound = function () {
    self._onFinish()
  }
  self.once('finish', self._onFinishBound)
}

Peer.WEBRTC_SUPPORT = !!getBrowserRTC()

/**
 * Expose config, constraints, and data channel config for overriding all Peer
 * instances. Otherwise, just set opts.config, opts.constraints, or opts.channelConfig
 * when constructing a Peer.
 */
Peer.config = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
    {
      urls: 'stun:global.stun.twilio.com:3478?transport=udp'
    }
  ]
}
Peer.constraints = {}
Peer.channelConfig = {}

Object.defineProperty(Peer.prototype, 'bufferSize', {
  get: function () {
    var self = this
    return (self._channel && self._channel.bufferedAmount) || 0
  }
})

Peer.prototype.address = function () {
  var self = this
  return { port: self.localPort, family: 'IPv4', address: self.localAddress }
}

Peer.prototype.signal = function (data) {
  var self = this
  if (self.destroyed) throw new Error('cannot signal after peer is destroyed')
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data)
    } catch (err) {
      data = {}
    }
  }
  self._debug('signal()')

  if (data.candidate) {
    if (self._pc.remoteDescription) self._addIceCandidate(data.candidate)
    else self._pendingCandidates.push(data.candidate)
  }
  if (data.sdp) {
    self._pc.setRemoteDescription(new (self._wrtc.RTCSessionDescription)(data), function () {
      if (self.destroyed) return

      self._pendingCandidates.forEach(function (candidate) {
        self._addIceCandidate(candidate)
      })
      self._pendingCandidates = []

      if (self._pc.remoteDescription.type === 'offer') self._createAnswer()
    }, function (err) { self._destroy(err) })
  }
  if (!data.sdp && !data.candidate) {
    self._destroy(new Error('signal() called with invalid signal data'))
  }
}

Peer.prototype._addIceCandidate = function (candidate) {
  var self = this
  try {
    self._pc.addIceCandidate(
      new self._wrtc.RTCIceCandidate(candidate),
      noop,
      function (err) { self._destroy(err) }
    )
  } catch (err) {
    self._destroy(new Error('error adding candidate: ' + err.message))
  }
}

/**
 * Send text/binary data to the remote peer.
 * @param {TypedArrayView|ArrayBuffer|Buffer|string|Blob|Object} chunk
 */
Peer.prototype.send = function (chunk) {
  var self = this

  // HACK: `wrtc` module crashes on Node.js Buffer, so convert to Uint8Array
  // See: https://github.com/feross/simple-peer/issues/60
  if (self._isWrtc && Buffer.isBuffer(chunk)) {
    chunk = new Uint8Array(chunk)
  }

  self._channel.send(chunk)
}

Peer.prototype.destroy = function (onclose) {
  var self = this
  self._destroy(null, onclose)
}

Peer.prototype._destroy = function (err, onclose) {
  var self = this
  if (self.destroyed) return
  if (onclose) self.once('close', onclose)

  self._debug('destroy (error: %s)', err && (err.message || err))

  self.readable = self.writable = false

  if (!self._readableState.ended) self.push(null)
  if (!self._writableState.finished) self.end()

  self.destroyed = true
  self.connected = false
  self._pcReady = false
  self._channelReady = false
  self._previousStreams = null
  self._earlyMessage = null

  clearInterval(self._interval)
  clearTimeout(self._reconnectTimeout)
  self._interval = null
  self._reconnectTimeout = null
  self._chunk = null
  self._cb = null

  if (self._onFinishBound) self.removeListener('finish', self._onFinishBound)
  self._onFinishBound = null

  if (self._pc) {
    try {
      self._pc.close()
    } catch (err) {}

    self._pc.oniceconnectionstatechange = null
    self._pc.onicegatheringstatechange = null
    self._pc.onsignalingstatechange = null
    self._pc.onicecandidate = null
    if ('addTrack' in self._pc) {
      self._pc.ontrack = null
    } else {
      self._pc.onaddstream = null
    }
    self._pc.onnegotiationneeded = null
    self._pc.ondatachannel = null
  }

  if (self._channel) {
    try {
      self._channel.close()
    } catch (err) {}

    self._channel.onmessage = null
    self._channel.onopen = null
    self._channel.onclose = null
    self._channel.onerror = null
  }
  self._pc = null
  self._channel = null

  if (err) self.emit('error', err)
  self.emit('close')
}

Peer.prototype._setupData = function (event) {
  var self = this
  if (!event.channel) {
    // In some situations `pc.createDataChannel()` returns `undefined` (in wrtc),
    // which is invalid behavior. Handle it gracefully.
    // See: https://github.com/feross/simple-peer/issues/163
    return self._destroy(new Error('Data channel event is missing `channel` property'))
  }

  self._channel = event.channel
  self._channel.binaryType = 'arraybuffer'

  if (typeof self._channel.bufferedAmountLowThreshold === 'number') {
    self._channel.bufferedAmountLowThreshold = MAX_BUFFERED_AMOUNT
  }

  self.channelName = self._channel.label

  self._channel.onmessage = function (event) {
    if (!self._channelReady) { // HACK: Workaround for Chrome not firing "open" between tabs
      self._earlyMessage = event
      self._onChannelOpen()
    } else {
      self._onChannelMessage(event)
    }
  }
  self._channel.onbufferedamountlow = function () {
    self._onChannelBufferedAmountLow()
  }
  self._channel.onopen = function () {
    if (!self._channelReady) self._onChannelOpen()
  }
  self._channel.onclose = function () {
    self._onChannelClose()
  }
  self._channel.onerror = function (err) {
    self._destroy(err)
  }
}

Peer.prototype._read = function () {}

Peer.prototype._write = function (chunk, encoding, cb) {
  var self = this
  if (self.destroyed) return cb(new Error('cannot write after peer is destroyed'))

  if (self.connected) {
    try {
      self.send(chunk)
    } catch (err) {
      return self._destroy(err)
    }
    if (self._channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
      self._debug('start backpressure: bufferedAmount %d', self._channel.bufferedAmount)
      self._cb = cb
    } else {
      cb(null)
    }
  } else {
    self._debug('write before connect')
    self._chunk = chunk
    self._cb = cb
  }
}

// When stream finishes writing, close socket. Half open connections are not
// supported.
Peer.prototype._onFinish = function () {
  var self = this
  if (self.destroyed) return

  if (self.connected) {
    destroySoon()
  } else {
    self.once('connect', destroySoon)
  }

  // Wait a bit before destroying so the socket flushes.
  // TODO: is there a more reliable way to accomplish this?
  function destroySoon () {
    setTimeout(function () {
      self._destroy()
    }, 1000)
  }
}

Peer.prototype._createOffer = function () {
  var self = this
  if (self.destroyed) return

  self._pc.createOffer(function (offer) {
    if (self.destroyed) return
    offer.sdp = self.sdpTransform(offer.sdp)
    self._pc.setLocalDescription(offer, onSuccess, onError)

    function onSuccess () {
      if (self.destroyed) return
      if (self.trickle || self._iceComplete) sendOffer()
      else self.once('_iceComplete', sendOffer) // wait for candidates
    }

    function onError (err) {
      self._destroy(err)
    }

    function sendOffer () {
      var signal = self._pc.localDescription || offer
      self._debug('signal')
      self.emit('signal', {
        type: signal.type,
        sdp: signal.sdp
      })
    }
  }, function (err) { self._destroy(err) }, self.offerConstraints)
}

Peer.prototype._createAnswer = function () {
  var self = this
  if (self.destroyed) return

  self._pc.createAnswer(function (answer) {
    if (self.destroyed) return
    answer.sdp = self.sdpTransform(answer.sdp)
    self._pc.setLocalDescription(answer, onSuccess, onError)

    function onSuccess () {
      if (self.destroyed) return
      if (self.trickle || self._iceComplete) sendAnswer()
      else self.once('_iceComplete', sendAnswer)
    }

    function onError (err) {
      self._destroy(err)
    }

    function sendAnswer () {
      var signal = self._pc.localDescription || answer
      self._debug('signal')
      self.emit('signal', {
        type: signal.type,
        sdp: signal.sdp
      })
    }
  }, function (err) { self._destroy(err) }, self.answerConstraints)
}

Peer.prototype._onIceStateChange = function () {
  var self = this
  if (self.destroyed) return
  var iceConnectionState = self._pc.iceConnectionState
  var iceGatheringState = self._pc.iceGatheringState

  self._debug(
    'iceStateChange (connection: %s) (gathering: %s)',
    iceConnectionState,
    iceGatheringState
  )
  self.emit('iceStateChange', iceConnectionState, iceGatheringState)

  if (iceConnectionState === 'connected' || iceConnectionState === 'completed') {
    clearTimeout(self._reconnectTimeout)
    self._pcReady = true
    self._maybeReady()
  }
  if (iceConnectionState === 'disconnected') {
    if (self.reconnectTimer) {
      // If user has set `opt.reconnectTimer`, allow time for ICE to attempt a reconnect
      clearTimeout(self._reconnectTimeout)
      self._reconnectTimeout = setTimeout(function () {
        self._destroy()
      }, self.reconnectTimer)
    } else {
      self._destroy()
    }
  }
  if (iceConnectionState === 'failed') {
    self._destroy(new Error('Ice connection failed.'))
  }
  if (iceConnectionState === 'closed') {
    self._destroy()
  }
}

Peer.prototype.getStats = function (cb) {
  var self = this

  // Promise-based getStats() (standard)
  if (self._pc.getStats.length === 0) {
    self._pc.getStats().then(function (res) {
      var reports = []
      res.forEach(function (report) {
        reports.push(report)
      })
      cb(null, reports)
    }, function (err) { cb(err) })

  // Two-parameter callback-based getStats() (deprecated, former standard)
  } else if (self._isReactNativeWebrtc) {
    self._pc.getStats(null, function (res) {
      var reports = []
      res.forEach(function (report) {
        reports.push(report)
      })
      cb(null, reports)
    }, function (err) { cb(err) })

  // Single-parameter callback-based getStats() (non-standard)
  } else if (self._pc.getStats.length > 0) {
    self._pc.getStats(function (res) {
      // If we destroy connection in `connect` callback this code might happen to run when actual connection is already closed
      if (self.destroyed) return

      var reports = []
      res.result().forEach(function (result) {
        var report = {}
        result.names().forEach(function (name) {
          report[name] = result.stat(name)
        })
        report.id = result.id
        report.type = result.type
        report.timestamp = result.timestamp
        reports.push(report)
      })
      cb(null, reports)
    }, function (err) { cb(err) })

  // Unknown browser, skip getStats() since it's anyone's guess which style of
  // getStats() they implement.
  } else {
    cb(null, [])
  }
}

Peer.prototype._maybeReady = function () {
  var self = this
  self._debug('maybeReady pc %s channel %s', self._pcReady, self._channelReady)
  if (self.connected || self._connecting || !self._pcReady || !self._channelReady) return

  self._connecting = true

  // HACK: We can't rely on order here, for details see https://github.com/js-platform/node-webrtc/issues/339
  function findCandidatePair () {
    if (self.destroyed) return

    self.getStats(function (err, items) {
      if (self.destroyed) return

      // Treat getStats error as non-fatal. It's not essential.
      if (err) items = []

      var remoteCandidates = {}
      var localCandidates = {}
      var candidatePairs = {}
      var foundSelectedCandidatePair = false

      items.forEach(function (item) {
        // TODO: Once all browsers support the hyphenated stats report types, remove
        // the non-hypenated ones
        if (item.type === 'remotecandidate' || item.type === 'remote-candidate') {
          remoteCandidates[item.id] = item
        }
        if (item.type === 'localcandidate' || item.type === 'local-candidate') {
          localCandidates[item.id] = item
        }
        if (item.type === 'candidatepair' || item.type === 'candidate-pair') {
          candidatePairs[item.id] = item
        }
      })

      items.forEach(function (item) {
        // Spec-compliant
        if (item.type === 'transport') {
          setSelectedCandidatePair(candidatePairs[item.selectedCandidatePairId])
        }

        // Old implementations
        if (
          (item.type === 'googCandidatePair' && item.googActiveConnection === 'true') ||
          ((item.type === 'candidatepair' || item.type === 'candidate-pair') && item.selected)
        ) {
          setSelectedCandidatePair(item)
        }
      })

      function setSelectedCandidatePair (selectedCandidatePair) {
        foundSelectedCandidatePair = true

        var local = localCandidates[selectedCandidatePair.localCandidateId]

        if (local && local.ip) {
          // Spec
          self.localAddress = local.ip
          self.localPort = Number(local.port)
        } else if (local && local.ipAddress) {
          // Firefox
          self.localAddress = local.ipAddress
          self.localPort = Number(local.portNumber)
        } else if (typeof selectedCandidatePair.googLocalAddress === 'string') {
          // TODO: remove this once Chrome 58 is released
          local = selectedCandidatePair.googLocalAddress.split(':')
          self.localAddress = local[0]
          self.localPort = Number(local[1])
        }

        var remote = remoteCandidates[selectedCandidatePair.remoteCandidateId]

        if (remote && remote.ip) {
          // Spec
          self.remoteAddress = remote.ip
          self.remotePort = Number(remote.port)
        } else if (remote && remote.ipAddress) {
          // Firefox
          self.remoteAddress = remote.ipAddress
          self.remotePort = Number(remote.portNumber)
        } else if (typeof selectedCandidatePair.googRemoteAddress === 'string') {
          // TODO: remove this once Chrome 58 is released
          remote = selectedCandidatePair.googRemoteAddress.split(':')
          self.remoteAddress = remote[0]
          self.remotePort = Number(remote[1])
        }
        self.remoteFamily = 'IPv4'

        self._debug(
          'connect local: %s:%s remote: %s:%s',
          self.localAddress, self.localPort, self.remoteAddress, self.remotePort
        )
      }

      if (!foundSelectedCandidatePair && items.length) {
        setTimeout(findCandidatePair, 100)
        return
      } else {
        self._connecting = false
        self.connected = true
      }

      if (self._chunk) {
        try {
          self.send(self._chunk)
        } catch (err) {
          return self._destroy(err)
        }
        self._chunk = null
        self._debug('sent chunk from "write before connect"')

        var cb = self._cb
        self._cb = null
        cb(null)
      }

      // If `bufferedAmountLowThreshold` and 'onbufferedamountlow' are unsupported,
      // fallback to using setInterval to implement backpressure.
      if (typeof self._channel.bufferedAmountLowThreshold !== 'number') {
        self._interval = setInterval(function () { self._onInterval() }, 150)
        if (self._interval.unref) self._interval.unref()
      }

      self._debug('connect')
      self.emit('connect')
      if (self._earlyMessage) { // HACK: Workaround for Chrome not firing "open" between tabs
        self._onChannelMessage(self._earlyMessage)
        self._earlyMessage = null
      }
    })
  }
  findCandidatePair()
}

Peer.prototype._onInterval = function () {
  if (!this._cb || !this._channel || this._channel.bufferedAmount > MAX_BUFFERED_AMOUNT) {
    return
  }
  this._onChannelBufferedAmountLow()
}

Peer.prototype._onSignalingStateChange = function () {
  var self = this
  if (self.destroyed) return
  self._debug('signalingStateChange %s', self._pc.signalingState)
  self.emit('signalingStateChange', self._pc.signalingState)
}

Peer.prototype._onIceCandidate = function (event) {
  var self = this
  if (self.destroyed) return
  if (event.candidate && self.trickle) {
    self.emit('signal', {
      candidate: {
        candidate: event.candidate.candidate,
        sdpMLineIndex: event.candidate.sdpMLineIndex,
        sdpMid: event.candidate.sdpMid
      }
    })
  } else if (!event.candidate) {
    self._iceComplete = true
    self.emit('_iceComplete')
  }
}

Peer.prototype._onChannelMessage = function (event) {
  var self = this
  if (self.destroyed) return
  var data = event.data
  if (data instanceof ArrayBuffer) data = Buffer.from(data)
  self.push(data)
}

Peer.prototype._onChannelBufferedAmountLow = function () {
  var self = this
  if (self.destroyed || !self._cb) return
  self._debug('ending backpressure: bufferedAmount %d', self._channel.bufferedAmount)
  var cb = self._cb
  self._cb = null
  cb(null)
}

Peer.prototype._onChannelOpen = function () {
  var self = this
  if (self.connected || self.destroyed) return
  self._debug('on channel open')
  self._channelReady = true
  self._maybeReady()
}

Peer.prototype._onChannelClose = function () {
  var self = this
  if (self.destroyed) return
  self._debug('on channel close')
  self._destroy()
}

Peer.prototype._onAddStream = function (event) {
  var self = this
  if (self.destroyed) return
  self._debug('on add stream')
  self.emit('stream', event.stream)
}

Peer.prototype._onTrack = function (event) {
  var self = this
  if (self.destroyed) return
  self._debug('on track')
  var id = event.streams[0].id
  if (self._previousStreams.indexOf(id) !== -1) return // Only fire one 'stream' event, even though there may be multiple tracks per stream
  self._previousStreams.push(id)
  self.emit('stream', event.streams[0])
}

Peer.prototype._debug = function () {
  var self = this
  var args = [].slice.call(arguments)
  args[0] = '[' + self._id + '] ' + args[0]
  debug.apply(null, args)
}

// Transform constraints objects into the new format (unless Chromium)
// TODO: This can be removed when Chromium supports the new format
Peer.prototype._transformConstraints = function (constraints) {
  var self = this

  if (Object.keys(constraints).length === 0) {
    return constraints
  }

  if ((constraints.mandatory || constraints.optional) && !self._isChromium) {
    // convert to new format

    // Merge mandatory and optional objects, prioritizing mandatory
    var newConstraints = Object.assign({}, constraints.optional, constraints.mandatory)

    // fix casing
    if (newConstraints.OfferToReceiveVideo !== undefined) {
      newConstraints.offerToReceiveVideo = newConstraints.OfferToReceiveVideo
      delete newConstraints['OfferToReceiveVideo']
    }

    if (newConstraints.OfferToReceiveAudio !== undefined) {
      newConstraints.offerToReceiveAudio = newConstraints.OfferToReceiveAudio
      delete newConstraints['OfferToReceiveAudio']
    }

    return newConstraints
  } else if (!constraints.mandatory && !constraints.optional && self._isChromium) {
    // convert to old format

    // fix casing
    if (constraints.offerToReceiveVideo !== undefined) {
      constraints.OfferToReceiveVideo = constraints.offerToReceiveVideo
      delete constraints['offerToReceiveVideo']
    }

    if (constraints.offerToReceiveAudio !== undefined) {
      constraints.OfferToReceiveAudio = constraints.offerToReceiveAudio
      delete constraints['offerToReceiveAudio']
    }

    return {
      mandatory: constraints // NOTE: All constraints are upgraded to mandatory
    }
  }

  return constraints
}

function noop () {}

}).call(this,require("buffer").Buffer)
},{"buffer":119,"debug":22,"get-browser-rtc":28,"inherits":30,"randombytes":54,"readable-stream":64}],74:[function(require,module,exports){
var Rusha = require('rusha')

var rusha = new Rusha
var scope = typeof window !== 'undefined' ? window : self
var crypto = scope.crypto || scope.msCrypto || {}
var subtle = crypto.subtle || crypto.webkitSubtle

function sha1sync (buf) {
  return rusha.digest(buf)
}

// Browsers throw if they lack support for an algorithm.
// Promise will be rejected on non-secure origins. (http://goo.gl/lq4gCo)
try {
  subtle.digest({ name: 'sha-1' }, new Uint8Array).catch(function () {
    subtle = false
  })
} catch (err) { subtle = false }

function sha1 (buf, cb) {
  if (!subtle) {
    // Use Rusha
    setTimeout(cb, 0, sha1sync(buf))
    return
  }

  if (typeof buf === 'string') {
    buf = uint8array(buf)
  }

  subtle.digest({ name: 'sha-1' }, buf)
    .then(function succeed (result) {
      cb(hex(new Uint8Array(result)))
    },
    function fail (error) {
      cb(sha1sync(buf))
    })
}

function uint8array (s) {
  var l = s.length
  var array = new Uint8Array(l)
  for (var i = 0; i < l; i++) {
    array[i] = s.charCodeAt(i)
  }
  return array
}

function hex (buf) {
  var l = buf.length
  var chars = []
  for (var i = 0; i < l; i++) {
    var bite = buf[i]
    chars.push((bite >>> 4).toString(16))
    chars.push((bite & 0x0f).toString(16))
  }
  return chars.join('')
}

module.exports = sha1
module.exports.sync = sha1sync

},{"rusha":69}],75:[function(require,module,exports){
(function (process){
/* global WebSocket */

module.exports = Socket

var Buffer = require('safe-buffer').Buffer
var debug = require('debug')('simple-websocket')
var inherits = require('inherits')
var randombytes = require('randombytes')
var stream = require('readable-stream')
var ws = require('ws') // websockets in node - will be empty object in browser

var _WebSocket = typeof ws !== 'function' ? WebSocket : ws

var MAX_BUFFERED_AMOUNT = 64 * 1024

inherits(Socket, stream.Duplex)

/**
 * WebSocket. Same API as node core `net.Socket`. Duplex stream.
 * @param {Object} opts
 * @param {string=} opts.url websocket server url
 * @param {string=} opts.socket raw websocket instance to wrap
 */
function Socket (opts) {
  var self = this
  if (!(self instanceof Socket)) return new Socket(opts)
  if (!opts) opts = {}

  // Support simple usage: `new Socket(url)`
  if (typeof opts === 'string') {
    opts = { url: opts }
  }

  if (opts.url == null && opts.socket == null) {
    throw new Error('Missing required `url` or `socket` option')
  }
  if (opts.url != null && opts.socket != null) {
    throw new Error('Must specify either `url` or `socket` option, not both')
  }

  self._id = randombytes(4).toString('hex').slice(0, 7)
  self._debug('new websocket: %o', opts)

  opts = Object.assign({
    allowHalfOpen: false
  }, opts)

  stream.Duplex.call(self, opts)

  self.connected = false
  self.destroyed = false

  self._chunk = null
  self._cb = null
  self._interval = null

  if (opts.socket) {
    self.url = opts.socket.url
    self._ws = opts.socket
  } else {
    self.url = opts.url
    try {
      if (typeof ws === 'function') {
        // `ws` package accepts options
        self._ws = new _WebSocket(opts.url, opts)
      } else {
        self._ws = new _WebSocket(opts.url)
      }
    } catch (err) {
      process.nextTick(function () {
        self._destroy(err)
      })
      return
    }
  }

  self._ws.binaryType = 'arraybuffer'
  self._ws.onopen = function () {
    self._onOpen()
  }
  self._ws.onmessage = function (event) {
    self._onMessage(event)
  }
  self._ws.onclose = function () {
    self._onClose()
  }
  self._ws.onerror = function () {
    self._destroy(new Error('connection error to ' + self.url))
  }

  self._onFinishBound = function () {
    self._onFinish()
  }
  self.once('finish', self._onFinishBound)
}

Socket.WEBSOCKET_SUPPORT = !!_WebSocket

/**
 * Send text/binary data to the WebSocket server.
 * @param {TypedArrayView|ArrayBuffer|Buffer|string|Blob|Object} chunk
 */
Socket.prototype.send = function (chunk) {
  this._ws.send(chunk)
}

Socket.prototype.destroy = function (onclose) {
  this._destroy(null, onclose)
}

Socket.prototype._destroy = function (err, onclose) {
  var self = this
  if (self.destroyed) return
  if (onclose) self.once('close', onclose)

  self._debug('destroy (error: %s)', err && (err.message || err))

  self.readable = self.writable = false
  if (!self._readableState.ended) self.push(null)
  if (!self._writableState.finished) self.end()

  self.connected = false
  self.destroyed = true

  clearInterval(self._interval)
  self._interval = null
  self._chunk = null
  self._cb = null

  if (self._onFinishBound) self.removeListener('finish', self._onFinishBound)
  self._onFinishBound = null

  if (self._ws) {
    var ws = self._ws
    var onClose = function () {
      ws.onclose = null
    }
    if (ws.readyState === _WebSocket.CLOSED) {
      onClose()
    } else {
      try {
        ws.onclose = onClose
        ws.close()
      } catch (err) {
        onClose()
      }
    }

    ws.onopen = null
    ws.onmessage = null
    ws.onerror = null
  }
  self._ws = null

  if (err) self.emit('error', err)
  self.emit('close')
}

Socket.prototype._read = function () {}

Socket.prototype._write = function (chunk, encoding, cb) {
  if (this.destroyed) return cb(new Error('cannot write after socket is destroyed'))

  if (this.connected) {
    try {
      this.send(chunk)
    } catch (err) {
      return this._destroy(err)
    }
    if (typeof ws !== 'function' && this._ws.bufferedAmount > MAX_BUFFERED_AMOUNT) {
      this._debug('start backpressure: bufferedAmount %d', this._ws.bufferedAmount)
      this._cb = cb
    } else {
      cb(null)
    }
  } else {
    this._debug('write before connect')
    this._chunk = chunk
    this._cb = cb
  }
}

// When stream finishes writing, close socket. Half open connections are not
// supported.
Socket.prototype._onFinish = function () {
  var self = this
  if (self.destroyed) return

  if (self.connected) {
    destroySoon()
  } else {
    self.once('connect', destroySoon)
  }

  // Wait a bit before destroying so the socket flushes.
  // TODO: is there a more reliable way to accomplish this?
  function destroySoon () {
    setTimeout(function () {
      self._destroy()
    }, 1000)
  }
}

Socket.prototype._onMessage = function (event) {
  if (this.destroyed) return
  var data = event.data
  if (data instanceof ArrayBuffer) data = Buffer.from(data)
  this.push(data)
}

Socket.prototype._onOpen = function () {
  var self = this
  if (self.connected || self.destroyed) return
  self.connected = true

  if (self._chunk) {
    try {
      self.send(self._chunk)
    } catch (err) {
      return self._destroy(err)
    }
    self._chunk = null
    self._debug('sent chunk from "write before connect"')

    var cb = self._cb
    self._cb = null
    cb(null)
  }

  // Backpressure is not implemented in Node.js. The `ws` module has a buggy
  // `bufferedAmount` property. See: https://github.com/websockets/ws/issues/492
  if (typeof ws !== 'function') {
    self._interval = setInterval(function () {
      self._onInterval()
    }, 150)
    if (self._interval.unref) self._interval.unref()
  }

  self._debug('connect')
  self.emit('connect')
}

Socket.prototype._onInterval = function () {
  if (!this._cb || !this._ws || this._ws.bufferedAmount > MAX_BUFFERED_AMOUNT) {
    return
  }
  this._debug('ending backpressure: bufferedAmount %d', this._ws.bufferedAmount)
  var cb = this._cb
  this._cb = null
  cb(null)
}

Socket.prototype._onClose = function () {
  if (this.destroyed) return
  this._debug('on close')
  this._destroy()
}

Socket.prototype._debug = function () {
  var args = [].slice.call(arguments)
  args[0] = '[' + this._id + '] ' + args[0]
  debug.apply(null, args)
}

}).call(this,require('_process'))
},{"_process":130,"debug":76,"inherits":30,"randombytes":54,"readable-stream":64,"safe-buffer":70,"ws":118}],76:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"./debug":77,"_process":130,"dup":13}],77:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"dup":14,"ms":45}],78:[function(require,module,exports){
var tick = 1
var maxTick = 65535
var resolution = 4
var inc = function () {
  tick = (tick + 1) & maxTick
}

var timer = setInterval(inc, (1000 / resolution) | 0)
if (timer.unref) timer.unref()

module.exports = function (seconds) {
  var size = resolution * (seconds || 5)
  var buffer = [0]
  var pointer = 1
  var last = (tick - 1) & maxTick

  return function (delta) {
    var dist = (tick - last) & maxTick
    if (dist > size) dist = size
    last = tick

    while (dist--) {
      if (pointer === size) pointer = 0
      buffer[pointer] = buffer[pointer === 0 ? size - 1 : pointer - 1]
      pointer++
    }

    if (delta) buffer[pointer - 1] += delta

    var top = buffer[pointer - 1]
    var btm = buffer.length < size ? 0 : buffer[pointer === size ? 0 : pointer]

    return buffer.length < resolution ? top : (top - btm) * resolution / buffer.length
  }
}

},{}],79:[function(require,module,exports){
(function (global){
var ClientRequest = require('./lib/request')
var IncomingMessage = require('./lib/response')
var extend = require('xtend')
var statusCodes = require('builtin-status-codes')
var url = require('url')

var http = exports

http.request = function (opts, cb) {
	if (typeof opts === 'string')
		opts = url.parse(opts)
	else
		opts = extend(opts)

	// Normally, the page is loaded from http or https, so not specifying a protocol
	// will result in a (valid) protocol-relative url. However, this won't work if
	// the protocol is something else, like 'file:'
	var defaultProtocol = global.location.protocol.search(/^https?:$/) === -1 ? 'http:' : ''

	var protocol = opts.protocol || defaultProtocol
	var host = opts.hostname || opts.host
	var port = opts.port
	var path = opts.path || '/'

	// Necessary for IPv6 addresses
	if (host && host.indexOf(':') !== -1)
		host = '[' + host + ']'

	// This may be a relative url. The browser should always be able to interpret it correctly.
	opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path
	opts.method = (opts.method || 'GET').toUpperCase()
	opts.headers = opts.headers || {}

	// Also valid opts.auth, opts.mode

	var req = new ClientRequest(opts)
	if (cb)
		req.on('response', cb)
	return req
}

http.get = function get (opts, cb) {
	var req = http.request(opts, cb)
	req.end()
	return req
}

http.ClientRequest = ClientRequest
http.IncomingMessage = IncomingMessage

http.Agent = function () {}
http.Agent.defaultMaxSockets = 4

http.STATUS_CODES = statusCodes

http.METHODS = [
	'CHECKOUT',
	'CONNECT',
	'COPY',
	'DELETE',
	'GET',
	'HEAD',
	'LOCK',
	'M-SEARCH',
	'MERGE',
	'MKACTIVITY',
	'MKCOL',
	'MOVE',
	'NOTIFY',
	'OPTIONS',
	'PATCH',
	'POST',
	'PROPFIND',
	'PROPPATCH',
	'PURGE',
	'PUT',
	'REPORT',
	'SEARCH',
	'SUBSCRIBE',
	'TRACE',
	'UNLOCK',
	'UNSUBSCRIBE'
]
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/request":81,"./lib/response":82,"builtin-status-codes":17,"url":151,"xtend":113}],80:[function(require,module,exports){
(function (global){
exports.fetch = isFunction(global.fetch) && isFunction(global.ReadableStream)

exports.writableStream = isFunction(global.WritableStream)

exports.abortController = isFunction(global.AbortController)

exports.blobConstructor = false
try {
	new Blob([new ArrayBuffer(1)])
	exports.blobConstructor = true
} catch (e) {}

// The xhr request to example.com may violate some restrictive CSP configurations,
// so if we're running in a browser that supports `fetch`, avoid calling getXHR()
// and assume support for certain features below.
var xhr
function getXHR () {
	// Cache the xhr value
	if (xhr !== undefined) return xhr

	if (global.XMLHttpRequest) {
		xhr = new global.XMLHttpRequest()
		// If XDomainRequest is available (ie only, where xhr might not work
		// cross domain), use the page location. Otherwise use example.com
		// Note: this doesn't actually make an http request.
		try {
			xhr.open('GET', global.XDomainRequest ? '/' : 'https://example.com')
		} catch(e) {
			xhr = null
		}
	} else {
		// Service workers don't have XHR
		xhr = null
	}
	return xhr
}

function checkTypeSupport (type) {
	var xhr = getXHR()
	if (!xhr) return false
	try {
		xhr.responseType = type
		return xhr.responseType === type
	} catch (e) {}
	return false
}

// For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
// Safari 7.1 appears to have fixed this bug.
var haveArrayBuffer = typeof global.ArrayBuffer !== 'undefined'
var haveSlice = haveArrayBuffer && isFunction(global.ArrayBuffer.prototype.slice)

// If fetch is supported, then arraybuffer will be supported too. Skip calling
// checkTypeSupport(), since that calls getXHR().
exports.arraybuffer = exports.fetch || (haveArrayBuffer && checkTypeSupport('arraybuffer'))

// These next two tests unavoidably show warnings in Chrome. Since fetch will always
// be used if it's available, just return false for these to avoid the warnings.
exports.msstream = !exports.fetch && haveSlice && checkTypeSupport('ms-stream')
exports.mozchunkedarraybuffer = !exports.fetch && haveArrayBuffer &&
	checkTypeSupport('moz-chunked-arraybuffer')

// If fetch is supported, then overrideMimeType will be supported too. Skip calling
// getXHR().
exports.overrideMimeType = exports.fetch || (getXHR() ? isFunction(getXHR().overrideMimeType) : false)

exports.vbArray = isFunction(global.VBArray)

function isFunction (value) {
	return typeof value === 'function'
}

xhr = null // Help gc

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],81:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var response = require('./response')
var stream = require('readable-stream')
var toArrayBuffer = require('to-arraybuffer')

var IncomingMessage = response.IncomingMessage
var rStates = response.readyStates

function decideMode (preferBinary, useFetch) {
	if (capability.fetch && useFetch) {
		return 'fetch'
	} else if (capability.mozchunkedarraybuffer) {
		return 'moz-chunked-arraybuffer'
	} else if (capability.msstream) {
		return 'ms-stream'
	} else if (capability.arraybuffer && preferBinary) {
		return 'arraybuffer'
	} else if (capability.vbArray && preferBinary) {
		return 'text:vbarray'
	} else {
		return 'text'
	}
}

var ClientRequest = module.exports = function (opts) {
	var self = this
	stream.Writable.call(self)

	self._opts = opts
	self._body = []
	self._headers = {}
	if (opts.auth)
		self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'))
	Object.keys(opts.headers).forEach(function (name) {
		self.setHeader(name, opts.headers[name])
	})

	var preferBinary
	var useFetch = true
	if (opts.mode === 'disable-fetch' || ('requestTimeout' in opts && !capability.abortController)) {
		// If the use of XHR should be preferred. Not typically needed.
		useFetch = false
		preferBinary = true
	} else if (opts.mode === 'prefer-streaming') {
		// If streaming is a high priority but binary compatibility and
		// the accuracy of the 'content-type' header aren't
		preferBinary = false
	} else if (opts.mode === 'allow-wrong-content-type') {
		// If streaming is more important than preserving the 'content-type' header
		preferBinary = !capability.overrideMimeType
	} else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
		// Use binary if text streaming may corrupt data or the content-type header, or for speed
		preferBinary = true
	} else {
		throw new Error('Invalid value for opts.mode')
	}
	self._mode = decideMode(preferBinary, useFetch)

	self.on('finish', function () {
		self._onFinish()
	})
}

inherits(ClientRequest, stream.Writable)

ClientRequest.prototype.setHeader = function (name, value) {
	var self = this
	var lowerName = name.toLowerCase()
	// This check is not necessary, but it prevents warnings from browsers about setting unsafe
	// headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	// http-browserify did it, so I will too.
	if (unsafeHeaders.indexOf(lowerName) !== -1)
		return

	self._headers[lowerName] = {
		name: name,
		value: value
	}
}

ClientRequest.prototype.getHeader = function (name) {
	var header = this._headers[name.toLowerCase()]
	if (header)
		return header.value
	return null
}

ClientRequest.prototype.removeHeader = function (name) {
	var self = this
	delete self._headers[name.toLowerCase()]
}

ClientRequest.prototype._onFinish = function () {
	var self = this

	if (self._destroyed)
		return
	var opts = self._opts

	var headersObj = self._headers
	var body = null
	if (opts.method !== 'GET' && opts.method !== 'HEAD') {
		if (capability.arraybuffer) {
			body = toArrayBuffer(Buffer.concat(self._body))
		} else if (capability.blobConstructor) {
			body = new global.Blob(self._body.map(function (buffer) {
				return toArrayBuffer(buffer)
			}), {
				type: (headersObj['content-type'] || {}).value || ''
			})
		} else {
			// get utf8 string
			body = Buffer.concat(self._body).toString()
		}
	}

	// create flattened list of headers
	var headersList = []
	Object.keys(headersObj).forEach(function (keyName) {
		var name = headersObj[keyName].name
		var value = headersObj[keyName].value
		if (Array.isArray(value)) {
			value.forEach(function (v) {
				headersList.push([name, v])
			})
		} else {
			headersList.push([name, value])
		}
	})

	if (self._mode === 'fetch') {
		var signal = null
		if (capability.abortController) {
			var controller = new AbortController()
			signal = controller.signal
			self._fetchAbortController = controller

			if ('requestTimeout' in opts && opts.requestTimeout !== 0) {
				global.setTimeout(function () {
					self.emit('requestTimeout')
					if (self._fetchAbortController)
						self._fetchAbortController.abort()
				}, opts.requestTimeout)
			}
		}

		global.fetch(self._opts.url, {
			method: self._opts.method,
			headers: headersList,
			body: body || undefined,
			mode: 'cors',
			credentials: opts.withCredentials ? 'include' : 'same-origin',
			signal: signal
		}).then(function (response) {
			self._fetchResponse = response
			self._connect()
		}, function (reason) {
			self.emit('error', reason)
		})
	} else {
		var xhr = self._xhr = new global.XMLHttpRequest()
		try {
			xhr.open(self._opts.method, self._opts.url, true)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}

		// Can't set responseType on really old browsers
		if ('responseType' in xhr)
			xhr.responseType = self._mode.split(':')[0]

		if ('withCredentials' in xhr)
			xhr.withCredentials = !!opts.withCredentials

		if (self._mode === 'text' && 'overrideMimeType' in xhr)
			xhr.overrideMimeType('text/plain; charset=x-user-defined')

		if ('requestTimeout' in opts) {
			xhr.timeout = opts.requestTimeout
			xhr.ontimeout = function () {
				self.emit('requestTimeout')
			}
		}

		headersList.forEach(function (header) {
			xhr.setRequestHeader(header[0], header[1])
		})

		self._response = null
		xhr.onreadystatechange = function () {
			switch (xhr.readyState) {
				case rStates.LOADING:
				case rStates.DONE:
					self._onXHRProgress()
					break
			}
		}
		// Necessary for streaming in Firefox, since xhr.response is ONLY defined
		// in onprogress, not in onreadystatechange with xhr.readyState = 3
		if (self._mode === 'moz-chunked-arraybuffer') {
			xhr.onprogress = function () {
				self._onXHRProgress()
			}
		}

		xhr.onerror = function () {
			if (self._destroyed)
				return
			self.emit('error', new Error('XHR error'))
		}

		try {
			xhr.send(body)
		} catch (err) {
			process.nextTick(function () {
				self.emit('error', err)
			})
			return
		}
	}
}

/**
 * Checks if xhr.status is readable and non-zero, indicating no error.
 * Even though the spec says it should be available in readyState 3,
 * accessing it throws an exception in IE8
 */
function statusValid (xhr) {
	try {
		var status = xhr.status
		return (status !== null && status !== 0)
	} catch (e) {
		return false
	}
}

ClientRequest.prototype._onXHRProgress = function () {
	var self = this

	if (!statusValid(self._xhr) || self._destroyed)
		return

	if (!self._response)
		self._connect()

	self._response._onXHRProgress()
}

ClientRequest.prototype._connect = function () {
	var self = this

	if (self._destroyed)
		return

	self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode)
	self._response.on('error', function(err) {
		self.emit('error', err)
	})

	self.emit('response', self._response)
}

ClientRequest.prototype._write = function (chunk, encoding, cb) {
	var self = this

	self._body.push(chunk)
	cb()
}

ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function () {
	var self = this
	self._destroyed = true
	if (self._response)
		self._response._destroyed = true
	if (self._xhr)
		self._xhr.abort()
	else if (self._fetchAbortController)
		self._fetchAbortController.abort()
}

ClientRequest.prototype.end = function (data, encoding, cb) {
	var self = this
	if (typeof data === 'function') {
		cb = data
		data = undefined
	}

	stream.Writable.prototype.end.call(self, data, encoding, cb)
}

ClientRequest.prototype.flushHeaders = function () {}
ClientRequest.prototype.setTimeout = function () {}
ClientRequest.prototype.setNoDelay = function () {}
ClientRequest.prototype.setSocketKeepAlive = function () {}

// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
var unsafeHeaders = [
	'accept-charset',
	'accept-encoding',
	'access-control-request-headers',
	'access-control-request-method',
	'connection',
	'content-length',
	'cookie',
	'cookie2',
	'date',
	'dnt',
	'expect',
	'host',
	'keep-alive',
	'origin',
	'referer',
	'te',
	'trailer',
	'transfer-encoding',
	'upgrade',
	'user-agent',
	'via'
]

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":80,"./response":82,"_process":130,"buffer":119,"inherits":30,"readable-stream":64,"to-arraybuffer":89}],82:[function(require,module,exports){
(function (process,global,Buffer){
var capability = require('./capability')
var inherits = require('inherits')
var stream = require('readable-stream')

var rStates = exports.readyStates = {
	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4
}

var IncomingMessage = exports.IncomingMessage = function (xhr, response, mode) {
	var self = this
	stream.Readable.call(self)

	self._mode = mode
	self.headers = {}
	self.rawHeaders = []
	self.trailers = {}
	self.rawTrailers = []

	// Fake the 'close' event, but only once 'end' fires
	self.on('end', function () {
		// The nextTick is necessary to prevent the 'request' module from causing an infinite loop
		process.nextTick(function () {
			self.emit('close')
		})
	})

	if (mode === 'fetch') {
		self._fetchResponse = response

		self.url = response.url
		self.statusCode = response.status
		self.statusMessage = response.statusText
		
		response.headers.forEach(function (header, key){
			self.headers[key.toLowerCase()] = header
			self.rawHeaders.push(key, header)
		})

		if (capability.writableStream) {
			var writable = new WritableStream({
				write: function (chunk) {
					return new Promise(function (resolve, reject) {
						if (self._destroyed) {
							return
						} else if(self.push(new Buffer(chunk))) {
							resolve()
						} else {
							self._resumeFetch = resolve
						}
					})
				},
				close: function () {
					if (!self._destroyed)
						self.push(null)
				},
				abort: function (err) {
					if (!self._destroyed)
						self.emit('error', err)
				}
			})

			try {
				response.body.pipeTo(writable)
				return
			} catch (e) {} // pipeTo method isn't defined. Can't find a better way to feature test this
		}
		// fallback for when writableStream or pipeTo aren't available
		var reader = response.body.getReader()
		function read () {
			reader.read().then(function (result) {
				if (self._destroyed)
					return
				if (result.done) {
					self.push(null)
					return
				}
				self.push(new Buffer(result.value))
				read()
			}).catch(function(err) {
				if (!self._destroyed)
					self.emit('error', err)
			})
		}
		read()
	} else {
		self._xhr = xhr
		self._pos = 0

		self.url = xhr.responseURL
		self.statusCode = xhr.status
		self.statusMessage = xhr.statusText
		var headers = xhr.getAllResponseHeaders().split(/\r?\n/)
		headers.forEach(function (header) {
			var matches = header.match(/^([^:]+):\s*(.*)/)
			if (matches) {
				var key = matches[1].toLowerCase()
				if (key === 'set-cookie') {
					if (self.headers[key] === undefined) {
						self.headers[key] = []
					}
					self.headers[key].push(matches[2])
				} else if (self.headers[key] !== undefined) {
					self.headers[key] += ', ' + matches[2]
				} else {
					self.headers[key] = matches[2]
				}
				self.rawHeaders.push(matches[1], matches[2])
			}
		})

		self._charset = 'x-user-defined'
		if (!capability.overrideMimeType) {
			var mimeType = self.rawHeaders['mime-type']
			if (mimeType) {
				var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/)
				if (charsetMatch) {
					self._charset = charsetMatch[1].toLowerCase()
				}
			}
			if (!self._charset)
				self._charset = 'utf-8' // best guess
		}
	}
}

inherits(IncomingMessage, stream.Readable)

IncomingMessage.prototype._read = function () {
	var self = this

	var resolve = self._resumeFetch
	if (resolve) {
		self._resumeFetch = null
		resolve()
	}
}

IncomingMessage.prototype._onXHRProgress = function () {
	var self = this

	var xhr = self._xhr

	var response = null
	switch (self._mode) {
		case 'text:vbarray': // For IE9
			if (xhr.readyState !== rStates.DONE)
				break
			try {
				// This fails in IE8
				response = new global.VBArray(xhr.responseBody).toArray()
			} catch (e) {}
			if (response !== null) {
				self.push(new Buffer(response))
				break
			}
			// Falls through in IE8	
		case 'text':
			try { // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
				response = xhr.responseText
			} catch (e) {
				self._mode = 'text:vbarray'
				break
			}
			if (response.length > self._pos) {
				var newData = response.substr(self._pos)
				if (self._charset === 'x-user-defined') {
					var buffer = new Buffer(newData.length)
					for (var i = 0; i < newData.length; i++)
						buffer[i] = newData.charCodeAt(i) & 0xff

					self.push(buffer)
				} else {
					self.push(newData, self._charset)
				}
				self._pos = response.length
			}
			break
		case 'arraybuffer':
			if (xhr.readyState !== rStates.DONE || !xhr.response)
				break
			response = xhr.response
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'moz-chunked-arraybuffer': // take whole
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING || !response)
				break
			self.push(new Buffer(new Uint8Array(response)))
			break
		case 'ms-stream':
			response = xhr.response
			if (xhr.readyState !== rStates.LOADING)
				break
			var reader = new global.MSStreamReader()
			reader.onprogress = function () {
				if (reader.result.byteLength > self._pos) {
					self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))))
					self._pos = reader.result.byteLength
				}
			}
			reader.onload = function () {
				self.push(null)
			}
			// reader.onerror = ??? // TODO: this
			reader.readAsArrayBuffer(response)
			break
	}

	// The ms-stream case handles end separately in reader.onload()
	if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
		self.push(null)
	}
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer)
},{"./capability":80,"_process":130,"buffer":119,"inherits":30,"readable-stream":64}],83:[function(require,module,exports){
/* global URL */

var getBlob = require('stream-to-blob')

module.exports = function getBlobURL (stream, mimeType, cb) {
  if (typeof mimeType === 'function') return getBlobURL(stream, null, mimeType)
  getBlob(stream, mimeType, function (err, blob) {
    if (err) return cb(err)
    var url = URL.createObjectURL(blob)
    cb(null, url)
  })
}

},{"stream-to-blob":84}],84:[function(require,module,exports){
/* global Blob */

var once = require('once')

module.exports = function getBlob (stream, mimeType, cb) {
  if (typeof mimeType === 'function') return getBlob(stream, null, mimeType)
  cb = once(cb)
  var chunks = []
  stream
    .on('data', function (chunk) {
      chunks.push(chunk)
    })
    .on('end', function () {
      var blob = mimeType
        ? new Blob(chunks, { type: mimeType })
        : new Blob(chunks)
      cb(null, blob)
    })
    .on('error', cb)
}

},{"once":48}],85:[function(require,module,exports){
(function (Buffer){
var once = require('once')

module.exports = function getBuffer (stream, length, cb) {
  cb = once(cb)
  var buf = new Buffer(length)
  var offset = 0
  stream
    .on('data', function (chunk) {
      chunk.copy(buf, offset)
      offset += chunk.length
    })
    .on('end', function () { cb(null, buf) })
    .on('error', cb)
}

}).call(this,require("buffer").Buffer)
},{"buffer":119,"once":48}],86:[function(require,module,exports){
'use strict';

var Buffer = require('safe-buffer').Buffer;

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return -1;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// UTF-8 replacement characters ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd'.repeat(p);
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd'.repeat(p + 1);
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd'.repeat(p + 2);
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character for each buffered byte of a (partial)
// character needs to be added to the output.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd'.repeat(this.lastTotal - this.lastNeed);
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":70}],87:[function(require,module,exports){
/*                                                                              
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in      
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
*/

var base32 = require('./thirty-two');

exports.encode = base32.encode;
exports.decode = base32.decode;

},{"./thirty-two":88}],88:[function(require,module,exports){
(function (Buffer){
/*
Copyright (c) 2011, Chris Umbel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
'use strict';

var charTable = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
var byteTable = [
    0xff, 0xff, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f,
    0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
    0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
    0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
    0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff,
    0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06,
    0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
    0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16,
    0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff
];

function quintetCount(buff) {
    var quintets = Math.floor(buff.length / 5);
    return buff.length % 5 === 0 ? quintets: quintets + 1;
}

exports.encode = function(plain) {
    if(!Buffer.isBuffer(plain)){
    	plain = new Buffer(plain);
    }
    var i = 0;
    var j = 0;
    var shiftIndex = 0;
    var digit = 0;
    var encoded = new Buffer(quintetCount(plain) * 8);

    /* byte by byte isn't as pretty as quintet by quintet but tests a bit
        faster. will have to revisit. */
    while(i < plain.length) {
        var current = plain[i];

        if(shiftIndex > 3) {
            digit = current & (0xff >> shiftIndex);
            shiftIndex = (shiftIndex + 5) % 8;
            digit = (digit << shiftIndex) | ((i + 1 < plain.length) ?
                plain[i + 1] : 0) >> (8 - shiftIndex);
            i++;
        } else {
            digit = (current >> (8 - (shiftIndex + 5))) & 0x1f;
            shiftIndex = (shiftIndex + 5) % 8;
            if(shiftIndex === 0) i++;
        }

        encoded[j] = charTable.charCodeAt(digit);
        j++;
    }

    for(i = j; i < encoded.length; i++) {
        encoded[i] = 0x3d; //'='.charCodeAt(0)
    }

    return encoded;
};

exports.decode = function(encoded) {
    var shiftIndex = 0;
    var plainDigit = 0;
    var plainChar;
    var plainPos = 0;
    if(!Buffer.isBuffer(encoded)){
    	encoded = new Buffer(encoded);
    }
    var decoded = new Buffer(Math.ceil(encoded.length * 5 / 8));

    /* byte by byte isn't as pretty as octet by octet but tests a bit
        faster. will have to revisit. */
    for(var i = 0; i < encoded.length; i++) {
    	if(encoded[i] === 0x3d){ //'='
    		break;
    	}

        var encodedByte = encoded[i] - 0x30;

        if(encodedByte < byteTable.length) {
            plainDigit = byteTable[encodedByte];

            if(shiftIndex <= 3) {
                shiftIndex = (shiftIndex + 5) % 8;

                if(shiftIndex === 0) {
                    plainChar |= plainDigit;
                    decoded[plainPos] = plainChar;
                    plainPos++;
                    plainChar = 0;
                } else {
                    plainChar |= 0xff & (plainDigit << (8 - shiftIndex));
                }
            } else {
                shiftIndex = (shiftIndex + 5) % 8;
                plainChar |= 0xff & (plainDigit >>> shiftIndex);
                decoded[plainPos] = plainChar;
                plainPos++;

                plainChar = 0xff & (plainDigit << (8 - shiftIndex));
            }
        } else {
        	throw new Error('Invalid input - it is not base32 encoded string');
        }
    }

    return decoded.slice(0, plainPos);
};

}).call(this,require("buffer").Buffer)
},{"buffer":119}],89:[function(require,module,exports){
var Buffer = require('buffer').Buffer

module.exports = function (buf) {
	// If the buffer is backed by a Uint8Array, a faster version will work
	if (buf instanceof Uint8Array) {
		// If the buffer isn't a subarray, return the underlying ArrayBuffer
		if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
			return buf.buffer
		} else if (typeof buf.buffer.slice === 'function') {
			// Otherwise we need to get a proper copy
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
		}
	}

	if (Buffer.isBuffer(buf)) {
		// This is the slow version that will work with any Buffer
		// implementation (even in old browsers)
		var arrayCopy = new Uint8Array(buf.length)
		var len = buf.length
		for (var i = 0; i < len; i++) {
			arrayCopy[i] = buf[i]
		}
		return arrayCopy.buffer
	} else {
		throw new Error('Argument must be a Buffer')
	}
}

},{"buffer":119}],90:[function(require,module,exports){
(function (process){
module.exports = Discovery

var debug = require('debug')('torrent-discovery')
var DHT = require('bittorrent-dht/client') // empty object in browser
var EventEmitter = require('events').EventEmitter
var extend = require('xtend')
var inherits = require('inherits')
var parallel = require('run-parallel')
var Tracker = require('bittorrent-tracker/client')

inherits(Discovery, EventEmitter)

function Discovery (opts) {
  var self = this
  if (!(self instanceof Discovery)) return new Discovery(opts)
  EventEmitter.call(self)

  if (!opts.peerId) throw new Error('Option `peerId` is required')
  if (!opts.infoHash) throw new Error('Option `infoHash` is required')
  if (!process.browser && !opts.port) throw new Error('Option `port` is required')

  self.peerId = typeof opts.peerId === 'string'
    ? opts.peerId
    : opts.peerId.toString('hex')
  self.infoHash = typeof opts.infoHash === 'string'
    ? opts.infoHash
    : opts.infoHash.toString('hex')
  self._port = opts.port // torrent port
  self._userAgent = opts.userAgent // User-Agent header for http requests

  self.destroyed = false

  self._announce = opts.announce || []
  self._intervalMs = opts.intervalMs || (15 * 60 * 1000)
  self._trackerOpts = null
  self._dhtAnnouncing = false
  self._dhtTimeout = false
  self._internalDHT = false // is the DHT created internally?

  self._onWarning = function (err) {
    self.emit('warning', err)
  }
  self._onError = function (err) {
    self.emit('error', err)
  }
  self._onDHTPeer = function (peer, infoHash) {
    if (infoHash.toString('hex') !== self.infoHash) return
    self.emit('peer', peer.host + ':' + peer.port, 'dht')
  }
  self._onTrackerPeer = function (peer) {
    self.emit('peer', peer, 'tracker')
  }
  self._onTrackerAnnounce = function () {
    self.emit('trackerAnnounce')
  }

  if (opts.tracker === false) {
    self.tracker = null
  } else if (opts.tracker && typeof opts.tracker === 'object') {
    self._trackerOpts = extend(opts.tracker)
    self.tracker = self._createTracker()
  } else {
    self.tracker = self._createTracker()
  }

  if (opts.dht === false || typeof DHT !== 'function') {
    self.dht = null
  } else if (opts.dht && typeof opts.dht.addNode === 'function') {
    self.dht = opts.dht
  } else if (opts.dht && typeof opts.dht === 'object') {
    self.dht = createDHT(opts.dhtPort, opts.dht)
  } else {
    self.dht = createDHT(opts.dhtPort)
  }

  if (self.dht) {
    self.dht.on('peer', self._onDHTPeer)
    self._dhtAnnounce()
  }

  function createDHT (port, opts) {
    var dht = new DHT(opts)
    dht.on('warning', self._onWarning)
    dht.on('error', self._onError)
    dht.listen(port)
    self._internalDHT = true
    return dht
  }
}

Discovery.prototype.updatePort = function (port) {
  var self = this
  if (port === self._port) return
  self._port = port

  if (self.dht) self._dhtAnnounce()

  if (self.tracker) {
    self.tracker.stop()
    self.tracker.destroy(function () {
      self.tracker = self._createTracker()
    })
  }
}

Discovery.prototype.complete = function (opts) {
  if (this.tracker) {
    this.tracker.complete(opts)
  }
}

Discovery.prototype.destroy = function (cb) {
  var self = this
  if (self.destroyed) return
  self.destroyed = true

  clearTimeout(self._dhtTimeout)

  var tasks = []

  if (self.tracker) {
    self.tracker.stop()
    self.tracker.removeListener('warning', self._onWarning)
    self.tracker.removeListener('error', self._onError)
    self.tracker.removeListener('peer', self._onTrackerPeer)
    self.tracker.removeListener('update', self._onTrackerAnnounce)
    tasks.push(function (cb) {
      self.tracker.destroy(cb)
    })
  }

  if (self.dht) {
    self.dht.removeListener('peer', self._onDHTPeer)
  }

  if (self._internalDHT) {
    self.dht.removeListener('warning', self._onWarning)
    self.dht.removeListener('error', self._onError)
    tasks.push(function (cb) {
      self.dht.destroy(cb)
    })
  }

  parallel(tasks, cb)

  // cleanup
  self.dht = null
  self.tracker = null
  self._announce = null
}

Discovery.prototype._createTracker = function () {
  var opts = extend(this._trackerOpts, {
    infoHash: this.infoHash,
    announce: this._announce,
    peerId: this.peerId,
    port: this._port,
    userAgent: this._userAgent
  })

  var tracker = new Tracker(opts)
  tracker.on('warning', this._onWarning)
  tracker.on('error', this._onError)
  tracker.on('peer', this._onTrackerPeer)
  tracker.on('update', this._onTrackerAnnounce)
  tracker.setInterval(this._intervalMs)
  tracker.start()
  return tracker
}

Discovery.prototype._dhtAnnounce = function () {
  var self = this
  if (self._dhtAnnouncing) return
  debug('dht announce')

  self._dhtAnnouncing = true
  clearTimeout(self._dhtTimeout)

  self.dht.announce(self.infoHash, self._port, function (err) {
    self._dhtAnnouncing = false
    debug('dht announce complete')

    if (err) self.emit('warning', err)
    self.emit('dhtAnnounce')

    if (!self.destroyed) {
      self._dhtTimeout = setTimeout(function () {
        self._dhtAnnounce()
      }, getRandomTimeout())
      if (self._dhtTimeout.unref) self._dhtTimeout.unref()
    }
  })

  // Returns timeout interval, with some random jitter
  function getRandomTimeout () {
    return self._intervalMs + Math.floor(Math.random() * self._intervalMs / 5)
  }
}

}).call(this,require('_process'))
},{"_process":130,"bittorrent-dht/client":118,"bittorrent-tracker/client":9,"debug":22,"events":122,"inherits":30,"run-parallel":68,"xtend":113}],91:[function(require,module,exports){
(function (Buffer){
module.exports = Piece

var BLOCK_LENGTH = 1 << 14

function Piece (length) {
  if (!(this instanceof Piece)) return new Piece(length)

  this.length = length
  this.missing = length
  this.sources = null

  this._chunks = Math.ceil(length / BLOCK_LENGTH)
  this._remainder = (length % BLOCK_LENGTH) || BLOCK_LENGTH
  this._buffered = 0
  this._buffer = null
  this._cancellations = null
  this._reservations = 0
  this._flushed = false
}

Piece.BLOCK_LENGTH = BLOCK_LENGTH

Piece.prototype.chunkLength = function (i) {
  return i === this._chunks - 1 ? this._remainder : BLOCK_LENGTH
}

Piece.prototype.chunkLengthRemaining = function (i) {
  return this.length - (i * BLOCK_LENGTH)
}

Piece.prototype.chunkOffset = function (i) {
  return i * BLOCK_LENGTH
}

Piece.prototype.reserve = function () {
  if (!this.init()) return -1
  if (this._cancellations.length) return this._cancellations.pop()
  if (this._reservations < this._chunks) return this._reservations++
  return -1
}

Piece.prototype.reserveRemaining = function () {
  if (!this.init()) return -1
  if (this._reservations < this._chunks) {
    var min = this._reservations
    this._reservations = this._chunks
    return min
  }
  return -1
}

Piece.prototype.cancel = function (i) {
  if (!this.init()) return
  this._cancellations.push(i)
}

Piece.prototype.cancelRemaining = function (i) {
  if (!this.init()) return
  this._reservations = i
}

Piece.prototype.get = function (i) {
  if (!this.init()) return null
  return this._buffer[i]
}

Piece.prototype.set = function (i, data, source) {
  if (!this.init()) return false
  var len = data.length
  var blocks = Math.ceil(len / BLOCK_LENGTH)
  for (var j = 0; j < blocks; j++) {
    if (!this._buffer[i + j]) {
      var offset = j * BLOCK_LENGTH
      var splitData = data.slice(offset, offset + BLOCK_LENGTH)
      this._buffered++
      this._buffer[i + j] = splitData
      this.missing -= splitData.length
      if (this.sources.indexOf(source) === -1) {
        this.sources.push(source)
      }
    }
  }
  return this._buffered === this._chunks
}

Piece.prototype.flush = function () {
  if (!this._buffer || this._chunks !== this._buffered) return null
  var buffer = Buffer.concat(this._buffer, this.length)
  this._buffer = null
  this._cancellations = null
  this.sources = null
  this._flushed = true
  return buffer
}

Piece.prototype.init = function () {
  if (this._flushed) return false
  if (this._buffer) return true
  this._buffer = new Array(this._chunks)
  this._cancellations = []
  this.sources = []
  return true
}

}).call(this,require("buffer").Buffer)
},{"buffer":119}],92:[function(require,module,exports){
(function (Buffer){
/**
 * Convert a typed array to a Buffer without a copy
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install typedarray-to-buffer`
 */

var isTypedArray = require('is-typedarray').strict

module.exports = function typedarrayToBuffer (arr) {
  if (isTypedArray(arr)) {
    // To avoid a copy, use the typed array's underlying ArrayBuffer to back new Buffer
    var buf = new Buffer(arr.buffer)
    if (arr.byteLength !== arr.buffer.byteLength) {
      // Respect the "view", i.e. byteOffset and byteLength, without doing a copy
      buf = buf.slice(arr.byteOffset, arr.byteOffset + arr.byteLength)
    }
    return buf
  } else {
    // Pass through all other types to the `Buffer` constructor
    return new Buffer(arr)
  }
}

}).call(this,require("buffer").Buffer)
},{"buffer":119,"is-typedarray":33}],93:[function(require,module,exports){
(function (Buffer){
var UINT_32_MAX = 0xffffffff

exports.encodingLength = function () {
  return 8
}

exports.encode = function (num, buf, offset) {
  if (!buf) buf = new Buffer(8)
  if (!offset) offset = 0

  var top = Math.floor(num / UINT_32_MAX)
  var rem = num - top * UINT_32_MAX

  buf.writeUInt32BE(top, offset)
  buf.writeUInt32BE(rem, offset + 4)
  return buf
}

exports.decode = function (buf, offset) {
  if (!offset) offset = 0

  if (!buf) buf = new Buffer(4)
  if (!offset) offset = 0

  var top = buf.readUInt32BE(offset)
  var rem = buf.readUInt32BE(offset + 4)

  return top * UINT_32_MAX + rem
}

exports.encode.bytes = 8
exports.decode.bytes = 8

}).call(this,require("buffer").Buffer)
},{"buffer":119}],94:[function(require,module,exports){
"use strict"

function unique_pred(list, compare) {
  var ptr = 1
    , len = list.length
    , a=list[0], b=list[0]
  for(var i=1; i<len; ++i) {
    b = a
    a = list[i]
    if(compare(a, b)) {
      if(i === ptr) {
        ptr++
        continue
      }
      list[ptr++] = a
    }
  }
  list.length = ptr
  return list
}

function unique_eq(list) {
  var ptr = 1
    , len = list.length
    , a=list[0], b = list[0]
  for(var i=1; i<len; ++i, b=a) {
    b = a
    a = list[i]
    if(a !== b) {
      if(i === ptr) {
        ptr++
        continue
      }
      list[ptr++] = a
    }
  }
  list.length = ptr
  return list
}

function unique(list, compare, sorted) {
  if(list.length === 0) {
    return list
  }
  if(compare) {
    if(!sorted) {
      list.sort(compare)
    }
    return unique_pred(list, compare)
  }
  if(!sorted) {
    list.sort()
  }
  return unique_eq(list)
}

module.exports = unique

},{}],95:[function(require,module,exports){
module.exports = remove

function remove (arr, i) {
  if (i >= arr.length || i < 0) return
  var last = arr.pop()
  if (i < arr.length) {
    var tmp = arr[i]
    arr[i] = last
    return tmp
  }
  return last
}

},{}],96:[function(require,module,exports){
var bencode = require('bencode')
var BitField = require('bitfield')
var Buffer = require('safe-buffer').Buffer
var debug = require('debug')('ut_metadata')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var sha1 = require('simple-sha1')

var MAX_METADATA_SIZE = 10000000 // 10MB
var BITFIELD_GROW = 1000
var PIECE_LENGTH = 16 * 1024

module.exports = function (metadata) {
  inherits(utMetadata, EventEmitter)

  function utMetadata (wire) {
    EventEmitter.call(this)

    this._wire = wire

    this._metadataComplete = false
    this._metadataSize = null
    this._remainingRejects = null // how many reject messages to tolerate before quitting
    this._fetching = false

    // The largest .torrent file that I know of is ~1-2MB, which is ~100 pieces.
    // Therefore, cap the bitfield to 10x that (1000 pieces) so a malicious peer can't
    // make it grow to fill all memory.
    this._bitfield = new BitField(0, { grow: BITFIELD_GROW })

    if (Buffer.isBuffer(metadata)) {
      this.setMetadata(metadata)
    }
  }

  // Name of the bittorrent-protocol extension
  utMetadata.prototype.name = 'ut_metadata'

  utMetadata.prototype.onHandshake = function (infoHash, peerId, extensions) {
    this._infoHash = infoHash
  }

  utMetadata.prototype.onExtendedHandshake = function (handshake) {
    if (!handshake.m || !handshake.m.ut_metadata) {
      return this.emit('warning', new Error('Peer does not support ut_metadata'))
    }
    if (!handshake.metadata_size) {
      return this.emit('warning', new Error('Peer does not have metadata'))
    }
    if (typeof handshake.metadata_size !== 'number' ||
        MAX_METADATA_SIZE < handshake.metadata_size ||
        handshake.metadata_size <= 0) {
      return this.emit('warning', new Error('Peer gave invalid metadata size'))
    }

    this._metadataSize = handshake.metadata_size
    this._numPieces = Math.ceil(this._metadataSize / PIECE_LENGTH)
    this._remainingRejects = this._numPieces * 2

    if (this._fetching) {
      this._requestPieces()
    }
  }

  utMetadata.prototype.onMessage = function (buf) {
    var dict, trailer
    try {
      var str = buf.toString()
      var trailerIndex = str.indexOf('ee') + 2
      dict = bencode.decode(str.substring(0, trailerIndex))
      trailer = buf.slice(trailerIndex)
    } catch (err) {
      // drop invalid messages
      return
    }

    switch (dict.msg_type) {
      case 0:
        // ut_metadata request (from peer)
        // example: { 'msg_type': 0, 'piece': 0 }
        this._onRequest(dict.piece)
        break
      case 1:
        // ut_metadata data (in response to our request)
        // example: { 'msg_type': 1, 'piece': 0, 'total_size': 3425 }
        this._onData(dict.piece, trailer, dict.total_size)
        break
      case 2:
        // ut_metadata reject (peer doesn't have piece we requested)
        // { 'msg_type': 2, 'piece': 0 }
        this._onReject(dict.piece)
        break
    }
  }

  /**
   * Ask the peer to send metadata.
   * @public
   */
  utMetadata.prototype.fetch = function () {
    if (this._metadataComplete) {
      return
    }
    this._fetching = true
    if (this._metadataSize) {
      this._requestPieces()
    }
  }

  /**
   * Stop asking the peer to send metadata.
   * @public
   */
  utMetadata.prototype.cancel = function () {
    this._fetching = false
  }

  utMetadata.prototype.setMetadata = function (metadata) {
    if (this._metadataComplete) return true
    debug('set metadata')

    // if full torrent dictionary was passed in, pull out just `info` key
    try {
      var info = bencode.decode(metadata).info
      if (info) {
        metadata = bencode.encode(info)
      }
    } catch (err) {}

    // check hash
    if (this._infoHash && this._infoHash !== sha1.sync(metadata)) {
      return false
    }

    this.cancel()

    this.metadata = metadata
    this._metadataComplete = true
    this._metadataSize = this.metadata.length
    this._wire.extendedHandshake.metadata_size = this._metadataSize

    this.emit('metadata', bencode.encode({ info: bencode.decode(this.metadata) }))

    return true
  }

  utMetadata.prototype._send = function (dict, trailer) {
    var buf = bencode.encode(dict)
    if (Buffer.isBuffer(trailer)) {
      buf = Buffer.concat([buf, trailer])
    }
    this._wire.extended('ut_metadata', buf)
  }

  utMetadata.prototype._request = function (piece) {
    this._send({ msg_type: 0, piece: piece })
  }

  utMetadata.prototype._data = function (piece, buf, totalSize) {
    var msg = { msg_type: 1, piece: piece }
    if (typeof totalSize === 'number') {
      msg.total_size = totalSize
    }
    this._send(msg, buf)
  }

  utMetadata.prototype._reject = function (piece) {
    this._send({ msg_type: 2, piece: piece })
  }

  utMetadata.prototype._onRequest = function (piece) {
    if (!this._metadataComplete) {
      this._reject(piece)
      return
    }
    var start = piece * PIECE_LENGTH
    var end = start + PIECE_LENGTH
    if (end > this._metadataSize) {
      end = this._metadataSize
    }
    var buf = this.metadata.slice(start, end)
    this._data(piece, buf, this._metadataSize)
  }

  utMetadata.prototype._onData = function (piece, buf, totalSize) {
    if (buf.length > PIECE_LENGTH) {
      return
    }
    buf.copy(this.metadata, piece * PIECE_LENGTH)
    this._bitfield.set(piece)
    this._checkDone()
  }

  utMetadata.prototype._onReject = function (piece) {
    if (this._remainingRejects > 0 && this._fetching) {
      // If we haven't been rejected too much, then try to request the piece again
      this._request(piece)
      this._remainingRejects -= 1
    } else {
      this.emit('warning', new Error('Peer sent "reject" too much'))
    }
  }

  utMetadata.prototype._requestPieces = function () {
    this.metadata = Buffer.alloc(this._metadataSize)
    for (var piece = 0; piece < this._numPieces; piece++) {
      this._request(piece)
    }
  }

  utMetadata.prototype._checkDone = function () {
    var done = true
    for (var piece = 0; piece < this._numPieces; piece++) {
      if (!this._bitfield.get(piece)) {
        done = false
        break
      }
    }
    if (!done) return

    // attempt to set metadata -- may fail sha1 check
    var success = this.setMetadata(this.metadata)

    if (!success) {
      this._failedMetadata()
    }
  }

  utMetadata.prototype._failedMetadata = function () {
    // reset bitfield & try again
    this._bitfield = new BitField(0, { grow: BITFIELD_GROW })
    this._remainingRejects -= this._numPieces
    if (this._remainingRejects > 0) {
      this._requestPieces()
    } else {
      this.emit('warning', new Error('Peer sent invalid metadata'))
    }
  }

  return utMetadata
}

},{"bencode":5,"bitfield":7,"debug":22,"events":122,"inherits":30,"safe-buffer":70,"simple-sha1":74}],97:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],98:[function(require,module,exports){
(function (Buffer){
var bs = require('binary-search')
var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')
var mp4 = require('mp4-stream')
var Box = require('mp4-box-encoding')
var RangeSliceStream = require('range-slice-stream')

module.exports = MP4Remuxer

function MP4Remuxer (file) {
	var self = this
	EventEmitter.call(self)
	self._tracks = []
	self._fragmentSequence = 1
	self._file = file
	self._decoder = null
	self._findMoov(0)
}

inherits(MP4Remuxer, EventEmitter)

MP4Remuxer.prototype._findMoov = function (offset) {
	var self = this

	if (self._decoder) {
		self._decoder.destroy()
	}

	self._decoder = mp4.decode()
	var fileStream = self._file.createReadStream({
		start: offset
	})
	fileStream.pipe(self._decoder)

	self._decoder.once('box', function (headers) {
		if (headers.type === 'moov') {
			self._decoder.decode(function (moov) {
				fileStream.destroy()
				try {
					self._processMoov(moov)
				} catch (err) {
					err.message = 'Cannot parse mp4 file: ' + err.message
					self.emit('error', err)
				}
			})
		} else {
			fileStream.destroy()
			self._findMoov(offset + headers.length)
		}
	})
}

function RunLengthIndex (entries, countName) {
	var self = this
	self._entries = entries
	self._countName = countName || 'count'
	self._index = 0
	self._offset = 0

	self.value = self._entries[0]
}

RunLengthIndex.prototype.inc = function () {
	var self = this
	self._offset++
	if (self._offset >= self._entries[self._index][self._countName]) {
		self._index++
		self._offset = 0
	}

	self.value = self._entries[self._index]
}

MP4Remuxer.prototype._processMoov = function (moov) {
	var self = this

	var traks = moov.traks
	self._tracks = []
	self._hasVideo = false
	self._hasAudio = false
	for (var i = 0; i < traks.length; i++) {
		var trak = traks[i]
		var stbl = trak.mdia.minf.stbl
		var stsdEntry = stbl.stsd.entries[0]
		var handlerType = trak.mdia.hdlr.handlerType
		var codec
		var mime
		if (handlerType === 'vide' && stsdEntry.type === 'avc1') {
			if (self._hasVideo) {
				continue
			}
			self._hasVideo = true
			codec = 'avc1'
			if (stsdEntry.avcC) {
				codec += '.' + stsdEntry.avcC.mimeCodec
			}
			mime = 'video/mp4; codecs="' + codec + '"'
		} else if (handlerType === 'soun' && stsdEntry.type === 'mp4a') {
			if (self._hasAudio) {
				continue
			}
			self._hasAudio = true
			codec = 'mp4a'
			if (stsdEntry.esds && stsdEntry.esds.mimeCodec) {
				codec += '.' + stsdEntry.esds.mimeCodec
			}
			mime = 'audio/mp4; codecs="' + codec + '"'
		} else {
			continue
		}

		var samples = []
		var sample = 0

		// Chunk/position data
		var sampleInChunk = 0
		var chunk = 0
		var offsetInChunk = 0
		var sampleToChunkIndex = 0

		// Time data
		var dts = 0
		var decodingTimeEntry = new RunLengthIndex(stbl.stts.entries)
		var presentationOffsetEntry = null
		if (stbl.ctts) {
			presentationOffsetEntry = new RunLengthIndex(stbl.ctts.entries)
		}

		// Sync table index
		var syncSampleIndex = 0

		while (true) {
			var currChunkEntry = stbl.stsc.entries[sampleToChunkIndex]

			// Compute size
			var size = stbl.stsz.entries[sample]

			// Compute time data
			var duration = decodingTimeEntry.value.duration
			var presentationOffset = presentationOffsetEntry ? presentationOffsetEntry.value.compositionOffset : 0

			// Compute sync
			var sync = true
			if (stbl.stss) {
				sync = stbl.stss.entries[syncSampleIndex] === sample + 1
			}

			// Create new sample entry
			samples.push({
				size: size,
				duration: duration,
				dts: dts,
				presentationOffset: presentationOffset,
				sync: sync,
				offset: offsetInChunk + stbl.stco.entries[chunk]
			})

			// Go to next sample
			sample++
			if (sample >= stbl.stsz.entries.length) {
				break
			}

			// Move position/chunk
			sampleInChunk++
			offsetInChunk += size
			if (sampleInChunk >= currChunkEntry.samplesPerChunk) {
				// Move to new chunk
				sampleInChunk = 0
				offsetInChunk = 0
				chunk++
				// Move sample to chunk box index
				var nextChunkEntry = stbl.stsc.entries[sampleToChunkIndex + 1]
				if (nextChunkEntry && chunk + 1 >= nextChunkEntry.firstChunk) {
					sampleToChunkIndex++
				}
			}

			// Move time forward
			dts += duration
			decodingTimeEntry.inc()
			presentationOffsetEntry && presentationOffsetEntry.inc()

			// Move sync table index
			if (sync) {
				syncSampleIndex++
			}
		}

		trak.mdia.mdhd.duration = 0
		trak.tkhd.duration = 0

		var defaultSampleDescriptionIndex = currChunkEntry.sampleDescriptionId

		var trackMoov = {
			type: 'moov',
			mvhd: moov.mvhd,
			traks: [{
				tkhd: trak.tkhd,
				mdia: {
					mdhd: trak.mdia.mdhd,
					hdlr: trak.mdia.hdlr,
					elng: trak.mdia.elng,
					minf: {
						vmhd: trak.mdia.minf.vmhd,
						smhd: trak.mdia.minf.smhd,
						dinf: trak.mdia.minf.dinf,
						stbl: {
							stsd: stbl.stsd,
							stts: empty(),
							ctts: empty(),
							stsc: empty(),
							stsz: empty(),
							stco: empty(),
							stss: empty()
						}
					}
				}
			}],
			mvex: {
				mehd: {
					fragmentDuration: moov.mvhd.duration
				},
				trexs: [{
					trackId: trak.tkhd.trackId,
					defaultSampleDescriptionIndex: defaultSampleDescriptionIndex,
					defaultSampleDuration: 0,
					defaultSampleSize: 0,
					defaultSampleFlags: 0
				}]
			}
		}

		self._tracks.push({
			trackId: trak.tkhd.trackId,
			timeScale: trak.mdia.mdhd.timeScale,
			samples: samples,
			currSample: null,
			currTime: null,
			moov: trackMoov,
			mime: mime
		})
	}

	if (self._tracks.length === 0) {
		self.emit('error', new Error('no playable tracks'))
		return
	}

	// Must be set last since this is used above
	moov.mvhd.duration = 0

	self._ftyp = {
		type: 'ftyp',
		brand: 'iso5',
		brandVersion: 0,
		compatibleBrands: [
			'iso5'
		]
	}

	var ftypBuf = Box.encode(self._ftyp)
	var data = self._tracks.map(function (track) {
		var moovBuf = Box.encode(track.moov)
		return {
			mime: track.mime,
			init: Buffer.concat([ftypBuf, moovBuf])
		}
	})

	self.emit('ready', data)
}

function empty () {
	return {
		version: 0,
		flags: 0,
		entries: []
	}
}

MP4Remuxer.prototype.seek = function (time) {
	var self = this
	if (!self._tracks) {
		throw new Error('Not ready yet; wait for \'ready\' event')
	}

	if (self._fileStream) {
		self._fileStream.destroy()
		self._fileStream = null
	}

	var startOffset = -1
	self._tracks.map(function (track, i) {
		// find the keyframe before the time
		// stream from there
		if (track.outStream) {
			track.outStream.destroy()
		}
		if (track.inStream) {
			track.inStream.destroy()
			track.inStream = null
		}
		var outStream = track.outStream = mp4.encode()
		var fragment = self._generateFragment(i, time)
		if (!fragment) {
			return outStream.finalize()
		}

		if (startOffset === -1 || fragment.ranges[0].start < startOffset) {
			startOffset = fragment.ranges[0].start
		}

		writeFragment(fragment)

		function writeFragment (frag) {
			if (outStream.destroyed) return
			outStream.box(frag.moof, function (err) {
				if (err) return self.emit('error', err)
				if (outStream.destroyed) return
				var slicedStream = track.inStream.slice(frag.ranges)
				slicedStream.pipe(outStream.mediaData(frag.length, function (err) {
					if (err) return self.emit('error', err)
					if (outStream.destroyed) return
					var nextFrag = self._generateFragment(i)
					if (!nextFrag) {
						return outStream.finalize()
					}
					writeFragment(nextFrag)
				}))
			})
		}
	})

	if (startOffset >= 0) {
		var fileStream = self._fileStream = self._file.createReadStream({
			start: startOffset
		})

		self._tracks.forEach(function (track) {
			track.inStream = new RangeSliceStream(startOffset, {
				// Allow up to a 10MB offset between audio and video,
				// which should be fine for any reasonable interleaving
				// interval and bitrate
				highWaterMark: 10000000
			})
			fileStream.pipe(track.inStream)
		})
	}

	return self._tracks.map(function (track) {
		return track.outStream
	})
}

MP4Remuxer.prototype._findSampleBefore = function (trackInd, time) {
	var self = this

	var track = self._tracks[trackInd]
	var scaledTime = Math.floor(track.timeScale * time)
	var sample = bs(track.samples, scaledTime, function (sample, t) {
		var pts = sample.dts + sample.presentationOffset// - track.editShift
		return pts - t
	})
	if (sample === -1) {
		sample = 0
	} else if (sample < 0) {
		sample = -sample - 2
	}
	// sample is now the last sample with dts <= time
	// Find the preceeding sync sample
	while (!track.samples[sample].sync) {
		sample--
	}
	return sample
}

var MIN_FRAGMENT_DURATION = 1 // second

MP4Remuxer.prototype._generateFragment = function (track, time) {
	var self = this
	/*
	1. Find correct sample
	2. Process backward until sync sample found
	3. Process forward until next sync sample after MIN_FRAGMENT_DURATION found
	*/
	var currTrack = self._tracks[track]
	var firstSample
	if (time !== undefined) {
		firstSample = self._findSampleBefore(track, time)
	} else {
		firstSample = currTrack.currSample
	}

	if (firstSample >= currTrack.samples.length)
		return null

	var startDts = currTrack.samples[firstSample].dts

	var totalLen = 0
	var ranges = []
	for (var currSample = firstSample; currSample < currTrack.samples.length; currSample++) {
		var sample = currTrack.samples[currSample]
		if (sample.sync && sample.dts - startDts >= currTrack.timeScale * MIN_FRAGMENT_DURATION) {
			break // This is a reasonable place to end the fragment
		}

		totalLen += sample.size
		var currRange = ranges.length - 1
		if (currRange < 0 || ranges[currRange].end !== sample.offset) {
			// Push a new range
			ranges.push({
				start: sample.offset,
				end: sample.offset + sample.size
			})
		} else {
			ranges[currRange].end += sample.size
		}
	}

	currTrack.currSample = currSample

	return {
		moof: self._generateMoof(track, firstSample, currSample),
		ranges: ranges,
		length: totalLen
	}
}

MP4Remuxer.prototype._generateMoof = function (track, firstSample, lastSample) {
	var self = this

	var currTrack = self._tracks[track]

	var entries = []
	for (var j = firstSample; j < lastSample; j++) {
		var currSample = currTrack.samples[j]
		entries.push({
			sampleDuration: currSample.duration,
			sampleSize: currSample.size,
			sampleFlags: currSample.sync ? 0x2000000 : 0x1010000,
			sampleCompositionTimeOffset: currSample.presentationOffset
		})
	}

	var moof = {
		type: 'moof',
		mfhd: {
			sequenceNumber: self._fragmentSequence++
		},
		trafs: [{
			tfhd: {
				flags: 0x20000, // default-base-is-moof
				trackId: currTrack.trackId
			},
			tfdt: {
				baseMediaDecodeTime: currTrack.samples[firstSample].dts
			},
			trun: {
				flags: 0xf01,
				dataOffset: 8, // The moof size has to be added to this later as well
				entries: entries
			}
		}]
	}

	// Update the offset
	moof.trafs[0].trun.dataOffset += Box.encodingLength(moof)

	return moof
}

}).call(this,require("buffer").Buffer)
},{"binary-search":6,"buffer":119,"events":122,"inherits":30,"mp4-box-encoding":41,"mp4-stream":44,"range-slice-stream":55}],99:[function(require,module,exports){
var once = require('once')
var eos = require('end-of-stream')
var fs = require('fs') // we only need fs to get the ReadStream and WriteStream prototypes

var noop = function () {}

var isFn = function (fn) {
  return typeof fn === 'function'
}

var isFS = function (stream) {
  if (!fs) return false // browser
  return (stream instanceof (fs.ReadStream || noop) || stream instanceof (fs.WriteStream || noop)) && isFn(stream.close)
}

var isRequest = function (stream) {
  return stream.setHeader && isFn(stream.abort)
}

var destroyer = function (stream, reading, writing, callback) {
  callback = once(callback)

  var closed = false
  stream.on('close', function () {
    closed = true
  })

  eos(stream, {readable: reading, writable: writing}, function (err) {
    if (err) return callback(err)
    closed = true
    callback()
  })

  var destroyed = false
  return function (err) {
    if (closed) return
    if (destroyed) return
    destroyed = true

    if (isFS(stream)) return stream.close(noop) // use close for fs streams to avoid fd leaks
    if (isRequest(stream)) return stream.abort() // request.destroy just do .end - .abort is what we want

    if (isFn(stream.destroy)) return stream.destroy()

    callback(err || new Error('stream was destroyed'))
  }
}

var call = function (fn) {
  fn()
}

var pipe = function (from, to) {
  return from.pipe(to)
}

var pump = function () {
  var streams = Array.prototype.slice.call(arguments)
  var callback = isFn(streams[streams.length - 1] || noop) && streams.pop() || noop

  if (Array.isArray(streams[0])) streams = streams[0]
  if (streams.length < 2) throw new Error('pump requires two streams per minimum')

  var error
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1
    var writing = i > 0
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err
      if (err) destroys.forEach(call)
      if (reading) return
      destroys.forEach(call)
      callback(error)
    })
  })

  return streams.reduce(pipe)
}

module.exports = pump

},{"end-of-stream":25,"fs":118,"once":48}],100:[function(require,module,exports){
var MediaElementWrapper = require('mediasource')
var pump = require('pump')

var MP4Remuxer = require('./mp4-remuxer')

module.exports = VideoStream

function VideoStream (file, mediaElem, opts) {
	var self = this
	if (!(this instanceof VideoStream)) return new VideoStream(file, mediaElem, opts)
	opts = opts || {}

	self.detailedError = null

	self._elem = mediaElem
	self._elemWrapper = new MediaElementWrapper(mediaElem)
	self._waitingFired = false
	self._trackMeta = null
	self._file = file
	self._tracks = null
	if (self._elem.preload !== 'none') {
		self._createMuxer()
	}

	self._onError = function (err) {
		self.detailedError = self._elemWrapper.detailedError
		self.destroy() // don't pass err though so the user doesn't need to listen for errors
	}
	self._onWaiting = function () {
		self._waitingFired = true
		if (!self._muxer) {
			self._createMuxer()
		} else if (self._tracks) {
			self._pump()
		}
	}
	self._elem.addEventListener('waiting', self._onWaiting)
	self._elem.addEventListener('error', self._onError)
}

VideoStream.prototype._createMuxer = function () {
	var self = this
	self._muxer = new MP4Remuxer(self._file)
	self._muxer.on('ready', function (data) {
		self._tracks = data.map(function (trackData) {
			var mediaSource = self._elemWrapper.createWriteStream(trackData.mime)
			mediaSource.on('error', function (err) {
				self._elemWrapper.error(err)
			})
			var track = {
				muxed: null,
				mediaSource: mediaSource,
				initFlushed: false,
				onInitFlushed: null
			}
			mediaSource.write(trackData.init, function (err) {
				track.initFlushed = true
				if (track.onInitFlushed) {
					track.onInitFlushed(err)
				}
			})
			return track
		})

		if (self._waitingFired || self._elem.preload === 'auto') {
			self._pump()
		}
	})

	self._muxer.on('error', function (err) {
		self._elemWrapper.error(err)
	})
}

VideoStream.prototype._pump = function () {
	var self = this

	var muxed = self._muxer.seek(self._elem.currentTime, !self._tracks)

	self._tracks.forEach(function (track, i) {
		var pumpTrack = function () {
			if (track.muxed) {
				track.muxed.destroy()
				track.mediaSource = self._elemWrapper.createWriteStream(track.mediaSource)
				track.mediaSource.on('error', function (err) {
					self._elemWrapper.error(err)
				})
			}
			track.muxed = muxed[i]
			pump(track.muxed, track.mediaSource)
		}
		if (!track.initFlushed) {
			track.onInitFlushed = function (err) {
				if (err) {
					self._elemWrapper.error(err)
					return
				}
				pumpTrack()
			}
		} else {
			pumpTrack()
		}
	})
}

VideoStream.prototype.destroy = function () {
	var self = this
	if (self.destroyed) {
		return
	}
	self.destroyed = true

	self._elem.removeEventListener('waiting', self._onWaiting)
	self._elem.removeEventListener('error', self._onError)

	if (self._tracks) {
		self._tracks.forEach(function (track) {
			track.muxed.destroy()
		})
	}

	self._elem.src = ''
}

},{"./mp4-remuxer":98,"mediasource":37,"pump":99}],101:[function(require,module,exports){
(function (process,global){
/* global FileList */

module.exports = WebTorrent

var Buffer = require('safe-buffer').Buffer
var concat = require('simple-concat')
var createTorrent = require('create-torrent')
var debug = require('debug')('webtorrent')
var DHT = require('bittorrent-dht/client') // browser exclude
var EventEmitter = require('events').EventEmitter
var extend = require('xtend')
var inherits = require('inherits')
var loadIPSet = require('load-ip-set') // browser exclude
var parallel = require('run-parallel')
var parseTorrent = require('parse-torrent')
var path = require('path')
var Peer = require('simple-peer')
var randombytes = require('randombytes')
var speedometer = require('speedometer')
var zeroFill = require('zero-fill')

var TCPPool = require('./lib/tcp-pool') // browser exclude
var Torrent = require('./lib/torrent')

/**
 * WebTorrent version.
 */
var VERSION = require('./package.json').version

/**
 * Version number in Azureus-style. Generated from major and minor semver version.
 * For example:
 *   '0.16.1' -> '0016'
 *   '1.2.5' -> '0102'
 */
var VERSION_STR = VERSION.match(/([0-9]+)/g)
  .slice(0, 2)
  .map(function (v) { return zeroFill(2, v) })
  .join('')

/**
 * Version prefix string (used in peer ID). WebTorrent uses the Azureus-style
 * encoding: '-', two characters for client id ('WW'), four ascii digits for version
 * number, '-', followed by random numbers.
 * For example:
 *   '-WW0102-'...
 */
var VERSION_PREFIX = '-WW' + VERSION_STR + '-'

inherits(WebTorrent, EventEmitter)

/**
 * WebTorrent Client
 * @param {Object=} opts
 */
function WebTorrent (opts) {
  var self = this
  if (!(self instanceof WebTorrent)) return new WebTorrent(opts)
  EventEmitter.call(self)

  if (!opts) opts = {}

  if (typeof opts.peerId === 'string') {
    self.peerId = opts.peerId
  } else if (Buffer.isBuffer(opts.peerId)) {
    self.peerId = opts.peerId.toString('hex')
  } else {
    self.peerId = Buffer.from(VERSION_PREFIX + randombytes(9).toString('base64')).toString('hex')
  }
  self.peerIdBuffer = Buffer.from(self.peerId, 'hex')

  if (typeof opts.nodeId === 'string') {
    self.nodeId = opts.nodeId
  } else if (Buffer.isBuffer(opts.nodeId)) {
    self.nodeId = opts.nodeId.toString('hex')
  } else {
    self.nodeId = randombytes(20).toString('hex')
  }
  self.nodeIdBuffer = Buffer.from(self.nodeId, 'hex')

  self._debugId = self.peerId.toString('hex').substring(0, 7)

  self.destroyed = false
  self.listening = false
  self.torrentPort = opts.torrentPort || 0
  self.dhtPort = opts.dhtPort || 0
  self.tracker = opts.tracker !== undefined ? opts.tracker : {}
  self.torrents = []
  self.maxConns = Number(opts.maxConns) || 55

  self._debug(
    'new webtorrent (peerId %s, nodeId %s, port %s)',
    self.peerId, self.nodeId, self.torrentPort
  )

  if (self.tracker) {
    if (typeof self.tracker !== 'object') self.tracker = {}
    if (opts.rtcConfig) {
      // TODO: remove in v1
      console.warn('WebTorrent: opts.rtcConfig is deprecated. Use opts.tracker.rtcConfig instead')
      self.tracker.rtcConfig = opts.rtcConfig
    }
    if (opts.wrtc) {
      // TODO: remove in v1
      console.warn('WebTorrent: opts.wrtc is deprecated. Use opts.tracker.wrtc instead')
      self.tracker.wrtc = opts.wrtc
    }
    if (global.WRTC && !self.tracker.wrtc) {
      self.tracker.wrtc = global.WRTC
    }
  }

  if (typeof TCPPool === 'function') {
    self._tcpPool = new TCPPool(self)
  } else {
    process.nextTick(function () {
      self._onListening()
    })
  }

  // stats
  self._downloadSpeed = speedometer()
  self._uploadSpeed = speedometer()

  if (opts.dht !== false && typeof DHT === 'function' /* browser exclude */) {
    // use a single DHT instance for all torrents, so the routing table can be reused
    self.dht = new DHT(extend({ nodeId: self.nodeId }, opts.dht))

    self.dht.once('error', function (err) {
      self._destroy(err)
    })

    self.dht.once('listening', function () {
      var address = self.dht.address()
      if (address) self.dhtPort = address.port
    })

    // Ignore warning when there are > 10 torrents in the client
    self.dht.setMaxListeners(0)

    self.dht.listen(self.dhtPort)
  } else {
    self.dht = false
  }

  // Enable or disable BEP19 (Web Seeds). Enabled by default:
  self.enableWebSeeds = opts.webSeeds !== false

  if (typeof loadIPSet === 'function' && opts.blocklist != null) {
    loadIPSet(opts.blocklist, {
      headers: {
        'user-agent': 'WebTorrent/' + VERSION + ' (https://webtorrent.io)'
      }
    }, function (err, ipSet) {
      if (err) return self.error('Failed to load blocklist: ' + err.message)
      self.blocked = ipSet
      ready()
    })
  } else {
    process.nextTick(ready)
  }

  function ready () {
    if (self.destroyed) return
    self.ready = true
    self.emit('ready')
  }
}

WebTorrent.WEBRTC_SUPPORT = Peer.WEBRTC_SUPPORT

Object.defineProperty(WebTorrent.prototype, 'downloadSpeed', {
  get: function () { return this._downloadSpeed() }
})

Object.defineProperty(WebTorrent.prototype, 'uploadSpeed', {
  get: function () { return this._uploadSpeed() }
})

Object.defineProperty(WebTorrent.prototype, 'progress', {
  get: function () {
    var torrents = this.torrents.filter(function (torrent) {
      return torrent.progress !== 1
    })
    var downloaded = torrents.reduce(function (total, torrent) {
      return total + torrent.downloaded
    }, 0)
    var length = torrents.reduce(function (total, torrent) {
      return total + (torrent.length || 0)
    }, 0) || 1
    return downloaded / length
  }
})

Object.defineProperty(WebTorrent.prototype, 'ratio', {
  get: function () {
    var uploaded = this.torrents.reduce(function (total, torrent) {
      return total + torrent.uploaded
    }, 0)
    var received = this.torrents.reduce(function (total, torrent) {
      return total + torrent.received
    }, 0) || 1
    return uploaded / received
  }
})

/**
 * Returns the torrent with the given `torrentId`. Convenience method. Easier than
 * searching through the `client.torrents` array. Returns `null` if no matching torrent
 * found.
 *
 * @param  {string|Buffer|Object|Torrent} torrentId
 * @return {Torrent|null}
 */
WebTorrent.prototype.get = function (torrentId) {
  var self = this
  var i, torrent
  var len = self.torrents.length

  if (torrentId instanceof Torrent) {
    for (i = 0; i < len; i++) {
      torrent = self.torrents[i]
      if (torrent === torrentId) return torrent
    }
  } else {
    var parsed
    try { parsed = parseTorrent(torrentId) } catch (err) {}

    if (!parsed) return null
    if (!parsed.infoHash) throw new Error('Invalid torrent identifier')

    for (i = 0; i < len; i++) {
      torrent = self.torrents[i]
      if (torrent.infoHash === parsed.infoHash) return torrent
    }
  }
  return null
}

// TODO: remove in v1
WebTorrent.prototype.download = function (torrentId, opts, ontorrent) {
  console.warn('WebTorrent: client.download() is deprecated. Use client.add() instead')
  return this.add(torrentId, opts, ontorrent)
}

/**
 * Start downloading a new torrent. Aliased as `client.download`.
 * @param {string|Buffer|Object} torrentId
 * @param {Object} opts torrent-specific options
 * @param {function=} ontorrent called when the torrent is ready (has metadata)
 */
WebTorrent.prototype.add = function (torrentId, opts, ontorrent) {
  var self = this
  if (self.destroyed) throw new Error('client is destroyed')
  if (typeof opts === 'function') return self.add(torrentId, null, opts)

  self._debug('add')
  opts = opts ? extend(opts) : {}

  var torrent = new Torrent(torrentId, self, opts)
  self.torrents.push(torrent)

  torrent.once('_infoHash', onInfoHash)
  torrent.once('ready', onReady)
  torrent.once('close', onClose)

  function onInfoHash () {
    if (self.destroyed) return
    for (var i = 0, len = self.torrents.length; i < len; i++) {
      var t = self.torrents[i]
      if (t.infoHash === torrent.infoHash && t !== torrent) {
        torrent._destroy(new Error('Cannot add duplicate torrent ' + torrent.infoHash))
        return
      }
    }
  }

  function onReady () {
    if (self.destroyed) return
    if (typeof ontorrent === 'function') ontorrent(torrent)
    self.emit('torrent', torrent)
  }

  function onClose () {
    torrent.removeListener('_infoHash', onInfoHash)
    torrent.removeListener('ready', onReady)
    torrent.removeListener('close', onClose)
  }

  return torrent
}

/**
 * Start seeding a new file/folder.
 * @param  {string|File|FileList|Buffer|Array.<string|File|Buffer>} input
 * @param  {Object=} opts
 * @param  {function=} onseed called when torrent is seeding
 */
WebTorrent.prototype.seed = function (input, opts, onseed) {
  var self = this
  if (self.destroyed) throw new Error('client is destroyed')
  if (typeof opts === 'function') return self.seed(input, null, opts)

  self._debug('seed')
  opts = opts ? extend(opts) : {}

  // When seeding from fs path, initialize store from that path to avoid a copy
  if (typeof input === 'string') opts.path = path.dirname(input)
  if (!opts.createdBy) opts.createdBy = 'WebTorrent/' + VERSION_STR

  var torrent = self.add(null, opts, onTorrent)
  var streams

  if (isFileList(input)) input = Array.prototype.slice.call(input)
  if (!Array.isArray(input)) input = [ input ]

  parallel(input.map(function (item) {
    return function (cb) {
      if (isReadable(item)) concat(item, cb)
      else cb(null, item)
    }
  }), function (err, input) {
    if (self.destroyed) return
    if (err) return torrent._destroy(err)

    createTorrent.parseInput(input, opts, function (err, files) {
      if (self.destroyed) return
      if (err) return torrent._destroy(err)

      streams = files.map(function (file) {
        return file.getStream
      })

      createTorrent(input, opts, function (err, torrentBuf) {
        if (self.destroyed) return
        if (err) return torrent._destroy(err)

        var existingTorrent = self.get(torrentBuf)
        if (existingTorrent) {
          torrent._destroy(new Error('Cannot add duplicate torrent ' + existingTorrent.infoHash))
        } else {
          torrent._onTorrentId(torrentBuf)
        }
      })
    })
  })

  function onTorrent (torrent) {
    var tasks = [
      function (cb) {
        torrent.load(streams, cb)
      }
    ]
    if (self.dht) {
      tasks.push(function (cb) {
        torrent.once('dhtAnnounce', cb)
      })
    }
    parallel(tasks, function (err) {
      if (self.destroyed) return
      if (err) return torrent._destroy(err)
      _onseed(torrent)
    })
  }

  function _onseed (torrent) {
    self._debug('on seed')
    if (typeof onseed === 'function') onseed(torrent)
    torrent.emit('seed')
    self.emit('seed', torrent)
  }

  return torrent
}

/**
 * Remove a torrent from the client.
 * @param  {string|Buffer|Torrent}   torrentId
 * @param  {function} cb
 */
WebTorrent.prototype.remove = function (torrentId, cb) {
  this._debug('remove')
  var torrent = this.get(torrentId)
  if (!torrent) throw new Error('No torrent with id ' + torrentId)
  this._remove(torrentId, cb)
}

WebTorrent.prototype._remove = function (torrentId, cb) {
  var torrent = this.get(torrentId)
  if (!torrent) return
  this.torrents.splice(this.torrents.indexOf(torrent), 1)
  torrent.destroy(cb)
}

WebTorrent.prototype.address = function () {
  if (!this.listening) return null
  return this._tcpPool
    ? this._tcpPool.server.address()
    : { address: '0.0.0.0', family: 'IPv4', port: 0 }
}

/**
 * Destroy the client, including all torrents and connections to peers.
 * @param  {function} cb
 */
WebTorrent.prototype.destroy = function (cb) {
  if (this.destroyed) throw new Error('client already destroyed')
  this._destroy(null, cb)
}

WebTorrent.prototype._destroy = function (err, cb) {
  var self = this
  self._debug('client destroy')
  self.destroyed = true

  var tasks = self.torrents.map(function (torrent) {
    return function (cb) {
      torrent.destroy(cb)
    }
  })

  if (self._tcpPool) {
    tasks.push(function (cb) {
      self._tcpPool.destroy(cb)
    })
  }

  if (self.dht) {
    tasks.push(function (cb) {
      self.dht.destroy(cb)
    })
  }

  parallel(tasks, cb)

  if (err) self.emit('error', err)

  self.torrents = []
  self._tcpPool = null
  self.dht = null
}

WebTorrent.prototype._onListening = function () {
  this._debug('listening')
  this.listening = true

  if (this._tcpPool) {
    // Sometimes server.address() returns `null` in Docker.
    var address = this._tcpPool.server.address()
    if (address) this.torrentPort = address.port
  }

  this.emit('listening')
}

WebTorrent.prototype._debug = function () {
  var args = [].slice.call(arguments)
  args[0] = '[' + this._debugId + '] ' + args[0]
  debug.apply(null, args)
}

/**
 * Check if `obj` is a node Readable stream
 * @param  {*} obj
 * @return {boolean}
 */
function isReadable (obj) {
  return typeof obj === 'object' && obj != null && typeof obj.pipe === 'function'
}

/**
 * Check if `obj` is a W3C `FileList` object
 * @param  {*} obj
 * @return {boolean}
 */
function isFileList (obj) {
  return typeof FileList !== 'undefined' && obj instanceof FileList
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./lib/tcp-pool":118,"./lib/torrent":106,"./package.json":111,"_process":130,"bittorrent-dht/client":118,"create-torrent":21,"debug":108,"events":122,"inherits":30,"load-ip-set":118,"parse-torrent":50,"path":128,"randombytes":54,"run-parallel":68,"safe-buffer":70,"simple-concat":71,"simple-peer":73,"speedometer":78,"xtend":113,"zero-fill":115}],102:[function(require,module,exports){
module.exports = FileStream

var debug = require('debug')('webtorrent:file-stream')
var inherits = require('inherits')
var stream = require('readable-stream')

inherits(FileStream, stream.Readable)

/**
 * Readable stream of a torrent file
 *
 * @param {File} file
 * @param {Object} opts
 * @param {number} opts.start stream slice of file, starting from this byte (inclusive)
 * @param {number} opts.end stream slice of file, ending with this byte (inclusive)
 */
function FileStream (file, opts) {
  stream.Readable.call(this, opts)

  this.destroyed = false
  this._torrent = file._torrent

  var start = (opts && opts.start) || 0
  var end = (opts && opts.end && opts.end < file.length)
    ? opts.end
    : file.length - 1

  var pieceLength = file._torrent.pieceLength

  this._startPiece = (start + file.offset) / pieceLength | 0
  this._endPiece = (end + file.offset) / pieceLength | 0

  this._piece = this._startPiece
  this._offset = (start + file.offset) - (this._startPiece * pieceLength)

  this._missing = end - start + 1
  this._reading = false
  this._notifying = false
  this._criticalLength = Math.min((1024 * 1024 / pieceLength) | 0, 2)
}

FileStream.prototype._read = function () {
  if (this._reading) return
  this._reading = true
  this._notify()
}

FileStream.prototype._notify = function () {
  var self = this

  if (!self._reading || self._missing === 0) return
  if (!self._torrent.bitfield.get(self._piece)) {
    return self._torrent.critical(self._piece, self._piece + self._criticalLength)
  }

  if (self._notifying) return
  self._notifying = true

  if (self._torrent.destroyed) return self._destroy(new Error('Torrent removed'))

  var p = self._piece
  self._torrent.store.get(p, function (err, buffer) {
    self._notifying = false
    if (self.destroyed) return
    if (err) return self._destroy(err)
    debug('read %s (length %s) (err %s)', p, buffer.length, err && err.message)

    if (self._offset) {
      buffer = buffer.slice(self._offset)
      self._offset = 0
    }

    if (self._missing < buffer.length) {
      buffer = buffer.slice(0, self._missing)
    }
    self._missing -= buffer.length

    debug('pushing buffer of length %s', buffer.length)
    self._reading = false
    self.push(buffer)

    if (self._missing === 0) self.push(null)
  })
  self._piece += 1
}

FileStream.prototype.destroy = function (onclose) {
  this._destroy(null, onclose)
}

FileStream.prototype._destroy = function (err, onclose) {
  if (this.destroyed) return
  this.destroyed = true

  if (!this._torrent.destroyed) {
    this._torrent.deselect(this._startPiece, this._endPiece, true)
  }

  if (err) this.emit('error', err)
  this.emit('close')
  if (onclose) onclose()
}

},{"debug":108,"inherits":30,"readable-stream":64}],103:[function(require,module,exports){
(function (process){
module.exports = File

var eos = require('end-of-stream')
var EventEmitter = require('events').EventEmitter
var FileStream = require('./file-stream')
var inherits = require('inherits')
var path = require('path')
var render = require('render-media')
var stream = require('readable-stream')
var streamToBlob = require('stream-to-blob')
var streamToBlobURL = require('stream-to-blob-url')
var streamToBuffer = require('stream-with-known-length-to-buffer')

inherits(File, EventEmitter)

function File (torrent, file) {
  EventEmitter.call(this)

  this._torrent = torrent
  this._destroyed = false

  this.name = file.name
  this.path = file.path
  this.length = file.length
  this.offset = file.offset

  this.done = false

  var start = file.offset
  var end = start + file.length - 1

  this._startPiece = start / this._torrent.pieceLength | 0
  this._endPiece = end / this._torrent.pieceLength | 0

  if (this.length === 0) {
    this.done = true
    this.emit('done')
  }
}

Object.defineProperty(File.prototype, 'downloaded', {
  get: function () {
    if (!this._torrent.bitfield) return 0
    var downloaded = 0
    for (var index = this._startPiece; index <= this._endPiece; ++index) {
      if (this._torrent.bitfield.get(index)) {
        // verified data
        downloaded += (index === this._endPiece) ? this._torrent.lastPieceLength : this._torrent.pieceLength
      } else {
        // "in progress" data
        var piece = this._torrent.pieces[index]
        downloaded += (piece.length - piece.missing)
      }
    }
    return downloaded
  }
})

Object.defineProperty(File.prototype, 'progress', {
  get: function () { return this.length ? this.downloaded / this.length : 0 }
})

File.prototype.select = function (priority) {
  if (this.length === 0) return
  this._torrent.select(this._startPiece, this._endPiece, priority)
}

File.prototype.deselect = function () {
  if (this.length === 0) return
  this._torrent.deselect(this._startPiece, this._endPiece, false)
}

File.prototype.createReadStream = function (opts) {
  var self = this
  if (this.length === 0) {
    var empty = new stream.PassThrough()
    process.nextTick(function () {
      empty.end()
    })
    return empty
  }

  var fileStream = new FileStream(self, opts)
  self._torrent.select(fileStream._startPiece, fileStream._endPiece, true, function () {
    fileStream._notify()
  })
  eos(fileStream, function () {
    if (self._destroyed) return
    if (!self._torrent.destroyed) {
      self._torrent.deselect(fileStream._startPiece, fileStream._endPiece, true)
    }
  })
  return fileStream
}

File.prototype.getBuffer = function (cb) {
  streamToBuffer(this.createReadStream(), this.length, cb)
}

File.prototype.getBlob = function (cb) {
  if (typeof window === 'undefined') throw new Error('browser-only method')
  streamToBlob(this.createReadStream(), this._getMimeType(), cb)
}

File.prototype.getBlobURL = function (cb) {
  if (typeof window === 'undefined') throw new Error('browser-only method')
  streamToBlobURL(this.createReadStream(), this._getMimeType(), cb)
}

File.prototype.appendTo = function (elem, opts, cb) {
  if (typeof window === 'undefined') throw new Error('browser-only method')
  render.append(this, elem, opts, cb)
}

File.prototype.renderTo = function (elem, opts, cb) {
  if (typeof window === 'undefined') throw new Error('browser-only method')
  render.render(this, elem, opts, cb)
}

File.prototype._getMimeType = function () {
  return render.mime[path.extname(this.name).toLowerCase()]
}

File.prototype._destroy = function () {
  this._destroyed = true
  this._torrent = null
}

}).call(this,require('_process'))
},{"./file-stream":102,"_process":130,"end-of-stream":25,"events":122,"inherits":30,"path":128,"readable-stream":64,"render-media":65,"stream-to-blob":84,"stream-to-blob-url":83,"stream-with-known-length-to-buffer":85}],104:[function(require,module,exports){
var arrayRemove = require('unordered-array-remove')
var debug = require('debug')('webtorrent:peer')
var Wire = require('bittorrent-protocol')

var WebConn = require('./webconn')

var CONNECT_TIMEOUT_TCP = 5000
var CONNECT_TIMEOUT_WEBRTC = 25000
var HANDSHAKE_TIMEOUT = 25000

/**
 * WebRTC peer connections start out connected, because WebRTC peers require an
 * "introduction" (i.e. WebRTC signaling), and there's no equivalent to an IP address
 * that lets you refer to a WebRTC endpoint.
 */
exports.createWebRTCPeer = function (conn, swarm) {
  var peer = new Peer(conn.id, 'webrtc')
  peer.conn = conn
  peer.swarm = swarm

  if (peer.conn.connected) {
    peer.onConnect()
  } else {
    peer.conn.once('connect', function () { peer.onConnect() })
    peer.conn.once('error', function (err) { peer.destroy(err) })
    peer.startConnectTimeout()
  }

  return peer
}

/**
 * Incoming TCP peers start out connected, because the remote peer connected to the
 * listening port of the TCP server. Until the remote peer sends a handshake, we don't
 * know what swarm the connection is intended for.
 */
exports.createTCPIncomingPeer = function (conn) {
  var addr = conn.remoteAddress + ':' + conn.remotePort
  var peer = new Peer(addr, 'tcpIncoming')
  peer.conn = conn
  peer.addr = addr

  peer.onConnect()

  return peer
}

/**
 * Outgoing TCP peers start out with just an IP address. At some point (when there is an
 * available connection), the client can attempt to connect to the address.
 */
exports.createTCPOutgoingPeer = function (addr, swarm) {
  var peer = new Peer(addr, 'tcpOutgoing')
  peer.addr = addr
  peer.swarm = swarm

  return peer
}

/**
 * Peer that represents a Web Seed (BEP17 / BEP19).
 */
exports.createWebSeedPeer = function (url, swarm) {
  var peer = new Peer(url, 'webSeed')
  peer.swarm = swarm
  peer.conn = new WebConn(url, swarm)

  peer.onConnect()

  return peer
}

/**
 * Peer. Represents a peer in the torrent swarm.
 *
 * @param {string} id "ip:port" string, peer id (for WebRTC peers), or url (for Web Seeds)
 * @param {string} type the type of the peer
 */
function Peer (id, type) {
  var self = this
  self.id = id
  self.type = type

  debug('new Peer %s', id)

  self.addr = null
  self.conn = null
  self.swarm = null
  self.wire = null

  self.connected = false
  self.destroyed = false
  self.timeout = null // handshake timeout
  self.retries = 0 // outgoing TCP connection retry count

  self.sentHandshake = false
}

/**
 * Called once the peer is connected (i.e. fired 'connect' event)
 * @param {Socket} conn
 */
Peer.prototype.onConnect = function () {
  var self = this
  if (self.destroyed) return
  self.connected = true

  debug('Peer %s connected', self.id)

  clearTimeout(self.connectTimeout)

  var conn = self.conn
  conn.once('end', function () {
    self.destroy()
  })
  conn.once('close', function () {
    self.destroy()
  })
  conn.once('finish', function () {
    self.destroy()
  })
  conn.once('error', function (err) {
    self.destroy(err)
  })

  var wire = self.wire = new Wire()
  wire.type = self.type
  wire.once('end', function () {
    self.destroy()
  })
  wire.once('close', function () {
    self.destroy()
  })
  wire.once('finish', function () {
    self.destroy()
  })
  wire.once('error', function (err) {
    self.destroy(err)
  })

  wire.once('handshake', function (infoHash, peerId) {
    self.onHandshake(infoHash, peerId)
  })
  self.startHandshakeTimeout()

  conn.pipe(wire).pipe(conn)
  if (self.swarm && !self.sentHandshake) self.handshake()
}

/**
 * Called when handshake is received from remote peer.
 * @param {string} infoHash
 * @param {string} peerId
 */
Peer.prototype.onHandshake = function (infoHash, peerId) {
  var self = this
  if (!self.swarm) return // `self.swarm` not set yet, so do nothing
  if (self.destroyed) return

  if (self.swarm.destroyed) {
    return self.destroy(new Error('swarm already destroyed'))
  }
  if (infoHash !== self.swarm.infoHash) {
    return self.destroy(new Error('unexpected handshake info hash for this swarm'))
  }
  if (peerId === self.swarm.peerId) {
    return self.destroy(new Error('refusing to connect to ourselves'))
  }

  debug('Peer %s got handshake %s', self.id, infoHash)

  clearTimeout(self.handshakeTimeout)

  self.retries = 0

  var addr = self.addr
  if (!addr && self.conn.remoteAddress) {
    addr = self.conn.remoteAddress + ':' + self.conn.remotePort
  }
  self.swarm._onWire(self.wire, addr)

  // swarm could be destroyed in user's 'wire' event handler
  if (!self.swarm || self.swarm.destroyed) return

  if (!self.sentHandshake) self.handshake()
}

Peer.prototype.handshake = function () {
  var self = this
  var opts = {
    dht: self.swarm.private ? false : !!self.swarm.client.dht
  }
  self.wire.handshake(self.swarm.infoHash, self.swarm.client.peerId, opts)
  self.sentHandshake = true
}

Peer.prototype.startConnectTimeout = function () {
  var self = this
  clearTimeout(self.connectTimeout)
  self.connectTimeout = setTimeout(function () {
    self.destroy(new Error('connect timeout'))
  }, self.type === 'webrtc' ? CONNECT_TIMEOUT_WEBRTC : CONNECT_TIMEOUT_TCP)
  if (self.connectTimeout.unref) self.connectTimeout.unref()
}

Peer.prototype.startHandshakeTimeout = function () {
  var self = this
  clearTimeout(self.handshakeTimeout)
  self.handshakeTimeout = setTimeout(function () {
    self.destroy(new Error('handshake timeout'))
  }, HANDSHAKE_TIMEOUT)
  if (self.handshakeTimeout.unref) self.handshakeTimeout.unref()
}

Peer.prototype.destroy = function (err) {
  var self = this
  if (self.destroyed) return
  self.destroyed = true
  self.connected = false

  debug('destroy %s (error: %s)', self.id, err && (err.message || err))

  clearTimeout(self.connectTimeout)
  clearTimeout(self.handshakeTimeout)

  var swarm = self.swarm
  var conn = self.conn
  var wire = self.wire

  self.swarm = null
  self.conn = null
  self.wire = null

  if (swarm && wire) {
    arrayRemove(swarm.wires, swarm.wires.indexOf(wire))
  }
  if (conn) {
    conn.on('error', noop)
    conn.destroy()
  }
  if (wire) wire.destroy()
  if (swarm) swarm.removePeer(self.id)
}

function noop () {}

},{"./webconn":107,"bittorrent-protocol":8,"debug":108,"unordered-array-remove":95}],105:[function(require,module,exports){
module.exports = RarityMap

/**
 * Mapping of torrent pieces to their respective availability in the torrent swarm. Used
 * by the torrent manager for implementing the rarest piece first selection strategy.
 */
function RarityMap (torrent) {
  var self = this

  self._torrent = torrent
  self._numPieces = torrent.pieces.length
  self._pieces = []

  self._onWire = function (wire) {
    self.recalculate()
    self._initWire(wire)
  }
  self._onWireHave = function (index) {
    self._pieces[index] += 1
  }
  self._onWireBitfield = function () {
    self.recalculate()
  }

  self._torrent.wires.forEach(function (wire) {
    self._initWire(wire)
  })
  self._torrent.on('wire', self._onWire)
  self.recalculate()
}

/**
 * Get the index of the rarest piece. Optionally, pass a filter function to exclude
 * certain pieces (for instance, those that we already have).
 *
 * @param {function} pieceFilterFunc
 * @return {number} index of rarest piece, or -1
 */
RarityMap.prototype.getRarestPiece = function (pieceFilterFunc) {
  if (!pieceFilterFunc) pieceFilterFunc = trueFn

  var candidates = []
  var min = Infinity

  for (var i = 0; i < this._numPieces; ++i) {
    if (!pieceFilterFunc(i)) continue

    var availability = this._pieces[i]
    if (availability === min) {
      candidates.push(i)
    } else if (availability < min) {
      candidates = [ i ]
      min = availability
    }
  }

  if (candidates.length > 0) {
    // if there are multiple pieces with the same availability, choose one randomly
    return candidates[Math.random() * candidates.length | 0]
  } else {
    return -1
  }
}

RarityMap.prototype.destroy = function () {
  var self = this
  self._torrent.removeListener('wire', self._onWire)
  self._torrent.wires.forEach(function (wire) {
    self._cleanupWireEvents(wire)
  })
  self._torrent = null
  self._pieces = null

  self._onWire = null
  self._onWireHave = null
  self._onWireBitfield = null
}

RarityMap.prototype._initWire = function (wire) {
  var self = this

  wire._onClose = function () {
    self._cleanupWireEvents(wire)
    for (var i = 0; i < this._numPieces; ++i) {
      self._pieces[i] -= wire.peerPieces.get(i)
    }
  }

  wire.on('have', self._onWireHave)
  wire.on('bitfield', self._onWireBitfield)
  wire.once('close', wire._onClose)
}

/**
 * Recalculates piece availability across all peers in the torrent.
 */
RarityMap.prototype.recalculate = function () {
  var i
  for (i = 0; i < this._numPieces; ++i) {
    this._pieces[i] = 0
  }

  var numWires = this._torrent.wires.length
  for (i = 0; i < numWires; ++i) {
    var wire = this._torrent.wires[i]
    for (var j = 0; j < this._numPieces; ++j) {
      this._pieces[j] += wire.peerPieces.get(j)
    }
  }
}

RarityMap.prototype._cleanupWireEvents = function (wire) {
  wire.removeListener('have', this._onWireHave)
  wire.removeListener('bitfield', this._onWireBitfield)
  if (wire._onClose) wire.removeListener('close', wire._onClose)
  wire._onClose = null
}

function trueFn () {
  return true
}

},{}],106:[function(require,module,exports){
(function (process,global){
/* global URL, Blob */

module.exports = Torrent

var addrToIPPort = require('addr-to-ip-port')
var BitField = require('bitfield')
var ChunkStoreWriteStream = require('chunk-store-stream/write')
var debug = require('debug')('webtorrent:torrent')
var Discovery = require('torrent-discovery')
var EventEmitter = require('events').EventEmitter
var extend = require('xtend')
var extendMutable = require('xtend/mutable')
var fs = require('fs')
var FSChunkStore = require('fs-chunk-store') // browser: `memory-chunk-store`
var get = require('simple-get')
var ImmediateChunkStore = require('immediate-chunk-store')
var inherits = require('inherits')
var MultiStream = require('multistream')
var net = require('net') // browser exclude
var os = require('os') // browser exclude
var parallel = require('run-parallel')
var parallelLimit = require('run-parallel-limit')
var parseTorrent = require('parse-torrent')
var path = require('path')
var Piece = require('torrent-piece')
var pump = require('pump')
var randomIterate = require('random-iterate')
var sha1 = require('simple-sha1')
var speedometer = require('speedometer')
var uniq = require('uniq')
var utMetadata = require('ut_metadata')
var utPex = require('ut_pex') // browser exclude

var File = require('./file')
var Peer = require('./peer')
var RarityMap = require('./rarity-map')
var Server = require('./server') // browser exclude

var MAX_BLOCK_LENGTH = 128 * 1024
var PIECE_TIMEOUT = 30000
var CHOKE_TIMEOUT = 5000
var SPEED_THRESHOLD = 3 * Piece.BLOCK_LENGTH

var PIPELINE_MIN_DURATION = 0.5
var PIPELINE_MAX_DURATION = 1

var RECHOKE_INTERVAL = 10000 // 10 seconds
var RECHOKE_OPTIMISTIC_DURATION = 2 // 30 seconds

var FILESYSTEM_CONCURRENCY = 2

var RECONNECT_WAIT = [ 1000, 5000, 15000 ]

var VERSION = require('../package.json').version
var USER_AGENT = 'WebTorrent/' + VERSION + ' (https://webtorrent.io)'

var TMP
try {
  TMP = path.join(fs.statSync('/tmp') && '/tmp', 'webtorrent')
} catch (err) {
  TMP = path.join(typeof os.tmpdir === 'function' ? os.tmpdir() : '/', 'webtorrent')
}

inherits(Torrent, EventEmitter)

function Torrent (torrentId, client, opts) {
  EventEmitter.call(this)

  this._debugId = 'unknown infohash'
  this.client = client

  this.announce = opts.announce
  this.urlList = opts.urlList

  this.path = opts.path
  this._store = opts.store || FSChunkStore
  this._getAnnounceOpts = opts.getAnnounceOpts

  this.strategy = opts.strategy || 'sequential'

  this.maxWebConns = opts.maxWebConns || 4

  this._rechokeNumSlots = (opts.uploads === false || opts.uploads === 0)
    ? 0
    : (+opts.uploads || 10)
  this._rechokeOptimisticWire = null
  this._rechokeOptimisticTime = 0
  this._rechokeIntervalId = null

  this.ready = false
  this.destroyed = false
  this.paused = false
  this.done = false

  this.metadata = null
  this.store = null
  this.files = []
  this.pieces = []

  this._amInterested = false
  this._selections = []
  this._critical = []

  this.wires = [] // open wires (added *after* handshake)

  this._queue = [] // queue of outgoing tcp peers to connect to
  this._peers = {} // connected peers (addr/peerId -> Peer)
  this._peersLength = 0 // number of elements in `this._peers` (cache, for perf)

  // stats
  this.received = 0
  this.uploaded = 0
  this._downloadSpeed = speedometer()
  this._uploadSpeed = speedometer()

  // for cleanup
  this._servers = []
  this._xsRequests = []

  // TODO: remove this and expose a hook instead
  // optimization: don't recheck every file if it hasn't changed
  this._fileModtimes = opts.fileModtimes

  if (torrentId !== null) this._onTorrentId(torrentId)

  this._debug('new torrent')
}

Object.defineProperty(Torrent.prototype, 'timeRemaining', {
  get: function () {
    if (this.done) return 0
    if (this.downloadSpeed === 0) return Infinity
    return ((this.length - this.downloaded) / this.downloadSpeed) * 1000
  }
})

Object.defineProperty(Torrent.prototype, 'downloaded', {
  get: function () {
    if (!this.bitfield) return 0
    var downloaded = 0
    for (var index = 0, len = this.pieces.length; index < len; ++index) {
      if (this.bitfield.get(index)) { // verified data
        downloaded += (index === len - 1) ? this.lastPieceLength : this.pieceLength
      } else { // "in progress" data
        var piece = this.pieces[index]
        downloaded += (piece.length - piece.missing)
      }
    }
    return downloaded
  }
})

// TODO: re-enable this. The number of missing pieces. Used to implement 'end game' mode.
// Object.defineProperty(Storage.prototype, 'numMissing', {
//   get: function () {
//     var self = this
//     var numMissing = self.pieces.length
//     for (var index = 0, len = self.pieces.length; index < len; index++) {
//       numMissing -= self.bitfield.get(index)
//     }
//     return numMissing
//   }
// })

Object.defineProperty(Torrent.prototype, 'downloadSpeed', {
  get: function () { return this._downloadSpeed() }
})

Object.defineProperty(Torrent.prototype, 'uploadSpeed', {
  get: function () { return this._uploadSpeed() }
})

Object.defineProperty(Torrent.prototype, 'progress', {
  get: function () { return this.length ? this.downloaded / this.length : 0 }
})

Object.defineProperty(Torrent.prototype, 'ratio', {
  get: function () { return this.uploaded / (this.received || 1) }
})

Object.defineProperty(Torrent.prototype, 'numPeers', {
  get: function () { return this.wires.length }
})

Object.defineProperty(Torrent.prototype, 'torrentFileBlobURL', {
  get: function () {
    if (typeof window === 'undefined') throw new Error('browser-only property')
    if (!this.torrentFile) return null
    return URL.createObjectURL(
      new Blob([ this.torrentFile ], { type: 'application/x-bittorrent' })
    )
  }
})

Object.defineProperty(Torrent.prototype, '_numQueued', {
  get: function () {
    return this._queue.length + (this._peersLength - this._numConns)
  }
})

Object.defineProperty(Torrent.prototype, '_numConns', {
  get: function () {
    var self = this
    var numConns = 0
    for (var id in self._peers) {
      if (self._peers[id].connected) numConns += 1
    }
    return numConns
  }
})

// TODO: remove in v1
Object.defineProperty(Torrent.prototype, 'swarm', {
  get: function () {
    console.warn('WebTorrent: `torrent.swarm` is deprecated. Use `torrent` directly instead.')
    return this
  }
})

Torrent.prototype._onTorrentId = function (torrentId) {
  var self = this
  if (self.destroyed) return

  var parsedTorrent
  try { parsedTorrent = parseTorrent(torrentId) } catch (err) {}
  if (parsedTorrent) {
    // Attempt to set infoHash property synchronously
    self.infoHash = parsedTorrent.infoHash
    self._debugId = parsedTorrent.infoHash.toString('hex').substring(0, 7)
    process.nextTick(function () {
      if (self.destroyed) return
      self._onParsedTorrent(parsedTorrent)
    })
  } else {
    // If torrentId failed to parse, it could be in a form that requires an async
    // operation, i.e. http/https link, filesystem path, or Blob.
    parseTorrent.remote(torrentId, function (err, parsedTorrent) {
      if (self.destroyed) return
      if (err) return self._destroy(err)
      self._onParsedTorrent(parsedTorrent)
    })
  }
}

Torrent.prototype._onParsedTorrent = function (parsedTorrent) {
  var self = this
  if (self.destroyed) return

  self._processParsedTorrent(parsedTorrent)

  if (!self.infoHash) {
    return self._destroy(new Error('Malformed torrent data: No info hash'))
  }

  if (!self.path) self.path = path.join(TMP, self.infoHash)

  self._rechokeIntervalId = setInterval(function () {
    self._rechoke()
  }, RECHOKE_INTERVAL)
  if (self._rechokeIntervalId.unref) self._rechokeIntervalId.unref()

  // Private 'infoHash' event allows client.add to check for duplicate torrents and
  // destroy them before the normal 'infoHash' event is emitted. Prevents user
  // applications from needing to deal with duplicate 'infoHash' events.
  self.emit('_infoHash', self.infoHash)
  if (self.destroyed) return

  self.emit('infoHash', self.infoHash)
  if (self.destroyed) return // user might destroy torrent in event handler

  if (self.client.listening) {
    self._onListening()
  } else {
    self.client.once('listening', function () {
      self._onListening()
    })
  }
}

Torrent.prototype._processParsedTorrent = function (parsedTorrent) {
  this._debugId = parsedTorrent.infoHash.toString('hex').substring(0, 7)

  if (this.announce) {
    // Allow specifying trackers via `opts` parameter
    parsedTorrent.announce = parsedTorrent.announce.concat(this.announce)
  }

  if (this.client.tracker && global.WEBTORRENT_ANNOUNCE && !this.private) {
    // So `webtorrent-hybrid` can force specific trackers to be used
    parsedTorrent.announce = parsedTorrent.announce.concat(global.WEBTORRENT_ANNOUNCE)
  }

  if (this.urlList) {
    // Allow specifying web seeds via `opts` parameter
    parsedTorrent.urlList = parsedTorrent.urlList.concat(this.urlList)
  }

  uniq(parsedTorrent.announce)
  uniq(parsedTorrent.urlList)

  extendMutable(this, parsedTorrent)

  this.magnetURI = parseTorrent.toMagnetURI(parsedTorrent)
  this.torrentFile = parseTorrent.toTorrentFile(parsedTorrent)
}

Torrent.prototype._onListening = function () {
  var self = this
  if (self.discovery || self.destroyed) return

  var trackerOpts = self.client.tracker
  if (trackerOpts) {
    trackerOpts = extend(self.client.tracker, {
      getAnnounceOpts: function () {
        var opts = {
          uploaded: self.uploaded,
          downloaded: self.downloaded,
          left: Math.max(self.length - self.downloaded, 0)
        }
        if (self.client.tracker.getAnnounceOpts) {
          extendMutable(opts, self.client.tracker.getAnnounceOpts())
        }
        if (self._getAnnounceOpts) {
          // TODO: consider deprecating this, as it's redundant with the former case
          extendMutable(opts, self._getAnnounceOpts())
        }
        return opts
      }
    })
  }

  // begin discovering peers via DHT and trackers
  self.discovery = new Discovery({
    infoHash: self.infoHash,
    announce: self.announce,
    peerId: self.client.peerId,
    dht: !self.private && self.client.dht,
    tracker: trackerOpts,
    port: self.client.torrentPort,
    userAgent: USER_AGENT
  })

  self.discovery.on('error', onError)
  self.discovery.on('peer', onPeer)
  self.discovery.on('trackerAnnounce', onTrackerAnnounce)
  self.discovery.on('dhtAnnounce', onDHTAnnounce)
  self.discovery.on('warning', onWarning)

  function onError (err) {
    self._destroy(err)
  }

  function onPeer (peer) {
    // Don't create new outgoing TCP connections when torrent is done
    if (typeof peer === 'string' && self.done) return
    self.addPeer(peer)
  }

  function onTrackerAnnounce () {
    self.emit('trackerAnnounce')
    if (self.numPeers === 0) self.emit('noPeers', 'tracker')
  }

  function onDHTAnnounce () {
    self.emit('dhtAnnounce')
    if (self.numPeers === 0) self.emit('noPeers', 'dht')
  }

  function onWarning (err) {
    self.emit('warning', err)
  }

  if (self.info) {
    // if full metadata was included in initial torrent id, use it immediately. Otherwise,
    // wait for torrent-discovery to find peers and ut_metadata to get the metadata.
    self._onMetadata(self)
  } else if (self.xs) {
    self._getMetadataFromServer()
  }
}

Torrent.prototype._getMetadataFromServer = function () {
  var self = this
  var urls = Array.isArray(self.xs) ? self.xs : [ self.xs ]

  var tasks = urls.map(function (url) {
    return function (cb) {
      getMetadataFromURL(url, cb)
    }
  })
  parallel(tasks)

  function getMetadataFromURL (url, cb) {
    if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
      self.emit('warning', new Error('skipping non-http xs param: ' + url))
      return cb(null)
    }

    var opts = {
      url: url,
      method: 'GET',
      headers: {
        'user-agent': USER_AGENT
      }
    }
    var req
    try {
      req = get.concat(opts, onResponse)
    } catch (err) {
      self.emit('warning', new Error('skipping invalid url xs param: ' + url))
      return cb(null)
    }

    self._xsRequests.push(req)

    function onResponse (err, res, torrent) {
      if (self.destroyed) return cb(null)
      if (self.metadata) return cb(null)

      if (err) {
        self.emit('warning', new Error('http error from xs param: ' + url))
        return cb(null)
      }
      if (res.statusCode !== 200) {
        self.emit('warning', new Error('non-200 status code ' + res.statusCode + ' from xs param: ' + url))
        return cb(null)
      }

      var parsedTorrent
      try {
        parsedTorrent = parseTorrent(torrent)
      } catch (err) {}

      if (!parsedTorrent) {
        self.emit('warning', new Error('got invalid torrent file from xs param: ' + url))
        return cb(null)
      }

      if (parsedTorrent.infoHash !== self.infoHash) {
        self.emit('warning', new Error('got torrent file with incorrect info hash from xs param: ' + url))
        return cb(null)
      }

      self._onMetadata(parsedTorrent)
      cb(null)
    }
  }
}

/**
 * Called when the full torrent metadata is received.
 */
Torrent.prototype._onMetadata = function (metadata) {
  var self = this
  if (self.metadata || self.destroyed) return
  self._debug('got metadata')

  self._xsRequests.forEach(function (req) {
    req.abort()
  })
  self._xsRequests = []

  var parsedTorrent
  if (metadata && metadata.infoHash) {
    // `metadata` is a parsed torrent (from parse-torrent module)
    parsedTorrent = metadata
  } else {
    try {
      parsedTorrent = parseTorrent(metadata)
    } catch (err) {
      return self._destroy(err)
    }
  }

  self._processParsedTorrent(parsedTorrent)
  self.metadata = self.torrentFile

  // add web seed urls (BEP19)
  if (self.client.enableWebSeeds) {
    self.urlList.forEach(function (url) {
      self.addWebSeed(url)
    })
  }

  // start off selecting the entire torrent with low priority
  if (self.pieces.length !== 0) {
    self.select(0, self.pieces.length - 1, false)
  }

  self._rarityMap = new RarityMap(self)

  self.store = new ImmediateChunkStore(
    new self._store(self.pieceLength, {
      torrent: {
        infoHash: self.infoHash
      },
      files: self.files.map(function (file) {
        return {
          path: path.join(self.path, file.path),
          length: file.length,
          offset: file.offset
        }
      }),
      length: self.length
    })
  )

  self.files = self.files.map(function (file) {
    return new File(self, file)
  })

  self._hashes = self.pieces

  self.pieces = self.pieces.map(function (hash, i) {
    var pieceLength = (i === self.pieces.length - 1)
      ? self.lastPieceLength
      : self.pieceLength
    return new Piece(pieceLength)
  })

  self._reservations = self.pieces.map(function () {
    return []
  })

  self.bitfield = new BitField(self.pieces.length)

  self.wires.forEach(function (wire) {
    // If we didn't have the metadata at the time ut_metadata was initialized for this
    // wire, we still want to make it available to the peer in case they request it.
    if (wire.ut_metadata) wire.ut_metadata.setMetadata(self.metadata)

    self._onWireWithMetadata(wire)
  })

  self._debug('verifying existing torrent data')
  if (self._fileModtimes && self._store === FSChunkStore) {
    // don't verify if the files haven't been modified since we last checked
    self.getFileModtimes(function (err, fileModtimes) {
      if (err) return self._destroy(err)

      var unchanged = self.files.map(function (_, index) {
        return fileModtimes[index] === self._fileModtimes[index]
      }).every(function (x) {
        return x
      })

      if (unchanged) {
        for (var index = 0; index < self.pieces.length; index++) {
          self._markVerified(index)
        }
        self._onStore()
      } else {
        self._verifyPieces()
      }
    })
  } else {
    self._verifyPieces()
  }

  self.emit('metadata')
}

/*
 * TODO: remove this
 * Gets the last modified time of every file on disk for this torrent.
 * Only valid in Node, not in the browser.
 */
Torrent.prototype.getFileModtimes = function (cb) {
  var self = this
  var ret = []
  parallelLimit(self.files.map(function (file, index) {
    return function (cb) {
      fs.stat(path.join(self.path, file.path), function (err, stat) {
        if (err && err.code !== 'ENOENT') return cb(err)
        ret[index] = stat && stat.mtime.getTime()
        cb(null)
      })
    }
  }), FILESYSTEM_CONCURRENCY, function (err) {
    self._debug('done getting file modtimes')
    cb(err, ret)
  })
}

Torrent.prototype._verifyPieces = function () {
  var self = this
  parallelLimit(self.pieces.map(function (_, index) {
    return function (cb) {
      if (self.destroyed) return cb(new Error('torrent is destroyed'))

      self.store.get(index, function (err, buf) {
        if (self.destroyed) return cb(new Error('torrent is destroyed'))

        if (err) return process.nextTick(cb, null) // ignore error
        sha1(buf, function (hash) {
          if (self.destroyed) return cb(new Error('torrent is destroyed'))

          if (hash === self._hashes[index]) {
            if (!self.pieces[index]) return
            self._debug('piece verified %s', index)
            self._markVerified(index)
          } else {
            self._debug('piece invalid %s', index)
          }
          cb(null)
        })
      })
    }
  }), FILESYSTEM_CONCURRENCY, function (err) {
    if (err) return self._destroy(err)
    self._debug('done verifying')
    self._onStore()
  })
}

Torrent.prototype._markVerified = function (index) {
  this.pieces[index] = null
  this._reservations[index] = null
  this.bitfield.set(index, true)
}

/**
 * Called when the metadata, listening server, and underlying chunk store is initialized.
 */
Torrent.prototype._onStore = function () {
  var self = this
  if (self.destroyed) return
  self._debug('on store')

  self.ready = true
  self.emit('ready')

  // Files may start out done if the file was already in the store
  self._checkDone()

  // In case any selections were made before torrent was ready
  self._updateSelections()
}

Torrent.prototype.destroy = function (cb) {
  var self = this
  self._destroy(null, cb)
}

Torrent.prototype._destroy = function (err, cb) {
  var self = this
  if (self.destroyed) return
  self.destroyed = true
  self._debug('destroy')

  self.client._remove(self)

  clearInterval(self._rechokeIntervalId)

  self._xsRequests.forEach(function (req) {
    req.abort()
  })

  if (self._rarityMap) {
    self._rarityMap.destroy()
  }

  for (var id in self._peers) {
    self.removePeer(id)
  }

  self.files.forEach(function (file) {
    if (file instanceof File) file._destroy()
  })

  var tasks = self._servers.map(function (server) {
    return function (cb) {
      server.destroy(cb)
    }
  })

  if (self.discovery) {
    tasks.push(function (cb) {
      self.discovery.destroy(cb)
    })
  }

  if (self.store) {
    tasks.push(function (cb) {
      self.store.close(cb)
    })
  }

  parallel(tasks, cb)

  if (err) {
    // Torrent errors are emitted at `torrent.on('error')`. If there are no 'error'
    // event handlers on the torrent instance, then the error will be emitted at
    // `client.on('error')`. This prevents throwing an uncaught exception
    // (unhandled 'error' event), but it makes it impossible to distinguish client
    // errors versus torrent errors. Torrent errors are not fatal, and the client
    // is still usable afterwards. Therefore, always listen for errors in both
    // places (`client.on('error')` and `torrent.on('error')`).
    if (self.listenerCount('error') === 0) {
      self.client.emit('error', err)
    } else {
      self.emit('error', err)
    }
  }

  self.emit('close')

  self.client = null
  self.files = []
  self.discovery = null
  self.store = null
  self._rarityMap = null
  self._peers = null
  self._servers = null
  self._xsRequests = null
}

Torrent.prototype.addPeer = function (peer) {
  var self = this
  if (self.destroyed) throw new Error('torrent is destroyed')
  if (!self.infoHash) throw new Error('addPeer() must not be called before the `infoHash` event')

  if (self.client.blocked) {
    var host
    if (typeof peer === 'string') {
      var parts
      try {
        parts = addrToIPPort(peer)
      } catch (e) {
        self._debug('ignoring peer: invalid %s', peer)
        self.emit('invalidPeer', peer)
        return false
      }
      host = parts[0]
    } else if (typeof peer.remoteAddress === 'string') {
      host = peer.remoteAddress
    }

    if (host && self.client.blocked.contains(host)) {
      self._debug('ignoring peer: blocked %s', peer)
      if (typeof peer !== 'string') peer.destroy()
      self.emit('blockedPeer', peer)
      return false
    }
  }

  var wasAdded = !!self._addPeer(peer)
  if (wasAdded) {
    self.emit('peer', peer)
  } else {
    self.emit('invalidPeer', peer)
  }
  return wasAdded
}

Torrent.prototype._addPeer = function (peer) {
  var self = this
  if (self.destroyed) {
    if (typeof peer !== 'string') peer.destroy()
    return null
  }
  if (typeof peer === 'string' && !self._validAddr(peer)) {
    self._debug('ignoring peer: invalid %s', peer)
    return null
  }

  var id = (peer && peer.id) || peer
  if (self._peers[id]) {
    self._debug('ignoring peer: duplicate (%s)', id)
    if (typeof peer !== 'string') peer.destroy()
    return null
  }

  if (self.paused) {
    self._debug('ignoring peer: torrent is paused')
    if (typeof peer !== 'string') peer.destroy()
    return null
  }

  self._debug('add peer %s', id)

  var newPeer
  if (typeof peer === 'string') {
    // `peer` is an addr ("ip:port" string)
    newPeer = Peer.createTCPOutgoingPeer(peer, self)
  } else {
    // `peer` is a WebRTC connection (simple-peer)
    newPeer = Peer.createWebRTCPeer(peer, self)
  }

  self._peers[newPeer.id] = newPeer
  self._peersLength += 1

  if (typeof peer === 'string') {
    // `peer` is an addr ("ip:port" string)
    self._queue.push(newPeer)
    self._drain()
  }

  return newPeer
}

Torrent.prototype.addWebSeed = function (url) {
  if (this.destroyed) throw new Error('torrent is destroyed')

  if (!/^https?:\/\/.+/.test(url)) {
    this.emit('warning', new Error('ignoring invalid web seed: ' + url))
    this.emit('invalidPeer', url)
    return
  }

  if (this._peers[url]) {
    this.emit('warning', new Error('ignoring duplicate web seed: ' + url))
    this.emit('invalidPeer', url)
    return
  }

  this._debug('add web seed %s', url)

  var newPeer = Peer.createWebSeedPeer(url, this)
  this._peers[newPeer.id] = newPeer
  this._peersLength += 1

  this.emit('peer', url)
}

/**
 * Called whenever a new incoming TCP peer connects to this torrent swarm. Called with a
 * peer that has already sent a handshake.
 */
Torrent.prototype._addIncomingPeer = function (peer) {
  var self = this
  if (self.destroyed) return peer.destroy(new Error('torrent is destroyed'))
  if (self.paused) return peer.destroy(new Error('torrent is paused'))

  this._debug('add incoming peer %s', peer.id)

  self._peers[peer.id] = peer
  self._peersLength += 1
}

Torrent.prototype.removePeer = function (peer) {
  var self = this
  var id = (peer && peer.id) || peer
  peer = self._peers[id]

  if (!peer) return

  this._debug('removePeer %s', id)

  delete self._peers[id]
  self._peersLength -= 1

  peer.destroy()

  // If torrent swarm was at capacity before, try to open a new connection now
  self._drain()
}

Torrent.prototype.select = function (start, end, priority, notify) {
  var self = this
  if (self.destroyed) throw new Error('torrent is destroyed')

  if (start < 0 || end < start || self.pieces.length <= end) {
    throw new Error('invalid selection ', start, ':', end)
  }
  priority = Number(priority) || 0

  self._debug('select %s-%s (priority %s)', start, end, priority)

  self._selections.push({
    from: start,
    to: end,
    offset: 0,
    priority: priority,
    notify: notify || noop
  })

  self._selections.sort(function (a, b) {
    return b.priority - a.priority
  })

  self._updateSelections()
}

Torrent.prototype.deselect = function (start, end, priority) {
  var self = this
  if (self.destroyed) throw new Error('torrent is destroyed')

  priority = Number(priority) || 0
  self._debug('deselect %s-%s (priority %s)', start, end, priority)

  for (var i = 0; i < self._selections.length; ++i) {
    var s = self._selections[i]
    if (s.from === start && s.to === end && s.priority === priority) {
      self._selections.splice(i, 1)
      break
    }
  }

  self._updateSelections()
}

Torrent.prototype.critical = function (start, end) {
  var self = this
  if (self.destroyed) throw new Error('torrent is destroyed')

  self._debug('critical %s-%s', start, end)

  for (var i = start; i <= end; ++i) {
    self._critical[i] = true
  }

  self._updateSelections()
}

Torrent.prototype._onWire = function (wire, addr) {
  var self = this
  self._debug('got wire %s (%s)', wire._debugId, addr || 'Unknown')

  wire.on('download', function (downloaded) {
    if (self.destroyed) return
    self.received += downloaded
    self._downloadSpeed(downloaded)
    self.client._downloadSpeed(downloaded)
    self.emit('download', downloaded)
    self.client.emit('download', downloaded)
  })

  wire.on('upload', function (uploaded) {
    if (self.destroyed) return
    self.uploaded += uploaded
    self._uploadSpeed(uploaded)
    self.client._uploadSpeed(uploaded)
    self.emit('upload', uploaded)
    self.client.emit('upload', uploaded)
  })

  self.wires.push(wire)

  if (addr) {
    // Sometimes RTCPeerConnection.getStats() doesn't return an ip:port for peers
    var parts = addrToIPPort(addr)
    wire.remoteAddress = parts[0]
    wire.remotePort = parts[1]
  }

  // When peer sends PORT message, add that DHT node to routing table
  if (self.client.dht && self.client.dht.listening) {
    wire.on('port', function (port) {
      if (self.destroyed || self.client.dht.destroyed) {
        return
      }
      if (!wire.remoteAddress) {
        return self._debug('ignoring PORT from peer with no address')
      }
      if (port === 0 || port > 65536) {
        return self._debug('ignoring invalid PORT from peer')
      }

      self._debug('port: %s (from %s)', port, addr)
      self.client.dht.addNode({ host: wire.remoteAddress, port: port })
    })
  }

  wire.on('timeout', function () {
    self._debug('wire timeout (%s)', addr)
    // TODO: this might be destroying wires too eagerly
    wire.destroy()
  })

  // Timeout for piece requests to this peer
  wire.setTimeout(PIECE_TIMEOUT, true)

  // Send KEEP-ALIVE (every 60s) so peers will not disconnect the wire
  wire.setKeepAlive(true)

  // use ut_metadata extension
  wire.use(utMetadata(self.metadata))

  wire.ut_metadata.on('warning', function (err) {
    self._debug('ut_metadata warning: %s', err.message)
  })

  if (!self.metadata) {
    wire.ut_metadata.on('metadata', function (metadata) {
      self._debug('got metadata via ut_metadata')
      self._onMetadata(metadata)
    })
    wire.ut_metadata.fetch()
  }

  // use ut_pex extension if the torrent is not flagged as private
  if (typeof utPex === 'function' && !self.private) {
    wire.use(utPex())

    wire.ut_pex.on('peer', function (peer) {
      // Only add potential new peers when we're not seeding
      if (self.done) return
      self._debug('ut_pex: got peer: %s (from %s)', peer, addr)
      self.addPeer(peer)
    })

    wire.ut_pex.on('dropped', function (peer) {
      // the remote peer believes a given peer has been dropped from the torrent swarm.
      // if we're not currently connected to it, then remove it from the queue.
      var peerObj = self._peers[peer]
      if (peerObj && !peerObj.connected) {
        self._debug('ut_pex: dropped peer: %s (from %s)', peer, addr)
        self.removePeer(peer)
      }
    })

    wire.once('close', function () {
      // Stop sending updates to remote peer
      wire.ut_pex.reset()
    })
  }

  // Hook to allow user-defined `bittorrent-protocol` extensions
  // More info: https://github.com/webtorrent/bittorrent-protocol#extension-api
  self.emit('wire', wire, addr)

  if (self.metadata) {
    process.nextTick(function () {
      // This allows wire.handshake() to be called (by Peer.onHandshake) before any
      // messages get sent on the wire
      self._onWireWithMetadata(wire)
    })
  }
}

Torrent.prototype._onWireWithMetadata = function (wire) {
  var self = this
  var timeoutId = null

  function onChokeTimeout () {
    if (self.destroyed || wire.destroyed) return

    if (self._numQueued > 2 * (self._numConns - self.numPeers) &&
      wire.amInterested) {
      wire.destroy()
    } else {
      timeoutId = setTimeout(onChokeTimeout, CHOKE_TIMEOUT)
      if (timeoutId.unref) timeoutId.unref()
    }
  }

  var i
  function updateSeedStatus () {
    if (wire.peerPieces.buffer.length !== self.bitfield.buffer.length) return
    for (i = 0; i < self.pieces.length; ++i) {
      if (!wire.peerPieces.get(i)) return
    }
    wire.isSeeder = true
    wire.choke() // always choke seeders
  }

  wire.on('bitfield', function () {
    updateSeedStatus()
    self._update()
  })

  wire.on('have', function () {
    updateSeedStatus()
    self._update()
  })

  wire.once('interested', function () {
    wire.unchoke()
  })

  wire.once('close', function () {
    clearTimeout(timeoutId)
  })

  wire.on('choke', function () {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(onChokeTimeout, CHOKE_TIMEOUT)
    if (timeoutId.unref) timeoutId.unref()
  })

  wire.on('unchoke', function () {
    clearTimeout(timeoutId)
    self._update()
  })

  wire.on('request', function (index, offset, length, cb) {
    if (length > MAX_BLOCK_LENGTH) {
      // Per spec, disconnect from peers that request >128KB
      return wire.destroy()
    }
    if (self.pieces[index]) return
    self.store.get(index, { offset: offset, length: length }, cb)
  })

  wire.bitfield(self.bitfield) // always send bitfield (required)
  wire.interested() // always start out interested

  // Send PORT message to peers that support DHT
  if (wire.peerExtensions.dht && self.client.dht && self.client.dht.listening) {
    wire.port(self.client.dht.address().port)
  }

  if (wire.type !== 'webSeed') { // do not choke on webseeds
    timeoutId = setTimeout(onChokeTimeout, CHOKE_TIMEOUT)
    if (timeoutId.unref) timeoutId.unref()
  }

  wire.isSeeder = false
  updateSeedStatus()
}

/**
 * Called on selection changes.
 */
Torrent.prototype._updateSelections = function () {
  var self = this
  if (!self.ready || self.destroyed) return

  process.nextTick(function () {
    self._gcSelections()
  })
  self._updateInterest()
  self._update()
}

/**
 * Garbage collect selections with respect to the store's current state.
 */
Torrent.prototype._gcSelections = function () {
  var self = this

  for (var i = 0; i < self._selections.length; ++i) {
    var s = self._selections[i]
    var oldOffset = s.offset

    // check for newly downloaded pieces in selection
    while (self.bitfield.get(s.from + s.offset) && s.from + s.offset < s.to) {
      s.offset += 1
    }

    if (oldOffset !== s.offset) s.notify()
    if (s.to !== s.from + s.offset) continue
    if (!self.bitfield.get(s.from + s.offset)) continue

    self._selections.splice(i, 1) // remove fully downloaded selection
    i -= 1 // decrement i to offset splice

    s.notify()
    self._updateInterest()
  }

  if (!self._selections.length) self.emit('idle')
}

/**
 * Update interested status for all peers.
 */
Torrent.prototype._updateInterest = function () {
  var self = this

  var prev = self._amInterested
  self._amInterested = !!self._selections.length

  self.wires.forEach(function (wire) {
    // TODO: only call wire.interested if the wire has at least one piece we need
    if (self._amInterested) wire.interested()
    else wire.uninterested()
  })

  if (prev === self._amInterested) return
  if (self._amInterested) self.emit('interested')
  else self.emit('uninterested')
}

/**
 * Heartbeat to update all peers and their requests.
 */
Torrent.prototype._update = function () {
  var self = this
  if (self.destroyed) return

  // update wires in random order for better request distribution
  var ite = randomIterate(self.wires)
  var wire
  while ((wire = ite())) {
    self._updateWire(wire)
  }
}

/**
 * Attempts to update a peer's requests
 */
Torrent.prototype._updateWire = function (wire) {
  var self = this

  if (wire.peerChoking) return
  if (!wire.downloaded) return validateWire()

  var minOutstandingRequests = getBlockPipelineLength(wire, PIPELINE_MIN_DURATION)
  if (wire.requests.length >= minOutstandingRequests) return
  var maxOutstandingRequests = getBlockPipelineLength(wire, PIPELINE_MAX_DURATION)

  trySelectWire(false) || trySelectWire(true)

  function genPieceFilterFunc (start, end, tried, rank) {
    return function (i) {
      return i >= start && i <= end && !(i in tried) && wire.peerPieces.get(i) && (!rank || rank(i))
    }
  }

  // TODO: Do we need both validateWire and trySelectWire?
  function validateWire () {
    if (wire.requests.length) return

    var i = self._selections.length
    while (i--) {
      var next = self._selections[i]
      var piece
      if (self.strategy === 'rarest') {
        var start = next.from + next.offset
        var end = next.to
        var len = end - start + 1
        var tried = {}
        var tries = 0
        var filter = genPieceFilterFunc(start, end, tried)

        while (tries < len) {
          piece = self._rarityMap.getRarestPiece(filter)
          if (piece < 0) break
          if (self._request(wire, piece, false)) return
          tried[piece] = true
          tries += 1
        }
      } else {
        for (piece = next.to; piece >= next.from + next.offset; --piece) {
          if (!wire.peerPieces.get(piece)) continue
          if (self._request(wire, piece, false)) return
        }
      }
    }

    // TODO: wire failed to validate as useful; should we close it?
    // probably not, since 'have' and 'bitfield' messages might be coming
  }

  function speedRanker () {
    var speed = wire.downloadSpeed() || 1
    if (speed > SPEED_THRESHOLD) return function () { return true }

    var secs = Math.max(1, wire.requests.length) * Piece.BLOCK_LENGTH / speed
    var tries = 10
    var ptr = 0

    return function (index) {
      if (!tries || self.bitfield.get(index)) return true

      var missing = self.pieces[index].missing

      for (; ptr < self.wires.length; ptr++) {
        var otherWire = self.wires[ptr]
        var otherSpeed = otherWire.downloadSpeed()

        if (otherSpeed < SPEED_THRESHOLD) continue
        if (otherSpeed <= speed) continue
        if (!otherWire.peerPieces.get(index)) continue
        if ((missing -= otherSpeed * secs) > 0) continue

        tries--
        return false
      }

      return true
    }
  }

  function shufflePriority (i) {
    var last = i
    for (var j = i; j < self._selections.length && self._selections[j].priority; j++) {
      last = j
    }
    var tmp = self._selections[i]
    self._selections[i] = self._selections[last]
    self._selections[last] = tmp
  }

  function trySelectWire (hotswap) {
    if (wire.requests.length >= maxOutstandingRequests) return true
    var rank = speedRanker()

    for (var i = 0; i < self._selections.length; i++) {
      var next = self._selections[i]

      var piece
      if (self.strategy === 'rarest') {
        var start = next.from + next.offset
        var end = next.to
        var len = end - start + 1
        var tried = {}
        var tries = 0
        var filter = genPieceFilterFunc(start, end, tried, rank)

        while (tries < len) {
          piece = self._rarityMap.getRarestPiece(filter)
          if (piece < 0) break

          // request all non-reserved blocks in this piece
          while (self._request(wire, piece, self._critical[piece] || hotswap)) {}

          if (wire.requests.length < maxOutstandingRequests) {
            tried[piece] = true
            tries++
            continue
          }

          if (next.priority) shufflePriority(i)
          return true
        }
      } else {
        for (piece = next.from + next.offset; piece <= next.to; piece++) {
          if (!wire.peerPieces.get(piece) || !rank(piece)) continue

          // request all non-reserved blocks in piece
          while (self._request(wire, piece, self._critical[piece] || hotswap)) {}

          if (wire.requests.length < maxOutstandingRequests) continue

          if (next.priority) shufflePriority(i)
          return true
        }
      }
    }

    return false
  }
}

/**
 * Called periodically to update the choked status of all peers, handling optimistic
 * unchoking as described in BEP3.
 */
Torrent.prototype._rechoke = function () {
  var self = this
  if (!self.ready) return

  if (self._rechokeOptimisticTime > 0) self._rechokeOptimisticTime -= 1
  else self._rechokeOptimisticWire = null

  var peers = []

  self.wires.forEach(function (wire) {
    if (!wire.isSeeder && wire !== self._rechokeOptimisticWire) {
      peers.push({
        wire: wire,
        downloadSpeed: wire.downloadSpeed(),
        uploadSpeed: wire.uploadSpeed(),
        salt: Math.random(),
        isChoked: true
      })
    }
  })

  peers.sort(rechokeSort)

  var unchokeInterested = 0
  var i = 0
  for (; i < peers.length && unchokeInterested < self._rechokeNumSlots; ++i) {
    peers[i].isChoked = false
    if (peers[i].wire.peerInterested) unchokeInterested += 1
  }

  // Optimistically unchoke a peer
  if (!self._rechokeOptimisticWire && i < peers.length && self._rechokeNumSlots) {
    var candidates = peers.slice(i).filter(function (peer) { return peer.wire.peerInterested })
    var optimistic = candidates[randomInt(candidates.length)]

    if (optimistic) {
      optimistic.isChoked = false
      self._rechokeOptimisticWire = optimistic.wire
      self._rechokeOptimisticTime = RECHOKE_OPTIMISTIC_DURATION
    }
  }

  // Unchoke best peers
  peers.forEach(function (peer) {
    if (peer.wire.amChoking !== peer.isChoked) {
      if (peer.isChoked) peer.wire.choke()
      else peer.wire.unchoke()
    }
  })

  function rechokeSort (peerA, peerB) {
    // Prefer higher download speed
    if (peerA.downloadSpeed !== peerB.downloadSpeed) {
      return peerB.downloadSpeed - peerA.downloadSpeed
    }

    // Prefer higher upload speed
    if (peerA.uploadSpeed !== peerB.uploadSpeed) {
      return peerB.uploadSpeed - peerA.uploadSpeed
    }

    // Prefer unchoked
    if (peerA.wire.amChoking !== peerB.wire.amChoking) {
      return peerA.wire.amChoking ? 1 : -1
    }

    // Random order
    return peerA.salt - peerB.salt
  }
}

/**
 * Attempts to cancel a slow block request from another wire such that the
 * given wire may effectively swap out the request for one of its own.
 */
Torrent.prototype._hotswap = function (wire, index) {
  var self = this

  var speed = wire.downloadSpeed()
  if (speed < Piece.BLOCK_LENGTH) return false
  if (!self._reservations[index]) return false

  var r = self._reservations[index]
  if (!r) {
    return false
  }

  var minSpeed = Infinity
  var minWire

  var i
  for (i = 0; i < r.length; i++) {
    var otherWire = r[i]
    if (!otherWire || otherWire === wire) continue

    var otherSpeed = otherWire.downloadSpeed()
    if (otherSpeed >= SPEED_THRESHOLD) continue
    if (2 * otherSpeed > speed || otherSpeed > minSpeed) continue

    minWire = otherWire
    minSpeed = otherSpeed
  }

  if (!minWire) return false

  for (i = 0; i < r.length; i++) {
    if (r[i] === minWire) r[i] = null
  }

  for (i = 0; i < minWire.requests.length; i++) {
    var req = minWire.requests[i]
    if (req.piece !== index) continue

    self.pieces[index].cancel((req.offset / Piece.BLOCK_LENGTH) | 0)
  }

  self.emit('hotswap', minWire, wire, index)
  return true
}

/**
 * Attempts to request a block from the given wire.
 */
Torrent.prototype._request = function (wire, index, hotswap) {
  var self = this
  var numRequests = wire.requests.length
  var isWebSeed = wire.type === 'webSeed'

  if (self.bitfield.get(index)) return false

  var maxOutstandingRequests = isWebSeed
    ? Math.min(
        getPiecePipelineLength(wire, PIPELINE_MAX_DURATION, self.pieceLength),
        self.maxWebConns
      )
    : getBlockPipelineLength(wire, PIPELINE_MAX_DURATION)

  if (numRequests >= maxOutstandingRequests) return false
  // var endGame = (wire.requests.length === 0 && self.store.numMissing < 30)

  var piece = self.pieces[index]
  var reservation = isWebSeed ? piece.reserveRemaining() : piece.reserve()

  if (reservation === -1 && hotswap && self._hotswap(wire, index)) {
    reservation = isWebSeed ? piece.reserveRemaining() : piece.reserve()
  }
  if (reservation === -1) return false

  var r = self._reservations[index]
  if (!r) r = self._reservations[index] = []
  var i = r.indexOf(null)
  if (i === -1) i = r.length
  r[i] = wire

  var chunkOffset = piece.chunkOffset(reservation)
  var chunkLength = isWebSeed ? piece.chunkLengthRemaining(reservation) : piece.chunkLength(reservation)

  wire.request(index, chunkOffset, chunkLength, function onChunk (err, chunk) {
    if (self.destroyed) return

    // TODO: what is this for?
    if (!self.ready) return self.once('ready', function () { onChunk(err, chunk) })

    if (r[i] === wire) r[i] = null

    if (piece !== self.pieces[index]) return onUpdateTick()

    if (err) {
      self._debug(
        'error getting piece %s (offset: %s length: %s) from %s: %s',
        index, chunkOffset, chunkLength, wire.remoteAddress + ':' + wire.remotePort,
        err.message
      )
      isWebSeed ? piece.cancelRemaining(reservation) : piece.cancel(reservation)
      onUpdateTick()
      return
    }

    self._debug(
      'got piece %s (offset: %s length: %s) from %s',
      index, chunkOffset, chunkLength, wire.remoteAddress + ':' + wire.remotePort
    )

    if (!piece.set(reservation, chunk, wire)) return onUpdateTick()

    var buf = piece.flush()

    // TODO: might need to set self.pieces[index] = null here since sha1 is async

    sha1(buf, function (hash) {
      if (self.destroyed) return

      if (hash === self._hashes[index]) {
        if (!self.pieces[index]) return
        self._debug('piece verified %s', index)

        self.pieces[index] = null
        self._reservations[index] = null
        self.bitfield.set(index, true)

        self.store.put(index, buf)

        self.wires.forEach(function (wire) {
          wire.have(index)
        })

        // We also check `self.destroyed` since `torrent.destroy()` could have been
        // called in the `torrent.on('done')` handler, triggered by `_checkDone()`.
        if (self._checkDone() && !self.destroyed) self.discovery.complete()
      } else {
        self.pieces[index] = new Piece(piece.length)
        self.emit('warning', new Error('Piece ' + index + ' failed verification'))
      }
      onUpdateTick()
    })
  })

  function onUpdateTick () {
    process.nextTick(function () { self._update() })
  }

  return true
}

Torrent.prototype._checkDone = function () {
  var self = this
  if (self.destroyed) return

  // are any new files done?
  self.files.forEach(function (file) {
    if (file.done) return
    for (var i = file._startPiece; i <= file._endPiece; ++i) {
      if (!self.bitfield.get(i)) return
    }
    file.done = true
    file.emit('done')
    self._debug('file done: ' + file.name)
  })

  // is the torrent done? (if all current selections are satisfied, or there are
  // no selections, then torrent is done)
  var done = true
  for (var i = 0; i < self._selections.length; i++) {
    var selection = self._selections[i]
    for (var piece = selection.from; piece <= selection.to; piece++) {
      if (!self.bitfield.get(piece)) {
        done = false
        break
      }
    }
    if (!done) break
  }
  if (!self.done && done) {
    self.done = true
    self._debug('torrent done: ' + self.infoHash)
    self.emit('done')
  }
  self._gcSelections()

  return done
}

Torrent.prototype.load = function (streams, cb) {
  var self = this
  if (self.destroyed) throw new Error('torrent is destroyed')
  if (!self.ready) return self.once('ready', function () { self.load(streams, cb) })

  if (!Array.isArray(streams)) streams = [ streams ]
  if (!cb) cb = noop

  var readable = new MultiStream(streams)
  var writable = new ChunkStoreWriteStream(self.store, self.pieceLength)

  pump(readable, writable, function (err) {
    if (err) return cb(err)
    self.pieces.forEach(function (piece, index) {
      self.pieces[index] = null
      self._reservations[index] = null
      self.bitfield.set(index, true)
    })
    self._checkDone()
    cb(null)
  })
}

Torrent.prototype.createServer = function (requestListener) {
  if (typeof Server !== 'function') throw new Error('node.js-only method')
  if (this.destroyed) throw new Error('torrent is destroyed')
  var server = new Server(this, requestListener)
  this._servers.push(server)
  return server
}

Torrent.prototype.pause = function () {
  if (this.destroyed) return
  this._debug('pause')
  this.paused = true
}

Torrent.prototype.resume = function () {
  if (this.destroyed) return
  this._debug('resume')
  this.paused = false
  this._drain()
}

Torrent.prototype._debug = function () {
  if (this.destroyed) return
  var args = [].slice.call(arguments)
  args[0] = '[' + this.client._debugId + '] [' + this._debugId + '] ' + args[0]
  debug.apply(null, args)
}

/**
 * Pop a peer off the FIFO queue and connect to it. When _drain() gets called,
 * the queue will usually have only one peer in it, except when there are too
 * many peers (over `this.maxConns`) in which case they will just sit in the
 * queue until another connection closes.
 */
Torrent.prototype._drain = function () {
  var self = this
  this._debug('_drain numConns %s maxConns %s', self._numConns, self.client.maxConns)
  if (typeof net.connect !== 'function' || self.destroyed || self.paused ||
      self._numConns >= self.client.maxConns) {
    return
  }
  this._debug('drain (%s queued, %s/%s peers)', self._numQueued, self.numPeers, self.client.maxConns)

  var peer = self._queue.shift()
  if (!peer) return // queue could be empty

  this._debug('tcp connect attempt to %s', peer.addr)

  var parts = addrToIPPort(peer.addr)
  var opts = {
    host: parts[0],
    port: parts[1]
  }

  var conn = peer.conn = net.connect(opts)

  conn.once('connect', function () { peer.onConnect() })
  conn.once('error', function (err) { peer.destroy(err) })
  peer.startConnectTimeout()

  // When connection closes, attempt reconnect after timeout (with exponential backoff)
  conn.on('close', function () {
    if (self.destroyed) return

    // TODO: If torrent is done, do not try to reconnect after a timeout

    if (peer.retries >= RECONNECT_WAIT.length) {
      self._debug(
        'conn %s closed: will not re-add (max %s attempts)',
        peer.addr, RECONNECT_WAIT.length
      )
      return
    }

    var ms = RECONNECT_WAIT[peer.retries]
    self._debug(
      'conn %s closed: will re-add to queue in %sms (attempt %s)',
      peer.addr, ms, peer.retries + 1
    )

    var reconnectTimeout = setTimeout(function reconnectTimeout () {
      var newPeer = self._addPeer(peer.addr)
      if (newPeer) newPeer.retries = peer.retries + 1
    }, ms)
    if (reconnectTimeout.unref) reconnectTimeout.unref()
  })
}

/**
 * Returns `true` if string is valid IPv4/6 address.
 * @param {string} addr
 * @return {boolean}
 */
Torrent.prototype._validAddr = function (addr) {
  var parts
  try {
    parts = addrToIPPort(addr)
  } catch (e) {
    return false
  }
  var host = parts[0]
  var port = parts[1]
  return port > 0 && port < 65535 &&
    !(host === '127.0.0.1' && port === this.client.torrentPort)
}

function getBlockPipelineLength (wire, duration) {
  return 2 + Math.ceil(duration * wire.downloadSpeed() / Piece.BLOCK_LENGTH)
}

function getPiecePipelineLength (wire, duration, pieceLength) {
  return 1 + Math.ceil(duration * wire.downloadSpeed() / pieceLength)
}

/**
 * Returns a random integer in [0,high)
 */
function randomInt (high) {
  return Math.random() * high | 0
}

function noop () {}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../package.json":111,"./file":103,"./peer":104,"./rarity-map":105,"./server":118,"_process":130,"addr-to-ip-port":2,"bitfield":7,"chunk-store-stream/write":18,"debug":108,"events":122,"fs":116,"fs-chunk-store":38,"immediate-chunk-store":29,"inherits":30,"multistream":46,"net":118,"os":118,"parse-torrent":50,"path":128,"pump":110,"random-iterate":53,"run-parallel":68,"run-parallel-limit":67,"simple-get":72,"simple-sha1":74,"speedometer":78,"torrent-discovery":90,"torrent-piece":91,"uniq":94,"ut_metadata":96,"ut_pex":118,"xtend":113,"xtend/mutable":114}],107:[function(require,module,exports){
module.exports = WebConn

var BitField = require('bitfield')
var Buffer = require('safe-buffer').Buffer
var debug = require('debug')('webtorrent:webconn')
var get = require('simple-get')
var inherits = require('inherits')
var sha1 = require('simple-sha1')
var Wire = require('bittorrent-protocol')

var VERSION = require('../package.json').version

inherits(WebConn, Wire)

/**
 * Converts requests for torrent blocks into http range requests.
 * @param {string} url web seed url
 * @param {Object} torrent
 */
function WebConn (url, torrent) {
  Wire.call(this)

  this.url = url
  this.webPeerId = sha1.sync(url)
  this._torrent = torrent

  this._init()
}

WebConn.prototype._init = function () {
  var self = this
  self.setKeepAlive(true)

  self.once('handshake', function (infoHash, peerId) {
    if (self.destroyed) return
    self.handshake(infoHash, self.webPeerId)
    var numPieces = self._torrent.pieces.length
    var bitfield = new BitField(numPieces)
    for (var i = 0; i <= numPieces; i++) {
      bitfield.set(i, true)
    }
    self.bitfield(bitfield)
  })

  self.once('interested', function () {
    debug('interested')
    self.unchoke()
  })

  self.on('uninterested', function () { debug('uninterested') })
  self.on('choke', function () { debug('choke') })
  self.on('unchoke', function () { debug('unchoke') })
  self.on('bitfield', function () { debug('bitfield') })

  self.on('request', function (pieceIndex, offset, length, callback) {
    debug('request pieceIndex=%d offset=%d length=%d', pieceIndex, offset, length)
    self.httpRequest(pieceIndex, offset, length, callback)
  })
}

WebConn.prototype.httpRequest = function (pieceIndex, offset, length, cb) {
  var self = this
  var pieceOffset = pieceIndex * self._torrent.pieceLength
  var rangeStart = pieceOffset + offset /* offset within whole torrent */
  var rangeEnd = rangeStart + length - 1

  // Web seed URL format:
  // For single-file torrents, make HTTP range requests directly to the web seed URL
  // For multi-file torrents, add the torrent folder and file name to the URL
  var files = self._torrent.files
  var requests
  if (files.length <= 1) {
    requests = [{
      url: self.url,
      start: rangeStart,
      end: rangeEnd
    }]
  } else {
    var requestedFiles = files.filter(function (file) {
      return file.offset <= rangeEnd && (file.offset + file.length) > rangeStart
    })
    if (requestedFiles.length < 1) {
      return cb(new Error('Could not find file corresponnding to web seed range request'))
    }

    requests = requestedFiles.map(function (requestedFile) {
      var fileEnd = requestedFile.offset + requestedFile.length - 1
      var url = self.url +
        (self.url[self.url.length - 1] === '/' ? '' : '/') +
        requestedFile.path
      return {
        url: url,
        fileOffsetInRange: Math.max(requestedFile.offset - rangeStart, 0),
        start: Math.max(rangeStart - requestedFile.offset, 0),
        end: Math.min(fileEnd, rangeEnd - requestedFile.offset)
      }
    })
  }

  // Now make all the HTTP requests we need in order to load this piece
  // Usually that's one requests, but sometimes it will be multiple
  // Send requests in parallel and wait for them all to come back
  var numRequestsSucceeded = 0
  var hasError = false

  var ret
  if (requests.length > 1) {
    ret = Buffer.alloc(length)
  }

  requests.forEach(function (request) {
    var url = request.url
    var start = request.start
    var end = request.end
    debug(
      'Requesting url=%s pieceIndex=%d offset=%d length=%d start=%d end=%d',
      url, pieceIndex, offset, length, start, end
    )
    var opts = {
      url: url,
      method: 'GET',
      headers: {
        'user-agent': 'WebTorrent/' + VERSION + ' (https://webtorrent.io)',
        range: 'bytes=' + start + '-' + end
      }
    }
    function onResponse (res, data) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        hasError = true
        return cb(new Error('Unexpected HTTP status code ' + res.statusCode))
      }
      debug('Got data of length %d', data.length)

      if (requests.length === 1) {
        // Common case: fetch piece in a single HTTP request, return directly
        cb(null, data)
      } else {
        // Rare case: reconstruct multiple HTTP requests across 2+ files into one
        // piece buffer
        data.copy(ret, request.fileOffsetInRange)
        if (++numRequestsSucceeded === requests.length) {
          cb(null, ret)
        }
      }
    }
    get.concat(opts, function (err, res, data) {
      if (hasError) return
      if (err) {
        // Browsers allow HTTP redirects for simple cross-origin
        // requests but not for requests that require preflight.
        // Use a simple request to unravel any redirects and get the
        // final URL.  Retry the original request with the new URL if
        // it's different.
        //
        // This test is imperfect but it's simple and good for common
        // cases.  It catches all cross-origin cases but matches a few
        // same-origin cases too.
        if (typeof window === 'undefined' || url.startsWith(window.location.origin + '/')) {
          hasError = true
          return cb(err)
        }

        return get.head(url, function (errHead, res) {
          if (hasError) return
          if (errHead) {
            hasError = true
            return cb(errHead)
          }
          if (res.statusCode < 200 || res.statusCode >= 300) {
            hasError = true
            return cb(new Error('Unexpected HTTP status code ' + res.statusCode))
          }
          if (res.url === url) {
            hasError = true
            return cb(err)
          }

          opts.url = res.url
          get.concat(opts, function (err, res, data) {
            if (hasError) return
            if (err) {
              hasError = true
              return cb(err)
            }
            onResponse(res, data)
          })
        })
      }
      onResponse(res, data)
    })
  })
}

WebConn.prototype.destroy = function () {
  Wire.prototype.destroy.call(this)
  this._torrent = null
}

},{"../package.json":111,"bitfield":7,"bittorrent-protocol":8,"debug":108,"inherits":30,"safe-buffer":70,"simple-get":72,"simple-sha1":74}],108:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"./debug":109,"_process":130,"dup":13}],109:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"dup":14,"ms":45}],110:[function(require,module,exports){
arguments[4][99][0].apply(exports,arguments)
},{"dup":99,"end-of-stream":25,"fs":118,"once":48}],111:[function(require,module,exports){
module.exports={
  "version": "0.98.20"
}
},{}],112:[function(require,module,exports){
// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
module.exports = wrappy
function wrappy (fn, cb) {
  if (fn && cb) return wrappy(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k]
  })

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i]
    }
    var ret = fn.apply(this, args)
    var cb = args[args.length-1]
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k]
      })
    }
    return ret
  }
}

},{}],113:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],114:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],115:[function(require,module,exports){
/**
 * Given a number, return a zero-filled string.
 * From http://stackoverflow.com/questions/1267283/
 * @param  {number} width
 * @param  {number} number
 * @return {string}
 */
module.exports = function zeroFill (width, number, pad) {
  if (number === undefined) {
    return function (number, pad) {
      return zeroFill(width, number, pad)
    }
  }
  if (pad === undefined) pad = '0'
  width -= number.toString().length
  if (width > 0) return new Array(width + (/\./.test(number) ? 2 : 1)).join(pad) + number
  return number + ''
}

},{}],116:[function(require,module,exports){

},{}],117:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],118:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"dup":116}],119:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value)) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (isArrayBufferView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":117,"ieee754":124}],120:[function(require,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"dup":17}],121:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../is-buffer/index.js")})
},{"../../is-buffer/index.js":126}],122:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],123:[function(require,module,exports){
var http = require('http')
var url = require('url')

var https = module.exports

for (var key in http) {
  if (http.hasOwnProperty(key)) https[key] = http[key]
}

https.request = function (params, cb) {
  params = validateParams(params)
  return http.request.call(this, params, cb)
}

https.get = function (params, cb) {
  params = validateParams(params)
  return http.get.call(this, params, cb)
}

function validateParams (params) {
  if (typeof params === 'string') {
    params = url.parse(params)
  }
  if (!params.protocol) {
    params.protocol = 'https:'
  }
  if (params.protocol !== 'https:') {
    throw new Error('Protocol "' + params.protocol + '" not supported. Expected "https:"')
  }
  return params
}

},{"http":145,"url":151}],124:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],125:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"dup":30}],126:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],127:[function(require,module,exports){
arguments[4][34][0].apply(exports,arguments)
},{"dup":34}],128:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":130}],129:[function(require,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"_process":130,"dup":52}],130:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],131:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.1 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.4.1',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],132:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],133:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],134:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":132,"./encode":133}],135:[function(require,module,exports){
arguments[4][56][0].apply(exports,arguments)
},{"./_stream_readable":137,"./_stream_writable":139,"core-util-is":121,"dup":56,"inherits":125,"process-nextick-args":129}],136:[function(require,module,exports){
arguments[4][57][0].apply(exports,arguments)
},{"./_stream_transform":138,"core-util-is":121,"dup":57,"inherits":125}],137:[function(require,module,exports){
arguments[4][58][0].apply(exports,arguments)
},{"./_stream_duplex":135,"./internal/streams/BufferList":140,"./internal/streams/destroy":141,"./internal/streams/stream":142,"_process":130,"core-util-is":121,"dup":58,"events":122,"inherits":125,"isarray":127,"process-nextick-args":129,"safe-buffer":144,"string_decoder/":149,"util":118}],138:[function(require,module,exports){
arguments[4][59][0].apply(exports,arguments)
},{"./_stream_duplex":135,"core-util-is":121,"dup":59,"inherits":125}],139:[function(require,module,exports){
arguments[4][60][0].apply(exports,arguments)
},{"./_stream_duplex":135,"./internal/streams/destroy":141,"./internal/streams/stream":142,"_process":130,"core-util-is":121,"dup":60,"inherits":125,"process-nextick-args":129,"safe-buffer":144,"util-deprecate":153}],140:[function(require,module,exports){
arguments[4][61][0].apply(exports,arguments)
},{"dup":61,"safe-buffer":144}],141:[function(require,module,exports){
arguments[4][62][0].apply(exports,arguments)
},{"dup":62,"process-nextick-args":129}],142:[function(require,module,exports){
arguments[4][63][0].apply(exports,arguments)
},{"dup":63,"events":122}],143:[function(require,module,exports){
arguments[4][64][0].apply(exports,arguments)
},{"./lib/_stream_duplex.js":135,"./lib/_stream_passthrough.js":136,"./lib/_stream_readable.js":137,"./lib/_stream_transform.js":138,"./lib/_stream_writable.js":139,"dup":64}],144:[function(require,module,exports){
arguments[4][70][0].apply(exports,arguments)
},{"buffer":119,"dup":70}],145:[function(require,module,exports){
arguments[4][79][0].apply(exports,arguments)
},{"./lib/request":147,"./lib/response":148,"builtin-status-codes":120,"dup":79,"url":151,"xtend":154}],146:[function(require,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"dup":80}],147:[function(require,module,exports){
arguments[4][81][0].apply(exports,arguments)
},{"./capability":146,"./response":148,"_process":130,"buffer":119,"dup":81,"inherits":125,"readable-stream":143,"to-arraybuffer":150}],148:[function(require,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"./capability":146,"_process":130,"buffer":119,"dup":82,"inherits":125,"readable-stream":143}],149:[function(require,module,exports){
arguments[4][86][0].apply(exports,arguments)
},{"dup":86,"safe-buffer":144}],150:[function(require,module,exports){
arguments[4][89][0].apply(exports,arguments)
},{"buffer":119,"dup":89}],151:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var punycode = require('punycode');
var util = require('./util');

exports.parse = urlParse;
exports.resolve = urlResolve;
exports.resolveObject = urlResolveObject;
exports.format = urlFormat;

exports.Url = Url;

function Url() {
  this.protocol = null;
  this.slashes = null;
  this.auth = null;
  this.host = null;
  this.port = null;
  this.hostname = null;
  this.hash = null;
  this.search = null;
  this.query = null;
  this.pathname = null;
  this.path = null;
  this.href = null;
}

// Reference: RFC 3986, RFC 1808, RFC 2396

// define these here so at least they only have to be
// compiled once on the first module load.
var protocolPattern = /^([a-z0-9.+-]+:)/i,
    portPattern = /:[0-9]*$/,

    // Special case for a simple path URL
    simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

    // RFC 2396: characters reserved for delimiting URLs.
    // We actually just auto-escape these.
    delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

    // RFC 2396: characters not allowed for various reasons.
    unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

    // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
    autoEscape = ['\''].concat(unwise),
    // Characters that are never ever allowed in a hostname.
    // Note that any invalid chars are also handled, but these
    // are the ones that are *expected* to be seen, so we fast-path
    // them.
    nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
    hostEndingChars = ['/', '?', '#'],
    hostnameMaxLen = 255,
    hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
    hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
    // protocols that can allow "unsafe" and "unwise" chars.
    unsafeProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that never have a hostname.
    hostlessProtocol = {
      'javascript': true,
      'javascript:': true
    },
    // protocols that always contain a // bit.
    slashedProtocol = {
      'http': true,
      'https': true,
      'ftp': true,
      'gopher': true,
      'file': true,
      'http:': true,
      'https:': true,
      'ftp:': true,
      'gopher:': true,
      'file:': true
    },
    querystring = require('querystring');

function urlParse(url, parseQueryString, slashesDenoteHost) {
  if (url && util.isObject(url) && url instanceof Url) return url;

  var u = new Url;
  u.parse(url, parseQueryString, slashesDenoteHost);
  return u;
}

Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
  if (!util.isString(url)) {
    throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
  }

  // Copy chrome, IE, opera backslash-handling behavior.
  // Back slashes before the query string get converted to forward slashes
  // See: https://code.google.com/p/chromium/issues/detail?id=25916
  var queryIndex = url.indexOf('?'),
      splitter =
          (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
      uSplit = url.split(splitter),
      slashRegex = /\\/g;
  uSplit[0] = uSplit[0].replace(slashRegex, '/');
  url = uSplit.join(splitter);

  var rest = url;

  // trim before proceeding.
  // This is to support parse stuff like "  http://foo.com  \n"
  rest = rest.trim();

  if (!slashesDenoteHost && url.split('#').length === 1) {
    // Try fast path regexp
    var simplePath = simplePathPattern.exec(rest);
    if (simplePath) {
      this.path = rest;
      this.href = rest;
      this.pathname = simplePath[1];
      if (simplePath[2]) {
        this.search = simplePath[2];
        if (parseQueryString) {
          this.query = querystring.parse(this.search.substr(1));
        } else {
          this.query = this.search.substr(1);
        }
      } else if (parseQueryString) {
        this.search = '';
        this.query = {};
      }
      return this;
    }
  }

  var proto = protocolPattern.exec(rest);
  if (proto) {
    proto = proto[0];
    var lowerProto = proto.toLowerCase();
    this.protocol = lowerProto;
    rest = rest.substr(proto.length);
  }

  // figure out if it's got a host
  // user@server is *always* interpreted as a hostname, and url
  // resolution will treat //foo/bar as host=foo,path=bar because that's
  // how the browser resolves relative URLs.
  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
    var slashes = rest.substr(0, 2) === '//';
    if (slashes && !(proto && hostlessProtocol[proto])) {
      rest = rest.substr(2);
      this.slashes = true;
    }
  }

  if (!hostlessProtocol[proto] &&
      (slashes || (proto && !slashedProtocol[proto]))) {

    // there's a hostname.
    // the first instance of /, ?, ;, or # ends the host.
    //
    // If there is an @ in the hostname, then non-host chars *are* allowed
    // to the left of the last @ sign, unless some host-ending character
    // comes *before* the @-sign.
    // URLs are obnoxious.
    //
    // ex:
    // http://a@b@c/ => user:a@b host:c
    // http://a@b?@c => user:a host:c path:/?@c

    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
    // Review our test case against browsers more comprehensively.

    // find the first instance of any hostEndingChars
    var hostEnd = -1;
    for (var i = 0; i < hostEndingChars.length; i++) {
      var hec = rest.indexOf(hostEndingChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }

    // at this point, either we have an explicit point where the
    // auth portion cannot go past, or the last @ char is the decider.
    var auth, atSign;
    if (hostEnd === -1) {
      // atSign can be anywhere.
      atSign = rest.lastIndexOf('@');
    } else {
      // atSign must be in auth portion.
      // http://a@b/c@d => host:b auth:a path:/c@d
      atSign = rest.lastIndexOf('@', hostEnd);
    }

    // Now we have a portion which is definitely the auth.
    // Pull that off.
    if (atSign !== -1) {
      auth = rest.slice(0, atSign);
      rest = rest.slice(atSign + 1);
      this.auth = decodeURIComponent(auth);
    }

    // the host is the remaining to the left of the first non-host char
    hostEnd = -1;
    for (var i = 0; i < nonHostChars.length; i++) {
      var hec = rest.indexOf(nonHostChars[i]);
      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
        hostEnd = hec;
    }
    // if we still have not hit it, then the entire thing is a host.
    if (hostEnd === -1)
      hostEnd = rest.length;

    this.host = rest.slice(0, hostEnd);
    rest = rest.slice(hostEnd);

    // pull out port.
    this.parseHost();

    // we've indicated that there is a hostname,
    // so even if it's empty, it has to be present.
    this.hostname = this.hostname || '';

    // if hostname begins with [ and ends with ]
    // assume that it's an IPv6 address.
    var ipv6Hostname = this.hostname[0] === '[' &&
        this.hostname[this.hostname.length - 1] === ']';

    // validate a little.
    if (!ipv6Hostname) {
      var hostparts = this.hostname.split(/\./);
      for (var i = 0, l = hostparts.length; i < l; i++) {
        var part = hostparts[i];
        if (!part) continue;
        if (!part.match(hostnamePartPattern)) {
          var newpart = '';
          for (var j = 0, k = part.length; j < k; j++) {
            if (part.charCodeAt(j) > 127) {
              // we replace non-ASCII char with a temporary placeholder
              // we need this to make sure size of hostname is not
              // broken by replacing non-ASCII by nothing
              newpart += 'x';
            } else {
              newpart += part[j];
            }
          }
          // we test again with ASCII char only
          if (!newpart.match(hostnamePartPattern)) {
            var validParts = hostparts.slice(0, i);
            var notHost = hostparts.slice(i + 1);
            var bit = part.match(hostnamePartStart);
            if (bit) {
              validParts.push(bit[1]);
              notHost.unshift(bit[2]);
            }
            if (notHost.length) {
              rest = '/' + notHost.join('.') + rest;
            }
            this.hostname = validParts.join('.');
            break;
          }
        }
      }
    }

    if (this.hostname.length > hostnameMaxLen) {
      this.hostname = '';
    } else {
      // hostnames are always lower case.
      this.hostname = this.hostname.toLowerCase();
    }

    if (!ipv6Hostname) {
      // IDNA Support: Returns a punycoded representation of "domain".
      // It only converts parts of the domain name that
      // have non-ASCII characters, i.e. it doesn't matter if
      // you call it with a domain that already is ASCII-only.
      this.hostname = punycode.toASCII(this.hostname);
    }

    var p = this.port ? ':' + this.port : '';
    var h = this.hostname || '';
    this.host = h + p;
    this.href += this.host;

    // strip [ and ] from the hostname
    // the host field still retains them, though
    if (ipv6Hostname) {
      this.hostname = this.hostname.substr(1, this.hostname.length - 2);
      if (rest[0] !== '/') {
        rest = '/' + rest;
      }
    }
  }

  // now rest is set to the post-host stuff.
  // chop off any delim chars.
  if (!unsafeProtocol[lowerProto]) {

    // First, make 100% sure that any "autoEscape" chars get
    // escaped, even if encodeURIComponent doesn't think they
    // need to be.
    for (var i = 0, l = autoEscape.length; i < l; i++) {
      var ae = autoEscape[i];
      if (rest.indexOf(ae) === -1)
        continue;
      var esc = encodeURIComponent(ae);
      if (esc === ae) {
        esc = escape(ae);
      }
      rest = rest.split(ae).join(esc);
    }
  }


  // chop off from the tail first.
  var hash = rest.indexOf('#');
  if (hash !== -1) {
    // got a fragment string.
    this.hash = rest.substr(hash);
    rest = rest.slice(0, hash);
  }
  var qm = rest.indexOf('?');
  if (qm !== -1) {
    this.search = rest.substr(qm);
    this.query = rest.substr(qm + 1);
    if (parseQueryString) {
      this.query = querystring.parse(this.query);
    }
    rest = rest.slice(0, qm);
  } else if (parseQueryString) {
    // no query string, but parseQueryString still requested
    this.search = '';
    this.query = {};
  }
  if (rest) this.pathname = rest;
  if (slashedProtocol[lowerProto] &&
      this.hostname && !this.pathname) {
    this.pathname = '/';
  }

  //to support http.request
  if (this.pathname || this.search) {
    var p = this.pathname || '';
    var s = this.search || '';
    this.path = p + s;
  }

  // finally, reconstruct the href based on what has been validated.
  this.href = this.format();
  return this;
};

// format a parsed object into a url string
function urlFormat(obj) {
  // ensure it's an object, and not a string url.
  // If it's an obj, this is a no-op.
  // this way, you can call url_format() on strings
  // to clean up potentially wonky urls.
  if (util.isString(obj)) obj = urlParse(obj);
  if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
  return obj.format();
}

Url.prototype.format = function() {
  var auth = this.auth || '';
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ':');
    auth += '@';
  }

  var protocol = this.protocol || '',
      pathname = this.pathname || '',
      hash = this.hash || '',
      host = false,
      query = '';

  if (this.host) {
    host = auth + this.host;
  } else if (this.hostname) {
    host = auth + (this.hostname.indexOf(':') === -1 ?
        this.hostname :
        '[' + this.hostname + ']');
    if (this.port) {
      host += ':' + this.port;
    }
  }

  if (this.query &&
      util.isObject(this.query) &&
      Object.keys(this.query).length) {
    query = querystring.stringify(this.query);
  }

  var search = this.search || (query && ('?' + query)) || '';

  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
  // unless they had them to begin with.
  if (this.slashes ||
      (!protocol || slashedProtocol[protocol]) && host !== false) {
    host = '//' + (host || '');
    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
  } else if (!host) {
    host = '';
  }

  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
  if (search && search.charAt(0) !== '?') search = '?' + search;

  pathname = pathname.replace(/[?#]/g, function(match) {
    return encodeURIComponent(match);
  });
  search = search.replace('#', '%23');

  return protocol + host + pathname + search + hash;
};

function urlResolve(source, relative) {
  return urlParse(source, false, true).resolve(relative);
}

Url.prototype.resolve = function(relative) {
  return this.resolveObject(urlParse(relative, false, true)).format();
};

function urlResolveObject(source, relative) {
  if (!source) return relative;
  return urlParse(source, false, true).resolveObject(relative);
}

Url.prototype.resolveObject = function(relative) {
  if (util.isString(relative)) {
    var rel = new Url();
    rel.parse(relative, false, true);
    relative = rel;
  }

  var result = new Url();
  var tkeys = Object.keys(this);
  for (var tk = 0; tk < tkeys.length; tk++) {
    var tkey = tkeys[tk];
    result[tkey] = this[tkey];
  }

  // hash is always overridden, no matter what.
  // even href="" will remove it.
  result.hash = relative.hash;

  // if the relative url is empty, then there's nothing left to do here.
  if (relative.href === '') {
    result.href = result.format();
    return result;
  }

  // hrefs like //foo/bar always cut to the protocol.
  if (relative.slashes && !relative.protocol) {
    // take everything except the protocol from relative
    var rkeys = Object.keys(relative);
    for (var rk = 0; rk < rkeys.length; rk++) {
      var rkey = rkeys[rk];
      if (rkey !== 'protocol')
        result[rkey] = relative[rkey];
    }

    //urlParse appends trailing / to urls like http://www.example.com
    if (slashedProtocol[result.protocol] &&
        result.hostname && !result.pathname) {
      result.path = result.pathname = '/';
    }

    result.href = result.format();
    return result;
  }

  if (relative.protocol && relative.protocol !== result.protocol) {
    // if it's a known url protocol, then changing
    // the protocol does weird things
    // first, if it's not file:, then we MUST have a host,
    // and if there was a path
    // to begin with, then we MUST have a path.
    // if it is file:, then the host is dropped,
    // because that's known to be hostless.
    // anything else is assumed to be absolute.
    if (!slashedProtocol[relative.protocol]) {
      var keys = Object.keys(relative);
      for (var v = 0; v < keys.length; v++) {
        var k = keys[v];
        result[k] = relative[k];
      }
      result.href = result.format();
      return result;
    }

    result.protocol = relative.protocol;
    if (!relative.host && !hostlessProtocol[relative.protocol]) {
      var relPath = (relative.pathname || '').split('/');
      while (relPath.length && !(relative.host = relPath.shift()));
      if (!relative.host) relative.host = '';
      if (!relative.hostname) relative.hostname = '';
      if (relPath[0] !== '') relPath.unshift('');
      if (relPath.length < 2) relPath.unshift('');
      result.pathname = relPath.join('/');
    } else {
      result.pathname = relative.pathname;
    }
    result.search = relative.search;
    result.query = relative.query;
    result.host = relative.host || '';
    result.auth = relative.auth;
    result.hostname = relative.hostname || relative.host;
    result.port = relative.port;
    // to support http.request
    if (result.pathname || result.search) {
      var p = result.pathname || '';
      var s = result.search || '';
      result.path = p + s;
    }
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  }

  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
      isRelAbs = (
          relative.host ||
          relative.pathname && relative.pathname.charAt(0) === '/'
      ),
      mustEndAbs = (isRelAbs || isSourceAbs ||
                    (result.host && relative.pathname)),
      removeAllDots = mustEndAbs,
      srcPath = result.pathname && result.pathname.split('/') || [],
      relPath = relative.pathname && relative.pathname.split('/') || [],
      psychotic = result.protocol && !slashedProtocol[result.protocol];

  // if the url is a non-slashed url, then relative
  // links like ../.. should be able
  // to crawl up to the hostname, as well.  This is strange.
  // result.protocol has already been set by now.
  // Later on, put the first path part into the host field.
  if (psychotic) {
    result.hostname = '';
    result.port = null;
    if (result.host) {
      if (srcPath[0] === '') srcPath[0] = result.host;
      else srcPath.unshift(result.host);
    }
    result.host = '';
    if (relative.protocol) {
      relative.hostname = null;
      relative.port = null;
      if (relative.host) {
        if (relPath[0] === '') relPath[0] = relative.host;
        else relPath.unshift(relative.host);
      }
      relative.host = null;
    }
    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
  }

  if (isRelAbs) {
    // it's absolute.
    result.host = (relative.host || relative.host === '') ?
                  relative.host : result.host;
    result.hostname = (relative.hostname || relative.hostname === '') ?
                      relative.hostname : result.hostname;
    result.search = relative.search;
    result.query = relative.query;
    srcPath = relPath;
    // fall through to the dot-handling below.
  } else if (relPath.length) {
    // it's relative
    // throw away the existing file, and take the new path instead.
    if (!srcPath) srcPath = [];
    srcPath.pop();
    srcPath = srcPath.concat(relPath);
    result.search = relative.search;
    result.query = relative.query;
  } else if (!util.isNullOrUndefined(relative.search)) {
    // just pull out the search.
    // like href='?foo'.
    // Put this after the other two cases because it simplifies the booleans
    if (psychotic) {
      result.hostname = result.host = srcPath.shift();
      //occationaly the auth can get stuck only in host
      //this especially happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ?
                       result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    result.search = relative.search;
    result.query = relative.query;
    //to support http.request
    if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') +
                    (result.search ? result.search : '');
    }
    result.href = result.format();
    return result;
  }

  if (!srcPath.length) {
    // no path at all.  easy.
    // we've already handled the other stuff above.
    result.pathname = null;
    //to support http.request
    if (result.search) {
      result.path = '/' + result.search;
    } else {
      result.path = null;
    }
    result.href = result.format();
    return result;
  }

  // if a url ENDs in . or .., then it must get a trailing slash.
  // however, if it ends in anything else non-slashy,
  // then it must NOT get a trailing slash.
  var last = srcPath.slice(-1)[0];
  var hasTrailingSlash = (
      (result.host || relative.host || srcPath.length > 1) &&
      (last === '.' || last === '..') || last === '');

  // strip single dots, resolve double dots to parent dir
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = srcPath.length; i >= 0; i--) {
    last = srcPath[i];
    if (last === '.') {
      srcPath.splice(i, 1);
    } else if (last === '..') {
      srcPath.splice(i, 1);
      up++;
    } else if (up) {
      srcPath.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (!mustEndAbs && !removeAllDots) {
    for (; up--; up) {
      srcPath.unshift('..');
    }
  }

  if (mustEndAbs && srcPath[0] !== '' &&
      (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
    srcPath.unshift('');
  }

  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
    srcPath.push('');
  }

  var isAbsolute = srcPath[0] === '' ||
      (srcPath[0] && srcPath[0].charAt(0) === '/');

  // put the host back
  if (psychotic) {
    result.hostname = result.host = isAbsolute ? '' :
                                    srcPath.length ? srcPath.shift() : '';
    //occationaly the auth can get stuck only in host
    //this especially happens in cases like
    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
    var authInHost = result.host && result.host.indexOf('@') > 0 ?
                     result.host.split('@') : false;
    if (authInHost) {
      result.auth = authInHost.shift();
      result.host = result.hostname = authInHost.shift();
    }
  }

  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

  if (mustEndAbs && !isAbsolute) {
    srcPath.unshift('');
  }

  if (!srcPath.length) {
    result.pathname = null;
    result.path = null;
  } else {
    result.pathname = srcPath.join('/');
  }

  //to support request.http
  if (!util.isNull(result.pathname) || !util.isNull(result.search)) {
    result.path = (result.pathname ? result.pathname : '') +
                  (result.search ? result.search : '');
  }
  result.auth = relative.auth || result.auth;
  result.slashes = result.slashes || relative.slashes;
  result.href = result.format();
  return result;
};

Url.prototype.parseHost = function() {
  var host = this.host;
  var port = portPattern.exec(host);
  if (port) {
    port = port[0];
    if (port !== ':') {
      this.port = port.substr(1);
    }
    host = host.substr(0, host.length - port.length);
  }
  if (host) this.hostname = host;
};

},{"./util":152,"punycode":131,"querystring":134}],152:[function(require,module,exports){
'use strict';

module.exports = {
  isString: function(arg) {
    return typeof(arg) === 'string';
  },
  isObject: function(arg) {
    return typeof(arg) === 'object' && arg !== null;
  },
  isNull: function(arg) {
    return arg === null;
  },
  isNullOrUndefined: function(arg) {
    return arg == null;
  }
};

},{}],153:[function(require,module,exports){
arguments[4][97][0].apply(exports,arguments)
},{"dup":97}],154:[function(require,module,exports){
arguments[4][113][0].apply(exports,arguments)
},{"dup":113}]},{},[1]);

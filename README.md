<h1 align="center">
  <a href="https://github.com/PeerConnect/PeerConnect">
    <img src="https://justinko43.github.io/03_300%20DPI.png">
  </a>
  <br>
  PeerConnect
  <br>
</h1>

<h4 align="center">A P2P CDN Implementation</h4>

## About
PeerConnect is a proof of concept that aims to serve static assets (videos/images) over a peer to peer delivery network powered by WebRTC (images), WebTorrent (videos), and WebSockets (signaling)
### Images
`PeerConnect` uses WebRTC for image P2P transfers. By using websockets, we are able to coordinate data-channel connections between two different peers. If no available peers are present, images are loaded from the server. Once a peer finishes downloading, they become an initiator for future P2P data transfers.
### Video
`PeerConnect` uses WebTorrent and torrenting protocols for video P2P transfers. By utilizing the server as a webseed for videos, as more and more individuals visit the site, video streams will get progressively stronger and rely less on the initial webseed hosted on the server.
## Usage
Using PeerConnect requires a script on the client end and initiation on the server.
### Setup
```
npm install --save peer-connect-client peer-connect-server
```
#### Client
If using a file bundler e.g. (browserify), you can require it in your script file.
```js
const PeerConnectClient = require('peer-connect-client');
PeerConnectClient();
```
If you want to use the module without bundling, it is currently being hosted on unpkg CDN. Use it as a script in your html file.
```
https://unpkg.com/peer-connect-client@0.1.3/peer-connect-client.min.js
```
You will need to bring in socket.io as a script in your html file.
```html
<script src="/socket.io/socket.io.js"></script>
```
#### Server
PeerConnect utilizes Express and socket.io to coordinate WebRTC connections. In addition, in order to create webseeds, we create routes serving the video files.

To use it, require PeerConnectServer from our package and pass in the Node Server instance you're using along with your PeerConnectServer configurations. In Express, you can get this instance by calling app.listen.

Here's how you would use it in your server:
```js
const PeerConnectServer = require('peer-connect-server');
const server = app.listen(8000);

//to allow cross origin resource sharing
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

PeerConnect(server, app, [opts]);
PeerConnectServer(server, app, [opts]);
```

### Example
Set src attributes in a data-src attribute for assets!
```html
<video data-src="../assets/videos/yosemite-hd.mp4" controls src=""></video>
  <div class="image-container-inner">
    <img data-src="../assets/image1.jpg">
    <img data-src="../assets/image2.png">
  </div>
```

### Configuration
It's easy to incorporate `PeerConnectServer`. Just provide us with a few details on your peerConfig object and we'll do the rest!
If opts is specified to PeerConnectServer, it will override the default options (shown below).

```threshold``` - An integer threshold value to determine when to turn on P2P image sharing <i>e.g. if threshold = 3, fourth client will load from peers</i>
<br>```peerImages``` - A boolean that determines whether to load images P2P
<br>```peerVideos``` - A boolean that determines whether to load videos P2P
<br>```excludeFormats``` - An array of string(s) that say which file formats to exclude from peers
<br>```foldLoading``` - A boolean that determines whether to load images above the fold from the server if true
<br>```geoLocate``` - A boolean that either uses geolocation to pair the closest peers or not
<br>```videoRoute``` - The path to all of your video assets
<br>```torrentRoute``` - The path where a new folder holding all of your torrent files will be created
<br>```domainName``` - Your website url
```
{
  threshold: Integer             // 3
  peerImages: Boolean            // true
  peerVideos: Boolean            // true
  excludeFormats: [Strings]      // ['gif']
  foldLoading: Boolean           // false
  geoLocate: Boolean             // true
  videoRoute: String             // './assets/videos'
  torrentRoute: String           // './assets'
  domainName: String             // 'https://peerconnect.io'
}
```

## Contributing
To contribute to `PeerConnect`, fork the repository and clone it to your machine then install dependencies with `npm install`. If you're interested in joining the Peer Connect team as a contributor, feel free to message one of us directly!
## Authors
- <b>Justin Ko</b> (https://github.com/justinko43)
- <b>Mike Gutierrez</b> (https://github.com/mikegutierrez)
- <b>Peter Lee</b> (https://github.com/wasafune)
- <b>Jim Kang</b> (https://github.com/jiminykbob)

## License
This project is licensed under the MIT License - see the LICENSE file for details

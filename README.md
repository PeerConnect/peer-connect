<h1 align="center">
  <a href="https://github.com/peer-connect/peer-connect">
    <img src="https://justinko43.github.io/03_300%20DPI.png">
  </a>
  <br>
  Peer-Connect
  <br>
</h1>

<h4 align="left">A P2P CDN Implementation</h4>

## About
PeerConnect is a proof of concept that aims to serve static assets (videos/images) over a peer to peer delivery network powered by WebRTC (images) and WebTorrent (videos)
### Images
### Video

## Usage
### Setup
### Configuration
It's easy to incorporate `Peer-Connect`. Just provide us with a few details on your P2P configuration and we'll do the rest!

```threshold``` - An integer threshold value to determine when to turn on P2P image sharing <i>e.g. if threshold = 3, fourth client will load from peers</i>
<br>```mediaTypes``` - An array of the string(s) that tell which media types to share with peers
<br>```excludeFormats``` - An array of string(s) that say which file formats to exclude from peers
<br>```foldLoading``` - A Boolean that determines whether to load images above the fold from the server if true
<br>```geoLocate``` - A Boolean that either uses geolocation to pair the closest peers or not
<br>```videoRoute``` - The path to all of your video assets
<br>```torrentRoute``` - The path where a new folder holding all of your torrent files will be created
<br>```domainName``` - Your website url
```
{
  threshold: Integer             // 3
  mediaTypes: [Strings]          // ['image', 'video', 'audio']
  excludeFormats: [Strings]      // ['gif']
  foldLoading: Boolean           // false
  geoLocate: Boolean             // true
  videoRoute: String             // './assets/videos'
  torrentRoute: String           // './assets'
  domainName: String             // 'https://peerconnect.io'
}
```

## Contributing
To contribute to `Peer-Connect`, fork the repository and clone it to your machine then install dependencies with `npm install`. If you're interested in joining the Peer Connect team as a contributor, feel free to message one of us directly!
## Authors
- Justin Ko (https://github.com/justinko43)
- Mike Gutierrez (https://github.com/mikegutierrez)
- Peter Lee (https://github.com/wasafune)
- Jim Kang (https://github.com/jiminykbob)

## License
This project is licensed under the MIT License - see the LICENSE file for details
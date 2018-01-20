const demoFunctions = {
  assetsFromServer: function () {
    document.getElementsByClassName('loading_gif')[0].style.display = 'none';
    document.getElementById('downloaded_from').innerHTML = 'Assets downloaded from the SERVER!';
    document.getElementById('downloaded_from').style.display = '';
  },
  assetsFromPeerMessage: function () {
    document.getElementById('downloaded_from').innerHTML = 'Assets downloaded from a PEER!';
  },
  assetsFromPeer: function (initiatorData) {
    document.getElementsByClassName('loading_gif')[0].style.display = 'none';
    this.assetsFromPeerMessage();
    document.getElementById('downloaded_from').style.display = '';
    document.getElementById('report').style.display = '';
    document.getElementById('peer_info').style.display = '';
    if (initiatorData.location) {
      const { location } = initiatorData;
      document.getElementById('peer_info').innerHTML +=
        `<br>* Received data from ${location.city}, ${location.regionCode}, ${location.country} ${location.zipCode};`;
    }
  },
  sentDataToPeerLocation: function (peerLocation) {
    // location data of peer to render on page for demo
    document.getElementById('peer_info').style.display = '';
    if (peerLocation) {
      document.getElementById('peer_info').innerHTML +=
        `<br>* Sent data to ${peerLocation.city}, ${peerLocation.regionCode}, ${peerLocation.country} ${peerLocation.zipCode};`;
    }
  },
  appendTime: function (imageIndex, currentTime) {
    document.getElementById(imageIndex).parentNode.appendChild(document.createTextNode(`${new Date() - currentTime} ms`));
  },
  reportTime: function (time, currentOrTotal, domId) {
    // function that reports time to DOM
    time = new Date();
    document.getElementById(domId).innerHTML += `<span class="bold">${time - currentOrTotal} ms</span>`;
    currentTime = new Date();
  },
  timeTotalFromServer: function (browserOpenTime) {
    document.getElementById('time_total_from_server').innerHTML = `Time it took to load from server: ${new Date() - browserOpenTime} ms  `;
  }
}
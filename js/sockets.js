// indicates if client has downloaded assets from server
// and can send assets to new client connections
let initiator;

// track if assets have been downloaded
let assetsDownloaded = false;

// Establish connection
const socket = io.connect();

// client has loaded page
socket.emit("create");

// when new socket has been opend
socket.on("created", () => {
  console.log("socket.on CREATED");
  // created client can initiate downloads to other clients
  initiator = true;
  loadAssetsFromServer();
});

// download assets from server
function loadAssetsFromServer() {
  console.log("LOAD ASSETS FROM SERVER");
  // query DOM for test images
  const image1 = document.getElementById("image1");
  const image2 = document.getElementById("image2");
  const image3 = document.getElementById("image3");

  // if new client is the first on the page
  // and has not downloaded assets yet
  if (initiator && !assetsDownloaded) {
    image1.setAttribute("src", "../assets/image1.jpg");
    image2.setAttribute("src", "../assets/image2.png");
    image3.setAttribute("src", "../assets/image3.jpg");
  }
}

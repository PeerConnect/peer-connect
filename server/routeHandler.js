module.exports = function (peerConfig, app) {
  const fs = require('fs');
  const path = require('path');
  const route = peerConfig.videoRoute;
  
  fs.readdir(path.join(__dirname, '../', route), (err, files) => {
    if (err) {
      console.log(err);
    }

    files.forEach(file => {
      // console.log(file);
      app.get(`/video/${file}`, (req, res) => {
        res.sendFile(path.join(__dirname, '../', route, file));
      })
    })
  })
}
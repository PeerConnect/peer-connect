const express = require("express");
const path = require("path");
const socket = require("socket.io");

// App setup
const PORT = 8080;
const app = express();
const server = app.listen(PORT, () =>
  console.log(`App listening on port ${PORT}...`)
);

// Serve static files
app.use(express.static(path.join(__dirname, "/")));

// Allow for cross origin resource sharing
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Sockets setup
const io = socket(server);
const activeClients = [];

io.on("connection", socket => {
  console.log(`socket connection started. ID: ${socket.id}`);
  activeClients.push(socket.id);
  console.log(`activeClients: ${activeClients}`);

  socket.on("disconnect", () => {
    console.log(`disconnecting ${socket.id}`);
    activeClients.splice(activeClients.indexOf(socket.id), 1);
    console.log(`activeClients: ${activeClients}`);
  });
});

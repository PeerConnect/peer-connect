const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

app.use(express.static(path.join(__dirname, "/")));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}...`));

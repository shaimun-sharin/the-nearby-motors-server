const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("The NearBy Motors is running!");
});

app.listen(port, () => {
  console.log(`Nearby Motors listening on port ${port}`);
});

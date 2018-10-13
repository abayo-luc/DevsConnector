const express = require("express");
const mongoose = require("mongoose");

const app = express();
//DB Config
const db = require("./config/keys").mongoURI;
//Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("mongo db connected"))
  .catch(error => console.log(error));

app.get("/", (req, res) => res.send("hello World"));

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server running on port ${port}`));

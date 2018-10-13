const express = require("express");
const mongoose = require("mongoose");

//calling the routes files
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

//intializing the up
const app = express();

//DB Config
const db = require("./config/keys").mongoURI;

//Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log("mongo db connected"))
  .catch(error => console.log(error));

app.get("/", (req, res) => res.send("hello World"));

app.use("/api/users", users);
app.use("/api/profile", profile);
app.use("/api/posts", posts);
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`server running on port ${port}`));

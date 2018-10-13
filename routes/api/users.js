const express = require("express");
const router = express.Router();
const passport = require("passport");
//encrypting the password lib
const bcrypt = require("bcryptjs");
// web base token li
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
//load gravatar
const gravatar = require("gravatar");
//Load user model
const User = require("../../models/User");

// @route GET api/users/test
// @desc Test user route
// @access  Public
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

// @route GET api/users/register
// @desc Registor user
// @access  Public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      let avatar = gravatar.url(req.body.email, {
        s: "200", //size of the gravator
        r: "pg", //Rating
        d: "mm" //Default avatar
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        avatar
      });
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

// @route GET api/users/login
// @desc Login user | by return the token
// @access  Public
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  //fint user by email
  User.findOne({ email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: "User not fount" });
    }
    //check the password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //user matched
        const payload = { id: user.id, name: user.name, avatar: user.avatar }; //create jwt payload
        //sign token
        jwt.sign(
          payload,
          keys.scecretOrkey,
          { expiresIn: 3600 },
          (err, token) => {
            res.json({
              sucess: true,
              token: "Bearer" + token // formating token by using certain type of protocal
            });
          }
        );
      } else {
        return res.status(400).json({ password: "Password incorrect" });
      }
    });
  });
});
// @route GET api/users/current
// @desc return the current user
// @access  Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ msg: "sucess" });
  }
);
module.exports = router;

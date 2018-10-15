const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");
//load post model
const Post = require("../../models/Post");
//load user modle
const User = require("../../models/User");
//load profile model
const Profile = require("../../models/Profile");

//bring in validation
const InvalidatePostput = require("../../validation/post");

// @route Post api/posts
// @desc create new post router
// @access  protected
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = InvalidatePostput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    const newPost = new Post({
      text: req.body.text,
      user: req.user.id,
      name: req.user.name,
      avatar: req.user.avatar
    });

    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => res.status(400).json(err));
  }
);

// @route Update api/posts
// @desc update a specific post router
// @access  protected
router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = InvalidatePostput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    const postFields = {
      user: req.user.id,
      name: req.user.name,
      avatar: req.user.avatar
    };
    if (typeof req.body.text !== "undefined") postFields.text = req.body.text;

    Post.findOneAndUpdate(
      { user: req.user.id, _id: req.params.id },
      { $set: postFields },
      { new: true }
    )
      .then(post => res.json(post))
      .catch(err => {
        errors.post = "Post not found";
        res.status(404).json(errors);
      });
  }
);

// @route Get api/posts/
// @desc get all posts
// @access  Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err =>
      res.status(404).json({ posts: "There is no any post found" })
    );
});
//@route Get api/posts/:id
// @desc get one posts
// @access  Public
router.get("/:id", (req, res) => {
  Post.findOne({ _id: req.params.id })
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ post: "Post not found" }));
});
// @route Delete api/posts/:id
// @desc delete a specific post router
// @access  protected

//find a way to authorize this request so that use can only delete post that belongs to him or her.
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ notauthorized: "user not authorized" });
        }
        post
          .remove()
          .then(() => res.json({ sucess: true }))
          .catch(err => res.status(400).json({ post: "Post not found" }));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route Delete api/posts/like/:id
// @desc like a post
// @access  protected
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyLiked: "User already liked this post" });
          }
          post.likes.unshift({ user: req.user.id });
          post
            .save()
            .then(post => res.json(post))
            .catch(err => res.status(404).json({ post: "Like failed" }));
        })
        .catch(err => res.status(404).json(err));
    });
  }
);
module.exports = router;

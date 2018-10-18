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
const validateCommentInput = require("../../validation/comment");

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
router.patch(
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
      .then(post => {
        if (!post) {
          errors.post = "post not found";
          return res.status(400).json(errors);
        }
        res.json(post);
      })
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
  "/likes/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        let currentUserLike = post.likes.indexOf(
          post.likes.find(like => like.user.toString() === req.user.id)
        );
        if (currentUserLike >= 0) {
          post.likes.splice(currentUserLike, 1);
        } else {
          post.likes.unshift({ user: req.user.id });
        }
        post
          .save()
          .then(post => res.json(post))
          .catch(err => res.status(404).json({ post: "Like failed" }));
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route Post api/posts/comments/:id
// @desc comment a post
// @access  protected
router.post(
  "/:id/comments",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        //create a comment
        const newComment = {
          text: req.body.text,
          name: req.user.name,
          avatar: req.user.avatar,
          user: req.user.id
        };
        post.comment.unshift(newComment);
        post
          .save()
          .then(post => res.json(post))
          .catch(err => {
            errors.comment = "Comment failed";
            res.status(400).json(errors);
          });
      })
      .catch(err => {
        //send an eror
        errors.post = "No post found";
        res.status(404).json(errors);
      });
  }
);

// @route Delete api/posts/comments/:id
// @desc comment a delete
// @access  protected
router.delete(
  "/:id/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        const { commentId } = req.params;
        let theComment = post.comment.find(com => {
          return (
            com["_id"].toString() === commentId &&
            com.user.toString() === req.user.id
          );
        });
        let theIndex = post.comment.indexOf(theComment);
        if (theIndex < 0) {
          return res.status(404).json({ comment: "Comment doesn't exist" });
        }
        post.comment.splice(theIndex, 1);
        post
          .save()
          .then(post => res.json(post))
          .catch(err => {
            console.log(err);
            res.status(400).json({ err: "Comment was unable to be deleted" });
          });
      })
      .catch(err => {
        console.log(err);
        res.status(400).json({ err: "Post not found" });
      });
  }
);
// @route Patch api/posts/comments/:id
// @desc comment edit
// @access  protected
router.patch(
  "/:id/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateCommentInput(req.body);
    if (!isValid) {
      return res.status(400).json(errors);
    }
    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.user.name,
          avatar: req.user.avatar,
          user: req.user.id
        };
        const { commentId } = req.params;
        let theComment = post.comment.find(com => {
          return (
            com["_id"].toString() === commentId &&
            com.user.toString() === req.user.id
          );
        });
        let theIndex = post.comment.indexOf(theComment);
        if (theIndex < 0) {
          return res.status(404).json({ comment: "Comment doesn't exist" });
        }
        post.comment[theIndex] = newComment;
        post
          .save()
          .then(post => res.json(post))
          .catch(err => {
            console.log(err);
            res.status(400).json({ err: "Comment was unable to be updated" });
          });
      })
      .catch(err => {
        console.log(err);
        res.status(400).json({ err: "Post not found" });
      });
  }
);
module.exports = router;

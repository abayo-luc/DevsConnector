const express = require("express");
const router = express.Router();
const passport = require("passport");
//load profile model
const Profile = require("../../models/Profile");
//load user model
const User = require("../../models/User");

//proifle inputs validators
const validateProfileInputs = require("../../validation/profile");
const validateExpeirenceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");
// @route GET api/profile
// @desc get current user profile
// @access  protected
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is not profile for this user";
          res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);
// @route GET api/profile/handle:handle
// @desc get the user profile by handle
// @access  protected
router.get("/handle/:handle", (req, res) => {
  let errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        console.log("not found");
        errors.profile = "There is no proifle for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(400).json(err));
});

// @route GET api/profile/user/:user_id
// @desc get the user profile by user id
// @access  protected
router.get("/user/:user_id", (req, res) => {
  let errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.profile = "There is no proifle for this user";
        res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(400).json({ profile: "There is no profile for this user" })
    );
});
// @route GET api/profile/all
// @desc get all proifles
// @access  protected
router.get("/all", (req, res) => {
  let errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        errors.profiles = "There are no profiles ";
        res.status(404).json(errors);
      }
      res.json(profiles);
    })
    .catch(err => res.status(404).json({ profiles: "There is no profiles" }));
});
// @route GET api/profile/new
// @desc create or edit profile router
// @access  protected
router.post(
  "/new",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInputs(req.body);
    //check validation
    if (!isValid) {
      //return errors with 400 status
      res.status(400).json(errors);
    }
    const profileFields = {};
    //retrieve user from req
    profileFields.user = req.user.id;
    const {
      handle,
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      linkedin,
      facebook,
      instagram
    } = req.body;
    if (typeof handle !== "undefined") profileFields.handle = handle;
    if (typeof company !== "undefined") profileFields.company = company;
    if (typeof website !== "undefined") profileFields.website = website;
    if (typeof location !== "undefined") profileFields.location = location;
    if (typeof status !== "undefined") profileFields.status = status;
    if (typeof bio !== "undefined") profileFields.bio = bio;
    if (typeof githubusername !== "undefined")
      profileFields.githubusername = githubusername;
    //skills split it into an array
    if (typeof skills !== "undefined") profileFields.skills = skills.split(",");
    //create and embaded object for profile social links
    profileFields.social = {};
    if (typeof youtube !== "undefined") profileFields.social.youtube = youtube;
    if (typeof twitter !== "undefined") profileFields.social.twitter = twitter;
    if (typeof linkedin !== "undefined")
      profileFields.social.linkedin = linkedin;
    if (typeof facebook !== "undefined")
      profileFields.social.facebook = facebook;
    if (typeof instagram !== "undefined")
      profileFields.social.instagram = instagram;
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          console.log("profile exist");
          //if the profile exsit update the profile
          Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true }
          )
            .then(profile => res.json(profile))
            .then(err => res.status(400).json(err));
        } else {
          //create new profile
          //check if the handle exist
          Profile.findOne({ handle: profileFields.handle }).then(profile => {
            if (profile) {
              errors.handle = "Handle alread exist";
              res.status(400).json(errors);
            }
            new Profile(profileFields)
              .save()
              .then(profile => res.json(profile))
              .catch(err => res.status(400).json(err));
          });
        }
      })
      .catch(err => res.status(400).json(err));
  }
);

// @route GET api/profile/experience
// @desc add expeirence to router
// @access  protected
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExpeirenceInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
        //add to experience array
        profile.experience.unshift(newExp);
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(400).json(err));
  }
);
// @route GET api/profile/experience
// @desc add expeirence to router
// @access  protected
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          fieldofstudy: req.body.fieldofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };
        //add to experience array
        profile.education.unshift(newEdu);
        profile.save().then(profile => res.json(profile));
      })
      .catch(err => res.status(400).json(err));
  }
);

// @route Delete api/profile/experience/:exp_id
// @desc dele expeirence to router
// @access  protected
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //get remove index
        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);
        console.log(removeIndex);
        //splice the experience out of the array
        if (removeIndex >= 0 && removeIndex < profile.experience.length) {
          profile.experience.splice(removeIndex, 1);
        } else {
          res.status(404).json({ experience: "Experience not found" });
        }

        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => res.status(404).json(err));
      })
      .catch(err =>
        res.status(404).json({ profile: "There is no profile for this user" })
      );
  }
);

// @route Delete api/profile/education/:edu_id
// @desc dele education to router
// @access  protected
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //get remove index
        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);
        console.log(removeIndex);
        //splice the education out of the array and make sure it doesn't remove any random education
        if (removeIndex >= 0 && removeIndex < profile.education.length) {
          profile.education.splice(removeIndex, 1);
        } else {
          res.status(404).json({ education: "Education not found" });
        }

        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => res.status(404).json(err));
      })
      .catch(err =>
        res.status(404).json({ profile: "There is no profile for this user" })
      );
  }
);

// @route Delete api/profile
// @desc dele user and the profile
// @access  protected
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log("trying to delete");
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findByIdAndDelete({ _id: req.user.id })
          .then(() => res.json({ sucess: true }))
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }
);
module.exports = router;

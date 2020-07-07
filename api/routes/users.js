const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/user");
const Article = require("../models/article");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
var cookies = require("cookie-parser");
const multer = require("multer"); //for accepting files ___________________________________________
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //these functions called when file is accepted. null always goes first there
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname); //whatever we put here is the file name
  },
});
const fileFilter = (req, file, cb) => {
  // accept jpg and png reject everything else
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  limits: {
    // only take files over 5mb
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

//___________________________________________________________________________________________ AUTHENTICATION
router.post("/signup", async (req, res, next) => {
  try {
    let user = await User.find({ username: req.body.username });
    if (user.length >= 1) {
      return res.status(409).json({
        error: "Username is already in use", // 409 == conflict
      });
    }
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      const user = new User({
        //Create the user
        _id: new mongoose.Types.ObjectId(),
        password: hash,
        username: req.body.username,
        bio: "Placeholder bio",
        following: [],
        followers: [],
        articles: [],
        userImage: "uploads/defaultUser.png", //default image
      });
      let result = await user.save();
      const token = jwt.sign({ userId: result._id }, "secret", { expiresIn: "1h" });
      res.cookie("JWT", token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //
        httpOnly: false,
      });
      return res.status(201).json({
        message: "login successful",
        userImage: "uploads/defaultUser.png",
      });
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
});

router.post("/login", async (req, res, next) => {
  try {
    let user = await User.find({ username: req.body.username });
    if (user.length < 1) {
      return res.status(409).json({
        error: "Auth Failed", //dont wanna tell them its coz of username coz that would give info to hack
      });
    }
    bcrypt.compare(req.body.password, user[0].password, (err, result) => {
      if (err) {
        return res.status(401).json({
          error: "Auth Failed",
        });
      }
      if (result) {
        const token = jwt.sign({ userId: user[0]._id }, "secret", { expiresIn: "1h" });
        res.cookie("JWT", token, {
          expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), //
          httpOnly: false,
        });
        return res.status(201).json({
          message: "login successful",
          userImage: user[0].userImage,
        });
      }
      return res.status(401).json({
        error: "Auth Failed", //dont wanna tell them its coz of username coz that would give info to hack
      });
    });
  } catch (err) {
    return res.status(500).json({
      error: err,
    });
  }
});

router.post("/checkauth", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt.verify(req.cookies.JWT, "secret", async function (err, user) {
    if (!user) {
      return res.status(401).json({
        message: "Auth Failed",
      });
    }
    let user1 = await User.find({ _id: user.userId }).select(["userImage"]);
    res.status(200).json({
      message: "success",
      userImage: user1[0].userImage,
    });
  });
});

router.post("/logout", (req, res, next) => {
  res.clearCookie("JWT");
  res.status(200).json({
    message: "success",
  });
});

//_______________________________________________________________ PROFILE OPERATIONS
router.get("/userprofile", async (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        return res.status(401).json({
          message: "Auth Failed",
        });
      }
      try {
        var user = await User.find({ _id: currUser.userId });
        if (user.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        var articles = await Article.find({ _id: { $in: user[0].articles } });
        for (let article of articles) {
          article.blocks = article.blocks[0].content; //store main image in here for now till we figure out the problem
        }
        let followerInfo = await User.find({ _id: { $in: user[0].followers } }).select([
          "userImage",
          "username",
        ]);
        let followingInfo = await User.find({ _id: { $in: user[0].following } }).select([
          "userImage",
          "username",
        ]);
        res.status(200).json({
          user: user[0],
          articles: articles.reverse(),
          isUserProfile: true,
          followerInfo: followerInfo,
          followingInfo: followingInfo,
        });
      } catch (err) {
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:username", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        return res.status(401).json({
          message: "Auth Failed",
        });
      }
      try {
        var user = await User.find({ username: req.params.username }).select([
          "username",
          "articles",
          "followers",
          "following",
          "userImage",
        ]);
        var articles = await Article.find({ _id: { $in: user[0].articles } });
        for (let article of articles) {
          article.blocks = article.blocks[0].content; //store main image in here for now till we figure out the problem
        }
        if (user.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        let followerInfo = await User.find({ _id: { $in: user[0].followers } }).select([
          "userImage",
          "username",
        ]);
        let followingInfo = await User.find({ _id: { $in: user[0].following } }).select([
          "userImage",
          "username",
        ]);
        res.status(200).json({
          user: user[0],
          articles: articles.reverse(),
          isUserProfile: user[0]._id == currUser.userId,
          isFollowing: user[0].followers.includes(currUser.userId),
          followerInfo: followerInfo,
          followingInfo: followingInfo,
        });
      } catch (err) {
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/follow", async (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed (no cookie)",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        return res.status(401).json({
          message: "Auth Failed (theres a cookie but jwt expired)",
        });
      }
      try {
        var user = await User.find({ username: req.body.username }).select(["followers"]);
        if (user.length < 1) {
          res.status(500).json({
            message: "user doesnt exist",
          });
        }
        let newfollowers = user[0].followers;
        newfollowers.push(currUser.userId);
        let result = await User.update(
          { username: req.body.username },
          { followers: newfollowers }
        );

        let user1 = await User.find({ _id: currUser.userId }).select([
          "following",
          "userImage",
          "username",
        ]);
        let newfollowing = user1[0].following;
        newfollowing.push(user[0]._id);
        let result1 = await User.update(
          { _id: user1[0]._id },
          { following: newfollowing }
        );
        res.status(200).json({
          message: "success",
          newfollowers: newfollowers,
          username: user1[0].username, // we have to send back the user info to put it in state
          userImage: user1[0].userImage,
          _id: user1[0]._id,
        });
      } catch (err) {
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/unfollow", async (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed (no cookie)",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        return res.status(401).json({
          message: "Auth Failed (theres a cookie but jwt expired)",
        });
      }
      try {
        var user = await User.find({ username: req.body.username }).select(["followers"]);
        if (user.length < 1) {
          res.status(500).json({
            message: "user doesnt exist",
          });
        }
        let newfollowers = user[0].followers;
        newfollowers = newfollowers.filter((follower) => {
          return follower.toString() != currUser.userId.toString();
        });
        let result = await User.update(
          { username: req.body.username },
          { followers: newfollowers }
        );
        let user1 = await User.find({ _id: currUser.userId }).select(["following"]);
        let newfollowing = user1[0].following;
        newfollowing = newfollowing.filter((following) => {
          return following.toString() != user[0]._id.toString();
        });
        let result1 = await User.update(
          { _id: user1[0]._id },
          { following: newfollowing }
        );
        res.status(200).json({
          message: "success",
          _id: currUser.userId,
        });
      } catch (err) {
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/changeimage", upload.single("userImage"), (req, res, next) => {
  // check header or url parameters or post parameters for token
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed (no cookie)",
    });
  }
  // Check token that was passed by decoding token using secret
  jwt.verify(req.cookies.JWT, "secret", function (err, user) {
    if (!user) {
      res.json({
        user: "",
      });
    }
    User.update({ _id: user.userId }, { userImage: req.file.path })
      .exec()
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  });
});

router.get("/", (req, res, next) => {
  User.find()
    .exec()
    .then((user) => {
      if (user.length < 1) {
        res.status(401).json({
          message: "No users",
        });
      }
      res.status(200).json({
        message: user,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:userId", (req, res, next) => {
  User.deleteOne({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "User deleted",
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

module.exports = router;

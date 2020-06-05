const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Article = require("../models/article");
const User = require("../models/user");
const multer = require("multer"); //for accepting files ___________________________________________
const jwt = require("jsonwebtoken");
var cookies = require("cookie-parser");
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

//___________________________________________________________________________________________
router.patch("/create", upload.array("articleImages"), (req, res, next) => {
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
      if (currUser.userId == "5ed6f8413b48773b8261a5fd") {
        return res.status(403).json({});
      }
      try {
        var user = await User.find({ _id: currUser.userId });
        if (user.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        let index = 0;
        let blocks = JSON.parse(req.body.blocks);
        for (block of blocks) {
          if (block.type === "image") {
            block.content = req.files[index].filename;
            index++;
          }
        }
        const article = new Article({
          //Create the article
          _id: new mongoose.Types.ObjectId(),
          title: req.body.title,
          author: user[0].username,
          description: req.body.description,
          date: req.body.date,
          blocks: blocks,
          likedBy: [],
          likes: 0,
          comments: [],
        });
        let result = await article.save();
        let newArticles = user[0].articles;
        newArticles.push(result._id);
        let result1 = await User.update({ _id: user[0]._id }, { articles: newArticles });
        res.status(200).json({
          message: "success",
        });
      } catch (err) {
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:articleId", (req, res, next) => {
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
        let article = await Article.find({ _id: req.params.articleId });
        let articleAuthor = await User.find({ username: article[0].author });
        if (article.length < 1) {
          res.status(500).json({
            message: "article doesnt exist",
          });
        }
        let authors = article[0].comments.map((comment) => {
          return comment.author;
        });
        let result = await User.find()
          .select(["userImage", "username"])
          .where("username")
          .in(authors);
        let authorImages = {};
        for (let author of result) {
          authorImages[author.username] = author.userImage;
        }
        for (let comment of article[0].comments) {
          comment.userImage = authorImages[comment.author];
        }
        let user = await User.find({ _id: currUser.userId });
        if (user.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        res.status(200).json({
          ...article,
          userImage: articleAuthor[0].userImage,
          isLikedBy: article[0].likedBy.includes(user[0].username),
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

router.get("/", (req, res, next) => {
  Article.find()
    .exec()
    .then((articles) => {
      if (articles.length < 1) {
        return res.status(401).json({
          message: "No articles",
        });
      }
      res.status(200).json({
        articles,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get(
  "/previews/:isCustom/:maxArticles/:typeOfSort/:searchterm?",
  (req, res, next) => {
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
          let user1 = await User.find({ _id: currUser.userId });
          let sortType = req.params.typeOfSort === "Date" ? "_id" : "likes";
          let articles;
          let count;
          if (req.params.isCustom == "true") {
            let authorNames = await User.find({
              _id: { $in: user1[0].following },
            }).select(["username"]);
            authorNames = authorNames.map((author) => author.username); //we want to get the names of all the users that are being followed
            articles = await Article.find({
              author: { $in: authorNames },
              $or: [
                { title: { $regex: req.params.searchterm || "", $options: "i" } },
                { description: { $regex: req.params.searchterm || "", $options: "i" } },
              ],
            })
              .sort({ [sortType]: -1 })
              .skip(req.params.maxArticles - 15)
              .limit(15)
              .select(["author", "title", "likedBy", "description", "date", "blocks"]);
            count = await Article.count({
              author: { $in: authorNames },
              $or: [
                { title: { $regex: req.params.searchterm || "", $options: "i" } },
                { description: { $regex: req.params.searchterm || "", $options: "i" } },
              ],
            });
          } else {
            articles = await Article.find({
              author: { $ne: user1[0].username },
              $or: [
                { title: { $regex: req.params.searchterm || "", $options: "i" } },
                { description: { $regex: req.params.searchterm || "", $options: "i" } },
              ],
            })
              .sort({ [sortType]: -1 })
              .skip(req.params.maxArticles - 15)
              .limit(15)
              .select(["author", "title", "likedBy", "description", "date", "blocks"]);
            count = await Article.count({
              author: { $ne: user1[0].username },
              $or: [
                { title: { $regex: req.params.searchterm || "", $options: "i" } },
                { description: { $regex: req.params.searchterm || "", $options: "i" } },
              ],
            });
          }
          for (let article of articles) {
            article.blocks = article.blocks[0].content;
          }
          res.status(200).json({
            articles,
            count,
          });
        } catch (err) {
          res.status(500).json({
            error: err,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({
          error: err,
        });
      });
  }
);

router.post("/comment/:articleId", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        res.json({
          message: "user doesnt exist",
        });
      }
      if (currUser.userId == "5ed6f8413b48773b8261a5fd") {
        return res.status(403).json({});
      }
      try {
        let user1 = await User.find({ _id: currUser.userId });
        if (user1.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        let article = await Article.find({ _id: req.params.articleId });
        if (article.length < 1) {
          res.status(500).json({
            message: "article doesnt exist",
          });
        }
        let newComments = article[0].comments;
        let newComment = {
          author: user1[0].username,
          content: req.body.content,
          date: req.body.date,
          userImage: user1[0].userImage,
        };
        newComments.unshift(newComment);
        let result = await Article.update(
          { _id: article[0]._id },
          { comments: newComments }
        );
        res.status(200).json({
          message: "success",
          newComment: newComment,
        });
      } catch (err) {
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/like/:articleId", (req, res, next) => {
  if (!req.cookies.JWT) {
    return res.status(401).json({
      message: "Auth Failed",
    });
  }
  jwt
    .verify(req.cookies.JWT, "secret", async function (err, currUser) {
      if (!currUser) {
        res.json({
          user: "",
        });
      }
      try {
        let user1 = await User.find({ _id: currUser.userId });
        if (user1.length < 1) {
          res.status(401).json({
            message: "user doesnt exist",
          });
        }
        let article = await Article.find({ _id: req.params.articleId });
        if (article.length < 1) {
          res.status(401).json({
            message: "article doesnt exist",
          });
        }
        let newLikes = article[0].likedBy;
        newLikes.push(user1[0].username);
        let result = await Article.update(
          { _id: article[0]._id },
          { likedBy: newLikes, likes: newLikes.length }
        );
        res.status(200).json({
          message: "success",
          newLike: user1[0].username,
        });
      } catch (err) {
        res.status(500).json({
          error: err,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.delete("/:articleId", (req, res, next) => {
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
        let result = await Article.deleteOne({ _id: req.params.articleId });
        let user = await User.find({ _id: currUser.userId });
        let newArticles = user[0].articles;
        newArticles = newArticles.filter((article) => {
          return article != req.params.articleId;
        });
        let result1 = await User.update({ _id: user[0]._id }, { articles: newArticles });
        res.status(200).json({
          message: "article deleted",
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

module.exports = router;

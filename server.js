if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const mongoose = require("mongoose");
const blogModel = require("./models/blogModel");
const _ = require("lodash");
const register = require("./routes/register");
const login = require("./routes/login");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const app = express();
const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", () => {
  console.log("Connected to MongoDB successfully");
});

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

app.use("/register", register);
app.use("/login", login);

app.get("/", auth, async (req, res) => {
  try {
    const posts = await blogModel
      .find()
      .sort({ date: -1 })
      .limit(10)
      .populate("author", ["username"])
      .exec();
    res.render("home", {
      pageTitle: "The Daily Journal",
      posts: posts,
    });
  } catch (e) {
    res.sendStatus(500);
    console.log(e);
  }
});
app.get("/compose", auth, (req, res) => {
  res.render("compose", {
    pageTitle: "The Daily Journal | Compose",
    postEndpoint: "/compose",
    title: "Compose",
  });
});
app.get("/posts", auth, async (req, res) => {
  const searchOptions = {};
  if (req.query.title !== null || req.query.title !== "") {
    searchOptions.title = new RegExp(req.query.title, "i");
  }
  try {
    const posts = await blogModel
      .find(searchOptions)
      .sort({ date: -1 })
      .populate("author", ["username"])
      .exec();
    res.render("posts", {
      pageTitle: "The Daily Journal | All Posts",
      posts: posts,
      searchOptions: req.query.title,
      title: "All posts",
      url: "/posts",
    });
  } catch (e) {
    res.sendStatus(404);
    console.log(e);
  }
});
app.get("/posts/me", auth, async (req, res) => {
  const searchOptions = { author: req.token };
  if (req.query.title !== null || req.query.title !== "") {
    searchOptions.title = new RegExp(req.query.title, "i");
  }
  try {
    const posts = await blogModel
      .find(searchOptions)
      .sort({ date: -1 })
      .populate("author", ["username"])
      .exec();
    res.render("posts", {
      pageTitle: "The Daily Journal | My Posts",
      posts: posts,
      searchOptions: req.query.title,
      title: "My posts",
      url: "/posts/me",
    });
  } catch (e) {
    res.sendStatus(404);
    console.log(e);
  }
});
app.get("/posts/:title", auth, (req, res) => {
  let post = req.post;
  res.render("post", {
    post: post,
    pageTitle: "The Daily Journal | Posts | " + post.title,
    isAuthorized: req.token === post.author.id.toString(),
  });
});
app.delete("/posts/:title", auth, async (req, res) => {
  let post = req.post;
  try {
    await post.remove();
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
});
app.get("/posts/:title/edit", auth, (req, res) => {
  let post = req.post;
  if (post.author.id.toString() !== req.token.toString()) {
    return res.redirect("/posts");
  }
  res.render("compose", {
    desc: post.desc,
    pageTitle: "The Daily Journal | Post Edit | " + post.title,
    postEndpoint: `/posts/${post.postLinkTitle}/edit`,
    title: "Edit Blog",
  });
});
app.post("/posts/:title/edit", auth, async (req, res) => {
  let post = req.post;
  if (post.author.id.toString() !== req.token.toString()) {
    return res.redirect("/posts");
  }
  post.desc = req.body.desc;
  try {
    await post.save();
    res.redirect(`/posts/${post.postLinkTitle}`);
  } catch (error) {
    res.sendStatus(500);
  }
});
app.post("/compose", auth, async (req, res) => {
  try {
    const post = new blogModel({
      title: req.body.title.trim(),
      postLinkTitle: _.kebabCase(req.body.title.trim()),
      desc: req.body.desc,
      author: req.token,
    });
    await post.save();
    res.redirect("/");
  } catch (error) {
    res.sendStatus(500);
    console.log(error.message);
  }
});
app.param("title", async (req, res, next, title) => {
  try {
    req.post = await blogModel
      .findOne({ postLinkTitle: title })
      .populate("author", ["username"]);
    next();
  } catch (e) {
    res.status(404).render("error404", { pageTitle: "Page Not Found....!" });
  }
});
app.get("*", auth, function (req, res) {
  res.status(404).render("error404", { pageTitle: "Page Not Found....!" });
});
app.listen(port, () => {
  console.log("Server is hosted at http://192.168.31.5:" + port);
});

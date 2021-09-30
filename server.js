const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const mongoose = require("mongoose");
const blogModel = require("./models/blog-model");

const app = express();
const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/firstdb")
.then(()=>{console.log("Connection Successful")})
.catch(err => console.log(err));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.set("layout", "./layouts/layout");

app.get("/",async (req, res) => {
const posts = await blogModel.find();
  res.render("home", { pageTitle: "The Daily Journal", posts: posts });
});
app.get("/contact", (req, res) => {
  res.render("contact", { pageTitle: "The Daily Journal | Contact" });
});
app.get("/about", (req, res) => {
  res.render("about", { pageTitle: "The Daily Journal | About" });
});
app.get("/compose", (req, res) => {
  res.render("compose", { pageTitle: "The Daily Journal | Compose" });
});
app.get("/posts",async (req, res) => {
  const posts = await blogModel.find();
  res.render("posts", { posts: posts, pageTitle: "The Daily Journal | Posts" });
});
app.get("/posts/:title",async (req, res) => {
  try {
    req.params.title = req.params.title
      .trim()
      .replace("-", " ")
      .toLocaleLowerCase();
    let post = await blogModel.findOne({title: req.params.title});
    res.render("post", {
      post: post,
      pageTitle: "The Daily Journal | Posts | " + post.title,
    });
  } catch (e) {
    res.status(404).render('error404',{pageTitle: "Page Not Found....!"})
  }
});
app.post("/compose",async (req, res) => {
  const post = new blogModel({
    title: req.body.title.trim(),
    desc: req.body.desc,
    author: req.body.author,
    date: new Date().toLocaleDateString("en-IN"),
  });
  post.save();
  res.redirect("/");
});
app.get('*', function(req, res){
  res.status(404).render('error404',{pageTitle: "Page Not Found....!"})
});
app.listen(port, () => {
  console.log("Server is hosted at http://192.168.31.5:" + port);
});
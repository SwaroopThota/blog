const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const mongoose = require("mongoose");
const blogModel = require("./models/blog-model");
const _ = require("lodash");

const app = express();
const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/firstdb")
.then(()=>{console.log("Connection Successful")})
.catch(err => console.log(err));

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("layout", "./layouts/layout");

app.get("/",async (req, res) => {
const posts = await blogModel.find().limit(10).sort({'_id':-1});
  res.render("home", { pageTitle: "The Daily Journal", posts: posts });
});
app.get("/contact", (req, res) => {
  res.render("contact", { pageTitle: "The Daily Journal | Contact" });
});
app.get("/about", (req, res) => {
  res.render("about", { pageTitle: "The Daily Journal | About" });
});
app.get("/compose", (req, res) => {
  res.render("compose", { pageTitle: "The Daily Journal | Compose", postEndpoint: "/compose" });
});
app.get("/posts",async (req, res) => {
  const posts = await blogModel.find().sort({'_id':-1});
  res.render("posts", { posts: posts, pageTitle: "The Daily Journal | Posts" });
});
app.get("/posts/:title",(req, res) => {
    let post = req.post;
    res.render("post", {
      post: post,
      pageTitle: "The Daily Journal | Posts | " + post.title,
    });
});
app.delete("/posts/:title", async (req, res) => {
  let post = req.post;
  try{
    await post.remove();
    res.sendStatus(200);
  }catch(e){
    res.sendStatus(500);
  }
});
app.get("/posts/:title/edit",(req, res) =>{
    let post = req.post;
    res.render("compose", {
      desc: post.desc,
      author: post.author,
      pageTitle: "The Daily Journal | Post Edit | " + post.title,
      postEndpoint: `/posts/${post.postLinkTitle}/edit`,
    });
})
app.post("/posts/:title/edit", async (req, res) =>{
    let post = req.post;
    post.desc = req.body.desc;
    await post.save();
    res.redirect(`/posts/${post.postLinkTitle}`);
})
app.post("/compose",async (req, res) => {
  const post = new blogModel({
    title: req.body.title.trim(),
    postLinkTitle: _.kebabCase(req.body.title.trim()),
    desc: req.body.desc,
    author: (req.body.author!== "")?req.body.author:undefined
  });
  post.save();
  res.redirect("/");
});
app.param("title", async (req, res,next,title) => {
  try {
    req.post = await blogModel.findOne({postLinkTitle: req.params.title});
    next();
  } catch (e) {
      res.status(404).render('error404',{pageTitle: "Page Not Found....!"})
    }
})
app.get('*', function(req, res){
  res.status(404).render('error404',{pageTitle: "Page Not Found....!"})
});
app.listen(port, () => {
  console.log("Server is hosted at http://192.168.31.5:" + port);
});
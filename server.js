const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const mongoose = require("mongoose");
const blogModel = require("./models/blog-model");
const _ = require("lodash");

const app = express();
const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/firstdb")
const db = mongoose.connection;
db.on('error', err =>console.error(err));
db.once('open',()=>{console.log("Connected to MongoDB successfully")})

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("layout", "./layouts/layout");

app.get("/",async (req, res) => {
  const searchOptions = {};
  if(req.query.title !== null || req.query.title !== ''){
    searchOptions.title = new RegExp(req.query.title,'i');
  }
  try{
    const posts = await blogModel.find(searchOptions).sort({'_id':-1}).limit(10).exec();
  res.render("home", { pageTitle: "The Daily Journal", posts: posts, searchOptions: req.query.title, url: '/' });
  }catch (e) {
    res.sendStatus(500);
    console.log(e)
  }
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
  const searchOptions = {};
  if(req.query.title !== null || req.query.title !== ''){
    searchOptions.title = new RegExp(req.query.title,'i');
  }
  try{
    const posts = await blogModel.find(searchOptions).sort({'_id':-1}).exec();
    res.render("posts", { pageTitle: "The Daily Journal | All Posts", posts: posts, searchOptions: req.query.title, url: '/posts' });
  }catch (e) {
    res.sendStatus(404);
    console.log(e)
  }
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
    post.author = req.body.author;
    try {
      await post.save();
      res.redirect(`/posts/${post.postLinkTitle}`);
    } catch (error) {
      res.sendStatus(500);
    }
})
app.post("/compose",async (req, res) => {
  try {
    const post = new blogModel({
      title: req.body.title.trim(),
      postLinkTitle: _.kebabCase(req.body.title.trim()),
      desc: req.body.desc,
      author: (req.body.author!== "")?req.body.author:undefined
    });
    post.save();
    res.redirect("/");
  } catch (error) {
    res.sendStatus(500);
  }
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
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.set("layout", "./layouts/layout");

const posts = [
  {
    title: "Breaking News",
    desc: "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Provident, necessitatibus consectetur cupiditate ullam voluptatibus unde. Cumque nemo neque dolorum quidem obcaecati officiis ipsa, labore nam ipsam nihil velit, sit magnam doloribus earum aut est placeat quas provident optio delectus repellat vel itaque! Odit atque molestiae vitae, laudantium non voluptates dolorum.aborum nulla asperiores reiciendis pariatur ipsam, incidunt temporibus minima doloribus aspernatur facere harum id eveniet voluptas expedita, esse explicabo dignissimos a numquam beatae repellendus quam alias obcaecati similique ut! Molestiae eaque optio ad eius officia mollitia incidunt, sed, officiis perferendis, nemo iure illum repellat rem. Explicabo eaque possimus laboriosam magnam ducimus minima temporibus quidem recusandae consectetur maxime, repellendus sequi doloribus sed labore culpa, nemo placeat velit optio doloremque. Veritatis, placeat. Dolorum rerumeum harum veniam, corporis quisquam fugit dolor, nulla incidunt illum doloribus sapiente!",
    author: "T J Swaroop",
    on: "18/9/2021",
  },
];

app.listen(port, () => {
  console.log("Server is hosted at http://192.168.31.5:" + port);
});

app.get("/", (req, res) => {
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
app.get("/posts", (req, res) => {
  res.render("posts", { posts: posts, pageTitle: "The Daily Journal | Posts" });
});
app.get("/posts/:title", (req, res) => {
  req.params.title = req.params.title
    .trim()
    .replace("-", " ")
    .toLocaleLowerCase();
  let post = posts.find((post) => post.title.toLowerCase() == req.params.title);
  if (post !== undefined) {
    res.render("post", {
      post: post,
      pageTitle: "The Daily Journal | Posts | " + post.title,
    });
  } else {
    res.sendStatus(404);
  }
  //   console.log(post);
});
app.post("/compose", (req, res) => {
  const post = {
    title: req.body.title.trim(),
    desc: req.body.desc,
    author: req.body.author,
    on: new Date().toLocaleDateString("en-IN"),
  };
  posts.unshift(post);
  res.redirect("/");
});

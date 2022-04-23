if (process.env.NODE_ENV !== "production") require("dotenv").config();
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const _ = require("lodash");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 5000;

//routes and middleware
const register = require("./routes/register");
const login = require("./routes/login");
const compose = require("./routes/compose");
const posts = require("./routes/posts");
const auth = require("./middleware/auth");

//mongodb and mongoose setup
const mongoose = require("mongoose");
const blogModel = require("./models/blogModel");
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on("error", (err) => console.error(err));
db.once("open", () => console.log("Connected to MongoDB successfully"));

//app and middileware setup
const app = express();
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

//init routes
app.use("/register", register);
app.use("/login", login);
app.use("/compose", compose);
app.use("/posts", posts);

app.get("/", auth, async (req, res) => {
  try {
    const posts = await blogModel
      .find()
      .populate("author", ["username"])
      .sort({ date: "desc" })
      .limit(10);
    res.render("home", {
      pageTitle: "The Daily Journal",
      posts: posts,
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).render("error404", {
      pageTitle: "Sever Error....!",
      code: 500,
      msg: "Internal server error",
      imgUrl:
        "https://media3.giphy.com/media/H7wajFPnZGdRWaQeu0/200w.webp?cid=ecf05e4704ipiq5hlzkysb22npqo18055y1vx58pqee148ek&rid=200w.webp&ct=g",
    });
  }
});

app.get("*", auth, function (req, res) {
  res.status(404).render("error404", {
    pageTitle: "Page Not Found....!",
    code: 404,
    msg: "Page not found",
    imgUrl: "https://media3.giphy.com/media/hEc4k5pN17GZq/giphy.gif",
  });
});

app.listen(port, () => console.log("Server is listening at port:" + port));

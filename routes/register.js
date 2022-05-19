if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const router = require("express").Router();
const bcryptjs = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const jsonwebtoken = require("jsonwebtoken");
const userModel = require("../models/userModel");

router.get("/", (req, res) => {
  if (req.cookies["blog-auth-token"]) {
    return res.redirect("/");
  }
  res.render("register", {
    pageTitle: "The Daily Journal | Register",
    isLoggedIn: false,
  });
});

router.post(
  "/",
  body("username", "Please enter a valid username.").notEmpty(),
  body("email", "Please enter valid email").isEmail().notEmpty(),
  body("pass", "Enter a valid password").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("register", {
        pageTitle: "The Daily Journal | Register",
        username,
        email,
        isLoggedOut: true,
        errors: errors.array(),
      });
    }
    const { username, email, pass, cpass } = req.body;
    if (pass !== cpass) {
      return res.render("register", {
        pageTitle: "The Daily Journal | Register",
        username,
        email,
        isLoggedOut: true,
        errors: "Passwords do not match.",
      });
    }
    try {
      let user = await userModel.findOne({ email });
      if (user) {
        return res.render("register", {
          pageTitle: "The Daily Journal | Register",
          username,
          email,
          isLoggedOut: true,
          errors: "User with the same email already exists.",
        });
      }
      const salt = await bcryptjs.genSalt(10);
      user = new userModel({
        username,
        email,
        password: await bcryptjs.hash(pass, salt),
      });
      await user.save();
      const payload = {
        user: {
          id: user.id,
        },
      };
      const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET_KEY);
      res.cookie("blog-auth-token", token, {
        maxAge: 1000000,
      });
      res.redirect("/");
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
  }
);

module.exports = router;

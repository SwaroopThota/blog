if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const bcryptjs = require("bcryptjs");
const { check, validationResult, body } = require("express-validator");
const jsonwebtoken = require("jsonwebtoken");
const auth = require("../middleware/auth");
const userModel = require("../models/userModel");

const router = require("express").Router();

router.get("/", (req, res) => {
  if (req.cookies["blog-auth-token"]) {
    return res.redirect("/");
  }
  res.render("login", {
    pageTitle: "The Daily Journal | Login",
    isLoggedOut: true,
  });
});

router.post(
  "/",
  body("email", "Please enter valid email").isEmail().notEmpty(),
  body("pass", "Enter a valid password").notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("login", {
        pageTitle: "The Daily Journal | Login",
        errors: errors.array(),
        isLoggedOut: true,
      });
    }
    const { email, pass } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.render("login", {
        pageTitle: "The Daily Journal | Login",
        errors: "Invalid Credentials",
        isLoggedOut: true,
      });
    }
    if (!(await bcryptjs.compare(pass, user.password))) {
      return res.render("login", {
        pageTitle: "The Daily Journal | Login",
        errors: "Invalid Credentials",
        isLoggedOut: true,
      });
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "30d",
    });
    res.cookie("blog-auth-token", token, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.redirect("/");
  }
);

module.exports = router;

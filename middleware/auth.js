if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const jsonwebtoken = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.cookies["blog-auth-token"];
  if (!token) {
    return res.redirect("/login");
  }
  req.token = jsonwebtoken.verify(token, process.env.JWT_SECRET_KEY).user.id;
  next();
};

module.exports = auth;

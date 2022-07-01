const auth = require("../middleware/auth");
const blogModel = require("../models/blogModel");

const router = require("express").Router();

router.get("/", auth, async (req, res) => {
  const searchOptions = {};
  if (req.query.title !== null || req.query.title !== "") {
    searchOptions.title = new RegExp(req.query.title, "i");
  }
  try {
    const posts = await blogModel
      .find(searchOptions)
      .sort({ date: "desc" })
      .populate("author", ["username"]);
    res.render("posts", {
      pageTitle: "The Daily Journal | All Posts",
      posts: posts,
      searchOptions: req.query.title,
      title: "All posts",
      url: "/posts",
      isLoggedIn: req.isLoggedIn
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
router.get("/me", auth, async (req, res) => {
  if(!req.isLoggedIn) return res.redirect('/')
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
    res.render('posts', {
		pageTitle: 'The Daily Journal | My Posts',
		posts: posts,
		searchOptions: req.query.title,
		title: 'My posts',
		url: '/posts/me',
		isLoggedIn: req.isLoggedIn,
	})
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
router.get("/:title", auth, (req, res) => {
  let post = req.post;
  res.render('post', {
		post: post,
		pageTitle: 'The Daily Journal | Posts | ' + post.title,
		isAuthorized: req.isLoggedIn && req.token === post.author.id.toString(),
		isLoggedIn: req.isLoggedIn
  })
});
router.delete("/:title", auth, async (req, res) => {
  try {
    let post = req.post;
    await post.remove();
    res.redirect("/posts");
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
router.get("/:title/edit", auth, (req, res) => {
  let post = req.post;
  if (!req.isLoggedIn && post.author.id.toString() !== req.token.toString()) {
    return res.redirect("/posts");
  }
  res.render('compose', {
		desc: post.desc,
		pageTitle: 'The Daily Journal | Post Edit | ' + post.title,
		postEndpoint: `/posts/${post.postLinkTitle}/edit`,
		title: 'Edit Blog',
		isLoggedIn: req.isLoggedIn,
    lang: post.lang
  })
});
router.post("/:title/edit", auth, async (req, res) => {
  let post = req.post;
  if (!req.isLoggedIn && post.author.id.toString() !== req.token.toString()) {
    return res.redirect("/posts");
  }
  post.lang = req.body.lang
  post.desc = req.body.desc;
  try {
    await post.save();
    res.redirect(`/posts/${post.postLinkTitle}`);
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
router.param("title", async (req, res, next, title) => {
  try {
    req.post = await blogModel
      .findOne({ postLinkTitle: title })
      .populate("author", ["username"]);
    next();
  } catch (e) {
    res.status(404).render("error404", {
      pageTitle: "Page Not Found....!",
      code: 404,
      msg: "Page not found",
      imgUrl: "https://media3.giphy.com/media/hEc4k5pN17GZq/giphy.gif",
    });
  }
});

module.exports = router;

const auth = require('../middleware/auth')
const blogModel = require('../models/blogModel')
const _ = require('lodash')
const router = require('express').Router()

router.get('/', auth, (req, res) => {
	if (!req.isLoggedIn) return res.redirect('/')
	res.render('compose', {
		pageTitle: 'NFN | Compose',
		postEndpoint: '/compose',
		title: 'Compose',
		isLoggedIn: req.isLoggedIn,
	})
})

router.post('/', auth, async (req, res) => {
	try {
		if (!req.isLoggedIn) return res.redirect('/')
		const post = new blogModel({
			title: req.body.title.trim(),
			postLinkTitle: _.kebabCase(req.body.title.trim()),
			desc: req.body.desc,
			author: req.token,
			lang: req.body.lang,
		})
		await post.save()
		res.redirect('/posts/' + post.postLinkTitle)
	} catch (err) {
		console.log(err.message)
		res.status(500).render('error404', {
			pageTitle: 'Sever Error....!',
			code: 500,
			msg: 'Internal server error',
			imgUrl: 'https://media3.giphy.com/media/H7wajFPnZGdRWaQeu0/200w.webp?cid=ecf05e4704ipiq5hlzkysb22npqo18055y1vx58pqee148ek&rid=200w.webp&ct=g',
		})
	}
})

module.exports = router

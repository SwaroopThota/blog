if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}
const jsonwebtoken = require('jsonwebtoken')

const auth = (req, res, next) => {
	const token = req.cookies['blog-auth-token']
	if (!token) {
		req.isLoggedIn = false
		next()
		return
	}
	try {
		req.token = jsonwebtoken.verify(
			token,
			process.env.JWT_SECRET_KEY
		).user.id
		req.isLoggedIn = true
		next()
	} catch (err) {
		console.log(err.message)
		res.status(500).render('error404', {
			pageTitle: 'Unauthorized login....!',
			code: 401,
			msg: 'Unauthorized User',
			imgUrl: 'https://media3.giphy.com/media/H7wajFPnZGdRWaQeu0/200w.webp?cid=ecf05e4704ipiq5hlzkysb22npqo18055y1vx58pqee148ek&rid=200w.webp&ct=g',
		})
	}
}

module.exports = auth

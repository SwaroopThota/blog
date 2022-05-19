if (process.env.NODE_ENV !== 'production') require('dotenv').config()
const mongoose = require('mongoose')
const blogModel = require('./models/blogModel')
const fs = require('fs')

mongoose.connect(process.env.MONGODB_URI)
const db = mongoose.connection

db.once('open', () => console.log('MongoDB connection successfull'))
const fun = async () =>
	fs.writeFileSync(
		'blogs.json',
		JSON.stringify(await blogModel.find().sort({ date: 1 }))
	)
fun()

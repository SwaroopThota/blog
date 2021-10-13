const mongoose = require("mongoose")

let todoSchema = {
    title: { type: String,required: true},
    postLinkTitle: { type: String, required: true},
    desc: { type: String, required: true},
    author: { type: String, required: true ,default: 'Swaroop'},
    date: { type: String, required: true, default: new Date().toLocaleDateString("en-IN")}
}

module.exports = mongoose.model('blogModel',mongoose.Schema(todoSchema));
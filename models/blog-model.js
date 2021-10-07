const mongoose = require('mongoose');

const blogSchema = mongoose.Schema({
    title:{type:'string', required:true},
    postLinkTitle:{type:'string', required:true},
    desc:{type:'string', required:true},
    author:{type:'string', required:true},
    date:{type:'string', required:true}
})

module.exports = mongoose.model("blogModel",blogSchema);
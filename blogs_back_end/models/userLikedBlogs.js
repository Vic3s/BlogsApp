const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const userLikedSchema = new Schema({

    blog_id: {
        type: String, 
        require: true
    },

}, { timestamps: true });

const userLikedBlogs = mongoose.model('userLikedBlogs', userLikedSchema);

module.exports = userLikedBlogs;
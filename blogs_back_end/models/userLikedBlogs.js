const mongoose = require("mongoose");
const { type } = require("os");
const Schema = mongoose.Schema;


const userLikedSchema = new Schema({

    blogs_liked: {
        type: Array, 
        require: true
    },
    user_id: {
        type: String,
        require: true
    }

}, { timestamps: true });

const userLikedBlogs = mongoose.model('user_liked_blogs', userLikedSchema);

module.exports = userLikedBlogs;
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const blogSchema = new Schema({

    title: {
        type: String, 
        require: true
    },
    snippet: {
        type: String,
        require: true
    },
    body: {
        type: String,
        require: true
    },
    author: {
        type: String,
        require: true
    },
    image:
    {
        data: Buffer,
        contentType: String
    },
    likes: {
        type: Number,
        require: true
    }

}, { timestamps: true });

const Blog = mongoose.model('blogs', blogSchema);

module.exports = Blog;
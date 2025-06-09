const mongoose = require("mongoose");

const Account = require("../models/accounts.js");
const Blogs = require("../models/blog.js");
const UserLikedBlogs = require("../models/userLikedBlogs.js")

const path = require("path");
const fs = require("fs");

const topicRoutes = require("./topics-routes.js")

const getBlogs = (req, res) => {

    Blogs.find().sort({ createdAt: -1 })
    .then(async (response) => {
        let blogsObj = await Promise.all(response.map(async (item) => {
            let authorName = "Unknown(Error)"
            let likedByCurrUser = false;
            try{
                const author_ = await Account.findOne({_id: item.author})

                if(author_){    
                    authorName = author_.name;
                }
                const UserLikedBlogsObject = await UserLikedBlogs.findOne({user_id: req.user._id})

                likedByCurrUser = UserLikedBlogsObject.blogs_liked.includes(item._id) ? true : false;
            }catch(err){
                console.log("Error with fetching the author: ", err)
            }
            
            const buffer = Buffer.from(item.image.data); 
            const base64 = buffer.toString('base64');

            return {
                _id: item._id, 
                title: item.title, 
                snippet: item.snippet, 
                body: item.body, 
                author: authorName, 
                image: `data:${item.image.contentType};base64,${base64}`,
                likes: item.likes,
                likedByCurrUser: likedByCurrUser,
                topics: item.topics,
                createdAt: item.createdAt
            }
        }))
    res.send(blogsObj)
    }).catch(err => console.log(err))
}

const getBlogsLimit = (req, res) => {

    const searchQuery = req.query.query;

    Blogs.find({title: { $regex: searchQuery, $options: 'i'} }).limit(10).sort({ createdAt: -1 })
    .then(async (response) => {
        let blogsObj = await Promise.all(response.map(async (item) => {
            let authorName = "Unknown(Error)"
            let likedByCurrUser = false;
            try{
                const author_ = await Account.findOne({_id: item.author})

                if(author_){    
                    authorName = author_.name;
                }
                const UserLikedBlogsObject = await UserLikedBlogs.findOne({user_id: req.user._id})

                likedByCurrUser = UserLikedBlogsObject.blogs_liked.includes(item._id) ? true : false;
            }catch(err){
                console.log("Error with fetching the author: ", err)
            }
            
            const buffer = Buffer.from(item.image.data); 
            const base64 = buffer.toString('base64');
            
            return {
                _id: item._id, 
                title: item.title, 
                snippet: item.snippet, 
                body: item.body, 
                author: authorName, 
                image: `data:${item.image.contentType};base64,${base64}`,
                likes: item.likes,
                likedByCurrUser: likedByCurrUser,
                topics: item.topics,
                createdAt: item.createdAt
            }
        }))
    res.send(blogsObj)
    }).catch(err => console.log(err))
}


const getAuthorBlogs = (req, res) => {

    const authorId = req.params.id;

    Blogs.find({author: authorId}).sort({ createdAt: -1 })
    .then(async (response) => {
        let blogsObj = await Promise.all(response.map(async (item) => {
            let authorName = "Unknown(Error)"
            let likedByCurrUser = false;
            try{
                const author_ = await Account.findOne({_id: item.author})

                if(author_){    
                    authorName = author_.name;
                }
                const UserLikedBlogsObject = await UserLikedBlogs.findOne({user_id: req.user._id})

                likedByCurrUser = UserLikedBlogsObject.blogs_liked.includes(item._id) ? true : false;
            }catch(err){
                console.log("Error with fetching the author: ", err)
            }
            
            const buffer = Buffer.from(item.image.data); 
            const base64 = buffer.toString('base64');

            return {
                _id: item._id, 
                title: item.title, 
                snippet: item.snippet, 
                body: item.body, 
                author: authorName, 
                image: `data:${item.image.contentType};base64,${base64}`,
                likes: item.likes,
                likedByCurrUser: likedByCurrUser,
                topics: item.topics,
                createdAt: item.createdAt
            }
        }))
    res.send(blogsObj)
    }).catch(err => console.log(err))
}


const getBlogDetails = async (req, res) => {

    const id = req.params.id;
    
    const blog = await Blogs.findOne({_id: id})
    .then(async result => {return result})
    .catch((err) => { res.status(404).json({error: "* Blog Doesnt exist! *"})});

    const author = await Account.findOne({_id: blog.author})
    .then(result => {return result})
    .catch(err => console.log(err))
    
    const authorBuffer = Buffer.from(author.profilePic.data);
    const authorBase64 = authorBuffer.toString('base64');

    const buffer = Buffer.from(blog.image.data); 
    const base64 = buffer.toString('base64');

    const UserLikedBlogsObject = await UserLikedBlogs.findOne({user_id: req.user._id})

    const likedByCurrUser = UserLikedBlogsObject.blogs_liked.includes(blog._id) ? true : false;

    let blogObj = {
        blog_id: blog._id,
        blog_title: blog.title,
        blog_snippet: blog.snippet,
        blog_body: blog.body,
        blog_author_name: author.name,
        blog_author_profilepic: `data:${author.profilePic.contentType};base64,${authorBase64}`,
        blog_image: `data:${blog.image.contentType};base64,${base64}`,
        blog_likes: blog.likes,
        likedByCurrUser: likedByCurrUser,
        blog_topics: blog.topics,
        blog_date: blog.createdAt
    }
    res.send(blogObj)

}

const blogsFilterdByTopic = async (req, res) => {
    let topicsList = topicRoutes.getSingleTopicList(req.params.topic);

    Blogs.find({topics: {$in: topicsList}}).sort({ createdAt: -1 })
    .then(async (response) => {
        let blogsObj = await Promise.all(response.map(async (item) => {
            let authorName = "Unknown(Error)"
            let likedByCurrUser = false;
            try{
                const author_ = await Account.findOne({_id: item.author})

                if(author_){    
                    authorName = author_.name;
                }
                const UserLikedBlogsObject = await UserLikedBlogs.findOne({user_id: req.user._id})

                likedByCurrUser = UserLikedBlogsObject.blogs_liked.includes(item._id) ? true : false;
            }catch(err){
                console.log("Error with fetching the author: ", err)
            }
            
            const buffer = Buffer.from(item.image.data); 
            const base64 = buffer.toString('base64');
            
            return {
                _id: item._id, 
                title: item.title, 
                snippet: item.snippet, 
                body: item.body, 
                author: authorName, 
                image: `data:${item.image.contentType};base64,${base64}`,
                likes: item.likes,
                likedByCurrUser: likedByCurrUser,
                topics: item.topics,
                createdAt: item.createdAt
            }
        }))
    res.send(blogsObj)
    }).catch(err => console.log(err))
}

const createBlog = (req, res) => {

    const root_dir = __dirname.slice(0, __dirname.length - 7)
    const newBlogObj = {
        title: req.body.title, 
        snippet: req.body.snippet,
        body: req.body.body, 
        author: req.user._id,
        image: {
            data: fs.readFileSync(path.join(root_dir + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        },
        likes: 0,
        topics: req.body.topics.split("-"),
    };

    Blogs.create(newBlogObj)
    .then((err, blog) => {
        if(err){
            console.log(err)
        }else{
            blog.save()
            .then((result) => res.status(201).json({ message: 'Blog created' }))
            .catch((err) => console.log(err));
        }  
    })
}

module.exports = { getBlogs, getBlogsLimit, getAuthorBlogs, getBlogDetails, blogsFilterdByTopic, createBlog}
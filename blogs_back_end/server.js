require("dotenv").config();

//Middleware

const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const JsonMiddleware = express.json();

//MODELS

const Account = require("./models/accounts");
const Blogs = require("./models/blog.js");
const UserLikedBlogs = require("./models/userLikedBlogs.js");
const CookieAuth = require("./public/JWT/CookieJwtAuth").CookieAuth;

//Additional files
const topics = require("./public/json/topics.json");

// Routes imports

const blogRoutes = require("./routes/blog-routes.js");
const accountRelatedRoutes = require("./routes/account-related-routes.js");
const topicsRoutes = require("./routes/topics-routes.js");
const dbRoutes = require("./routes/db-routes.js"); 

const app = express();

//APP CONFIG
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
  }));
app.use(morgan("dev"));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


// MULTER SETUP FOR BLOGS

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '/uploads/'));
    }, 
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

let upload = multer({storage: storage});

// MULTER SETUP FOR PROFILE PICTURES

let storage_profPics = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '/prof_pics/'));
    }, 
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

let upload_profPics = multer({storage: storage_profPics});

// BLOGS ROUTES

app.get("/api/blogs/data", JsonMiddleware, CookieAuth, blogRoutes.getBlogs);

app.get("/api/search", JsonMiddleware, CookieAuth, blogRoutes.getBlogsLimit);

app.get("/api/blogs/:id", JsonMiddleware, CookieAuth, blogRoutes.getBlogDetails);

app.get("/api/blogs/topics/:topic", JsonMiddleware, blogRoutes.blogsFilterdByTopic);

app.get("/api/:id/blogs", JsonMiddleware, CookieAuth, blogRoutes.getAuthorBlogs);

app.post("/api/blogs/create", upload.single("image"), CookieAuth, blogRoutes.createBlog);

// LIKE BLOG FUNCTIONALITY

app.get("/api/:id/like/", JsonMiddleware, CookieAuth, async (req, res) => {

    if(req.user){

        const hasUserLiked = await UserLikedBlogs.findOne({user_id: req.user._id})
        .then(result => {return result})
        .catch(err => console.log(err));
        console.log("hasUserLiked: ", hasUserLiked)

        if(hasUserLiked !== null && hasUserLiked.blogs_liked.includes(req.params.id)){
            const blog_obj = await Blogs.findById(req.params.id)
            .then(result => {return result})
            .catch(err => console.log(err));

            await Blogs.findByIdAndUpdate(req.params.id, {likes: blog_obj.likes - 1})
            .then(result => {})
            .catch(err => console.log(err));

            await UserLikedBlogs.updateOne({user_id: req.user._id}, {$pull: {blogs_liked: blog_obj._id}})
            .then(result => {console.log("Removed From UserLiked List: ", result)})
            .catch(err => console.log(err));


            UserLikedBlogs.findOne({user_id: req.user._id})
            .then(result => console.log("User entry Exists:", result))
            .catch(err => console.log(err));

        }else{
            const blog_obj = await Blogs.findById(req.params.id)
            .then(result => {return result})
            .catch(err => console.log(err));

            await Blogs.findByIdAndUpdate(req.params.id, {likes: blog_obj.likes + 1})
            .then(result => {})
            .catch(err => console.log(err));

            const UserLikedObjectExists = await UserLikedBlogs.findOne({user_id: req.user._id})
            .then(result => {return result})
            .catch(err => console.log(err));

            if(UserLikedObjectExists !== null){
                await UserLikedBlogs.updateOne({user_id: req.user._id}, {$push: {blogs_liked: blog_obj._id}})
                .then(result => {})
                .catch(err => console.log(err));

                await UserLikedBlogs.findOne({user_id: req.user._id})
                .then(result => console.log("User Entry Exists in else statement", result))
                .catch(err => console.log(err));
            }else{
                const likedBlog = new UserLikedBlogs({blogs_liked: blog_obj._id, user_id: req.user._id})
                likedBlog.save()
                .then(result => {console.log("Created a new user entry...", result)})
                .catch(err => console.log(err))
            }
        }

        res.send({"message": "Like Count Updated"})

    }else{
        res.send({"message": "Not Logged In"});
    }
});


//TOPICS GET FUNCTIONS

app.get("/api/topics/general", topicsRoutes.getGeneralTopicsList);

app.get("/api/topics/full-list", topicsRoutes.getSubtopicsFullList);

// SIGNUP PAGE POST

app.post("/api/signup/data", JsonMiddleware, accountRelatedRoutes.signup);

// LOGIN PAGE POST

app.post("/api/login/data", JsonMiddleware, accountRelatedRoutes.login);

// LOGOUT POST REQ

app.post("/api/logout", JsonMiddleware, accountRelatedRoutes.logout);

//RETURN USER IF AUTHENTICATED AND STORE IN COOKIES

app.get("/api/account/data", JsonMiddleware, CookieAuth, accountRelatedRoutes.getAccoutDataIfLogged);

app.post("/api/account/image", upload_profPics.single("image"), CookieAuth, accountRelatedRoutes.updateAccountImage);


//DATABASE CONNECTION FUNC

dbRoutes.connectionDB(app);
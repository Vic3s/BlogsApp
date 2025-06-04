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

app.get("/api/blogs/data", JsonMiddleware, CookieAuth, blogRoutes.getBlogs)

//GET BLOG DETAILES VIEW PAGE

app.get("/api/blogs/:id", JsonMiddleware, blogRoutes.getBlogDetails)

//LIKE SYSTEM FUNCTIONALITY

app.post("/api/:id/like/", JsonMiddleware, CookieAuth, async (req, res) => {

    if(req.user){

        const hasUserLiked = await UserLikedBlogs.findOne({blog_id: req.params.id, user_id: req.user._id})
        .then(result => {return result})
        .catch(err => console.log(err));

        if(hasUserLiked !== null){
            const blog_likes = await Blogs.findById(req.params.id)
            .then(result => {return result.likes})
            .catch(err => console.log(err));

            await Blogs.findByIdAndUpdate(req.params.id, {likes: blog_likes - 1})
            .then(result => {})
            .catch(err => console.log(err));

            await UserLikedBlogs.deleteOne({blog_id: req.params.id})
            .then(result => {})
            .catch(err => console.log(err));

        }else{
            const blog_likes = await Blogs.findById(req.params.id)
            .then(result => {return result.likes})
            .catch(err => console.log(err));

            await Blogs.findByIdAndUpdate(req.params.id, {likes: blog_likes + 1})
            .then(result => {})
            .catch(err => console.log(err));

            const likedBlog = new UserLikedBlogs({blog_id: req.params.id, user_id: req.user._id})

            likedBlog.save()
            .then(result => {})
            .catch(err => console.log(err))
        }

        res.send({"message": "Like Count Updated"})

    }else{
        res.send({"message": "Not Logged In"});
    }
});

// CREATE A BLOG POST FUNCTION

app.post("/api/blogs/create", upload.single("image"), blogRoutes.createBlog)

//TOPICS GET FUNCTIONS

app.get("/api/topics/general", topicsRoutes.getGeneralTopicsList)

app.get("/api/topics/full-list", topicsRoutes.getSubtopicsFullList)

// SIGNUP PAGE POST

app.post("/api/signup/data", JsonMiddleware, accountRelatedRoutes.signup)

// LOGIN PAGE POST

app.post("/api/login/data", JsonMiddleware, accountRelatedRoutes.login)

// LOGOUT POST REQ

app.post("/api/logout", JsonMiddleware, accountRelatedRoutes.logout)

//RETURN USER IF AUTHENTICATED AND STORE IN COOKIES

app.get("/api/account/data", JsonMiddleware, CookieAuth, accountRelatedRoutes.getAccoutDataIfLogged)

app.post("/api/account/image", upload_profPics.single("image"), CookieAuth, accountRelatedRoutes.updateAccountImage)


//DATABASE CONNECTION FUNC

dbRoutes.connectionDB(app);
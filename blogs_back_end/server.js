require("dotenv").config();

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

const Account = require("./models/accounts");
const Blogs = require("./models/blog.js");
const UserLikedBlogs = require("./models/userLikedBlogs.js")
const CookieAuth = require("./public/JWT/CookieJwtAuth").CookieAuth;

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

const JsonMiddleware = express.json();


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

app.get("/api/blogs/data", JsonMiddleware, CookieAuth, (req, res) => {

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
            const likedByCurrUser_ = await UserLikedBlogs.findOne({blog_id: item._id, user_id: req.user._id})

            likedByCurrUser = likedByCurrUser_ !== null ? true : false;
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
            createdAt: item.createdAt
        }
    }))
    res.send(blogsObj)
}).catch(err => console.log(err))

})

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

// app.get("/api/blog/image/:id", JsonMiddleware, async (req, res) => {

//     Blogs.find({_id: req.params.id})
//     .then(async (result) => {
//         res.send({imageObj: result.image})
//     })
//     .catch(err => console.log(err))

// })

// CREATE A BLOG POST FUNCTION

app.post("/api/blogs/create", upload.single("image"), CookieAuth, (req, res) => {

    console.log(req.body)

    const newBlogObj = {
        title: req.body.title, 
        snippet: req.body.snippet,
        body: req.body.body, 
        author: req.user._id,
        image: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        },
        likes: 0,
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
})

//GET BLOG DETAILES VIEW PAGE

app.get("/api/blogs/:id", JsonMiddleware, async (req, res) => {

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

    let blogObj = {
        blog_id: blog._id,
        blog_title: blog.title,
        blog_snippet: blog.snippet,
        blog_body: blog.body,
        blog_author_name: author.name,
        blog_author_profilepic: `data:${author.profilePic.contentType};base64,${authorBase64}`,
        blog_image: `data:${blog.image.contentType};base64,${base64}`,
        blog_likes: blog.likes,
        blog_date: blog.createdAt
    }
    res.send(blogObj)

})

// SIGNUP PAGE POST

app.post("/api/signup/data", JsonMiddleware, async (req, res) => {
    const hashed_pass = await bcrypt.hash(req.body.password, 10);
    const new_account = new Account({email: req.body.email, name: req.body.name, password: hashed_pass, profilePic: {
        data: null,
        contentType: "image/png"
    }});

    new_account.save()
    .then(result => {
        res.send({message: "The account has been created!"})
    }).catch(err => console.log(err))
})

// LOGIN PAGE POST

app.post("/api/login/data", JsonMiddleware, async (req, res) => {

    const {email, password} = req.body;

    const user = await Account.findOne({email: email})
    .then(result => {return result})
    .catch(err => console.log(err));

    const userObj = {
        _id: user._id,
        name: user.name,
        email: user.email
    }

    if(!await bcrypt.compare(password, user.password)){
        return res.status(403).json({error: '* Invalid Credentials! *'});
    }

    const token = jwt.sign(userObj, process.env.SECRET, {expiresIn: "30m"})

    res.cookie("token", token, {
        httpOnly: true
    });

    res.send({message: "Login Successful!"});

})

// LOGOUT POST REQ

app.post("/api/logout", JsonMiddleware, (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/', })
    res.send({message: "Cookie Deleted, User loged out"})
})

//RETURN USER IF AUTHENTICATED AND STORE IN COOKIES

app.get("/api/account/data", JsonMiddleware, CookieAuth, async (req, res) => {
    if (req.user) {

        const getPicture = await Account.findById(req.user._id)
        .then(result => { return result })
        .catch(err => console.log(err))

        let base64 = null;        

        if(getPicture.profilePic.data !== null){
            const buffer = Buffer.from(getPicture.profilePic.data);
            base64 = buffer.toString('base64');
        }

        let userObject = {
            id: req.user._id, 
            name: req.user.name,
            email: req.user.email, 
            pfp_pic: getPicture.profilePic.data ? `data:${getPicture.profilePic.contentType};base64,${base64}` : null,
        };

        return res.send({ user: userObject});
    } else {
        return res.status(401).send({ message: '* Not authenticated! *' });
    }
});

app.post("/api/account/image", upload_profPics.single("image"), CookieAuth, (req, res) => {

    Account.findByIdAndUpdate(req.body.author_id, {
        profilePic: {
            data: fs.readFileSync(path.join(__dirname + '/prof_pics/' + req.file.filename)),
            contentType: 'image/png'
        }
    }, {new: true})
    .then(response => console.log(response))
    .catch(err => console.log({"Error": err}));
    
    res.send({"Response": "Posted"})

});


//DATABASE CONNECTION FUNC

mongoose.connect(process.env.DB_STRING)
    .then((result) => { 
        app.listen(process.env.PORT);
        
    })
    .catch((err) => { console.log("There was an error", err)});
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
const { title } = require("process");
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


// MULTER SETUP 

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '/uploads/'));
    }, 
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

let upload = multer({storage: storage});

// BLOGS ROUTES

app.get("/api/blogs/data", JsonMiddleware, (req, res) => {

    Blogs.find().sort({ createdAt: -1 })
    .then(async (response) => {
        let blogsObj = await Promise.all(response.map(async (item) => {
        let authorName = "Unknown(Error)"
        try{
            const author_ = await Account.findOne({_id: item.author})
            if(author_){
                authorName = author_.name;
            }
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
            createdAt: item.createdAt
        }
    }))
    res.send(blogsObj)
}).catch(err => console.log(err))

})

app.get("/api/blog/image/:id", JsonMiddleware, async (req, res) => {

    Blogs.find({_id: req.params.id})
    .then(async (result) => {
        res.send({imageObj: result.image})
    })
    .catch(err => console.log(err))

})

// CREATE A BLOG POST FUNCTION

app.post("/api/blogs/create", upload.single("image"), CookieAuth, (req, res) => {

    const newBlogObj = {
        title: req.body.title, 
        snippet: req.body.snippet,
        body: req.body.body, 
        author: req.user._id,
        image: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
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

app.post("/api/logout", JsonMiddleware, (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/', })
    res.send({message: "Cookie Deleted, User loged out"})
})

app.get("/api/blogs/:id", JsonMiddleware, async (req, res) => {

    const id = req.params.id;
    
    await Blogs.findOne({_id: id})
    .then(async (result) => {
        console.log(result.author)
        const authorObj = await Account.findOne({_id: result.author})
        .then(result => {return result})
        .catch(err => console.log(err))

        res.send({blog: result, authorName: authorObj.name })
    })
    .catch((err) => { res.status(404).json({error: "* Blog Doesnt exist! *"})});


})

// SIGNUP PAGE POST

app.post("/api/signup/data", JsonMiddleware, async (req, res) => {
    const hashed_pass = await bcrypt.hash(req.body.password, 10);
    const new_account = new Account({email: req.body.email, name: req.body.name, password: hashed_pass});

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

    if(!bcrypt.compare(password, user.password)){
        return res.status(403).json({error: '* Invalid Credentials! *'});
    }

    const token = jwt.sign(user.toObject(), process.env.SECRET, {expiresIn: "30m"})

    res.cookie("token", token, {
        httpOnly: true
    });

    res.send({message: "Login Successful!"});

})

//RETURN USER IF AUTHENTICATED AND STORED IN COOKIES

app.get("/api/account/data", JsonMiddleware, CookieAuth, (req, res) => {
    if (req.user) {
        return res.send({ user: req.user });
    } else {
        return res.status(401).send({ message: '* Not authenticated! *' });
    }
})

//DATABASE CONNECTION FUNC

mongoose.connect(process.env.DB_STRING)
    .then((result) => { 
        app.listen(process.env.PORT);
        
    })
    .catch((err) => { console.log("There was an error", err)});
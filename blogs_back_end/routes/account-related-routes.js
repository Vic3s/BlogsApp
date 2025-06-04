const Account = require("../models/accounts");

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const signup = async (req, res) => {
    const hashed_pass = await bcrypt.hash(req.body.password, 10);
    const new_account = new Account({email: req.body.email, name: req.body.name, password: hashed_pass, profilePic: {
        data: null,
        contentType: "image/png"
    }});

    new_account.save()
    .then(result => {
        res.send({message: "The account has been created!"})
    }).catch(err => console.log(err))
}


const login = async (req, res) => {

    const {email, password} = req.body;

    const user = await Account.findOne({email: email})
    .then(result => {return result})
    .catch(err => console.log(err));

    if(user === null){
        res.send({Error: "Incorrect username or email..."})
        return;
    }

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

}

const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        path: '/', })
    res.send({message: "Cookie Deleted, User loged out"})
}

const getAccoutDataIfLogged = async (req, res) => {
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
}


const updateAccountImage = (req, res) => {
    const root_dir = __dirname.slice(0, __dirname.length - 7)

    Account.findByIdAndUpdate(req.body.author_id, {
        profilePic: {
            data: fs.readFileSync(path.join(root_dir + '/prof_pics/' + req.file.filename)),
            contentType: 'image/png'
        }
    }, {new: true})
    .then(response => console.log(response))
    .catch(err => console.log({"Error": err}));
    
    res.send({"Response": "Posted"})

}

module.exports = {signup, login, logout, getAccoutDataIfLogged, updateAccountImage}
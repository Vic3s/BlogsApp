const jwt = require("jsonwebtoken");

exports.CookieAuth = async (req, res, next) => {
    const token = req.cookies.token

    if(!token){
        return next();
    }

    try{
        const user = jwt.verify(token, process.env.SECRET);
        req.user = user;
        
    }catch(err) {
        res.clearCookie("token");
        console.log(err)
    }
    next();
}
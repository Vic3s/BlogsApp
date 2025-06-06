const mongoose = require("mongoose");


const connectionDB = (app) => {
    mongoose.connect(process.env.DB_STRING)
    .then((result) => { 
        app.listen(process.env.PORT);
    })
    .catch((err) => { console.log("There was an error", err)});
}


module.exports = {connectionDB};
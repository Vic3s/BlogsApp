const topics = require("../public/json/topics.json")

const getGeneralTopicsList = (req, res) => {

    res.send(Object.keys(topics))
    
}

const getSubtopicsFullList = (req, res) => {
    let fullList = [];

    for(let i in Object.keys(topics)){
        fullList = fullList.concat(topics[Object.keys(topics)[i]]);
    }

    res.send(fullList)
}

module.exports = { getGeneralTopicsList, getSubtopicsFullList}
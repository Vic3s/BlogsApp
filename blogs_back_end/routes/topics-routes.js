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

const getSingleTopicList = (topic) => {
    for(let i=0; i<Object.keys(topics).length; i++){
        if(Object.keys(topics)[i] == topic){
            return Object.values(topics)[i];
        }
    }
}

module.exports = { getGeneralTopicsList, getSubtopicsFullList, getSingleTopicList}
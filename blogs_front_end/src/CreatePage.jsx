import { useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./partials/Nav";
import "./styles/create_page.css"


function Create(){

    const[title, setTitle] = useState("");
    const[snippet, setSnippet] = useState("");
    const[body, setBody] = useState("");
    const[image, setImage] = useState(null);
    const[validTopics, setValidTopics] = useState([]);
    const[topics, setTopics] = useState([]);
    const[inputValue, setInputValue] = useState("");
    const inputElement = useRef(null)
    const dataObjMultipart = new FormData();

    const HandleFile = (e) => {
        setImage(e.target.files[0]);
    }

    useEffect(() => {
        if (image) {
            dataObjMultipart.append('image', image);
        }
    }, [image]);

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        dataObjMultipart.append('title', title)
        dataObjMultipart.append('snippet', snippet)
        dataObjMultipart.append('body', body)
        dataObjMultipart.append('topics', topics)

        fetch("http://localhost:5000/api/blogs/create", {
            method: "POST",
            credentials: 'include',
            body: dataObjMultipart,
        }).then(response => {
            if(!response.ok){
                throw new Error("*Failed to post blog!*")
            }
            return response.json();
        }).then(data => {
            console.log('Response: ', data)
            navigate("/")
        })
        .catch((err) => console.log(err));
    }

    const getTopics = async () => {
        await fetch("http://localhost:5000/api/topics/full-list", {
            method:"GET",
            credentials: 'include',
            headers: {
                "Content-Type": "application/json"
            },
        })
        .then(response => {return response.json()})
        .then(data => setValidTopics(data))
        .catch(err => console.log(err));
    }

    useEffect(() => {
        getTopics();
    }, [])

    const CheckValidTopic = (e) => {
        e.preventDefault();

        if(validTopics.includes(e.target.value)){
            inputElement.current.style.color = 'crimson';
        }else{
            inputElement.current.style.color = 'black'
        }

        setInputValue(e.target.value);
    }

    const AddTopicToList = (e) => {
        e.preventDefault();
                
        if(topics.length < 5){
            setTopics(prev => [...prev, inputValue]);
            return;
        }
    }
    const RemoveTopicFromList = (e) => {
        e.preventDefault();

        let currTopic = e.currentTarget.dataset.topic

        setTopics(prev => prev.filter((topic) => {topic == currTopic}))
        return;
    } 

    return <>
        <Nav/>
    
        <div className="create-blog">
            <form onSubmit={handleSubmit}>
                <div className="input-title">
                    <label htmlFor="title">Title</label>
                    <input type="text" id="title" name="title" onChange={(e) => setTitle(e.target.value)} required/>
                </div>
                <div className="input-snippit">
                    <label htmlFor="snippet">Snippet</label>
                    <input type="text" id="snippet" name="snippet" onChange={(e) => setSnippet(e.target.value)} required/>
                </div>
                <div className="input-body">
                    <label htmlFor="body">Content</label>
                    <textarea type="text" id="body" name="body" onChange={(e) => setBody(e.target.value)} required></textarea>
                </div>
                <div className="last-additions">
                    <div className="input-main-image">
                        <label htmlFor="main-image">
                            <img src="../public/image-upload-solid.svg" alt="upload image icon" />
                            <h2>Choose a thumbnail image</h2>
                        </label>
                        <input type="file" name="main-image" id="main-image" onChange={HandleFile} />
                    </div>
                    <div className="topics-cohice-contianer">
                        <div className="topics-choice">
                            <div className="label-topic-choice">
                                <h2>Topics</h2>
                            </div>
                            <div className="topics-input">

                                <input type="text"
                                onChange={CheckValidTopic}
                                ref={inputElement}
                                placeholder="Type a topic(up to five)"/>

                                <button type="button" className="add-topic" onClick={AddTopicToList}>Add Topic</button>
                            </div>
                            <div className="blog-topics">
                                {topics.map((topic) => {
                                    return <>
                                        <div className="topic-element">
                                            <p className="text-topic">{topic}</p>
                                            <button type="button" className="remove-topic" data-topic={topic} onClick={RemoveTopicFromList}>
                                                <img src="../public/x-symbol.svg" alt="an x symbol image"/>
                                                </button>
                                        </div>
                                    </>
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="submit-btn-container">
                    <button>Upload Blog</button>
                </div>
            </form>

        </div>

        </>
}

export default Create
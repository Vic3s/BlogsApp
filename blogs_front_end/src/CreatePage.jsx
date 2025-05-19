import { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import Nav from "./partials/Nav";
import "./styles/create_page.css"


function Create(){

    const[title, setTitle] = useState("");
    const[snippet, setSnippet] = useState("");
    const[body, setBody] = useState("");
    const[image, setImage] = useState(null);
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
                    <label htmlFor="body">Contents</label>
                    <textarea type="text" id="body" name="body" onChange={(e) => setBody(e.target.value)} required></textarea>
                </div>
                <div className="input-main-image">
                    <label htmlFor="main-image">
                        <img src="../public/image-upload-solid.svg" alt="upload image icon" />
                        <h2>Choose a thumbnail image</h2>
                    </label>
                    <input type="file" name="main-image" id="main-image" onChange={HandleFile} />
                </div>
                <div className="submit-btn-container">
                    <button>Upload Blog</button>
                </div>
            </form>

        </div>

        </>
}

export default Create
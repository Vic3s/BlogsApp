import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Nav from "./partials/Nav";
import "./styles/account_page.css"

function Account(){

    const[acc, setAcc] = useState({user: null})
    const[isActive, setIsActive] = useState(false);
    const[image, setImage] = useState(null);
    const[blogs, setBlogs] = useState([]);
    const navigate = useNavigate();

    const dataObjMultipart = new FormData();

    function handleImage(e) {
        setImage(e.target.files[0])
    }

    const getAcc = async () => {
        await fetch("http://localhost:5000/api/account/data", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        .then(response => response.json())
        .then(accObj => {
            setAcc(accObj.user)
            getAuthorBlogs(accObj.user.id);
        })
        .catch(err => console.log(err));
    }

    const getAuthorBlogs = async (id) => {
        await fetch(`http://localhost:5000/api/${id}/blogs`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        .then(response => response.json())
        .then(data => {
            setBlogs(data)
        })
        .catch(err => console.log(err));
    }

    useEffect(()=> {
        getAcc();
        
    }, [])

    useEffect(() => {
        if (image) {
            dataObjMultipart.append('image', image);
        }
    }, [image]);

    const logOut = async (e) => {
        e.preventDefault();

        await fetch("http://localhost:5000/api/logout", {
            method: "POST",
            credentials: "include"
        }).then(response => {
            return response.json();
        }).then(data => { console.log("success: ", data)})
        .catch(err => console.log(err))
        navigate("/");
    }

    const renderImage = () => {
        if(acc.pfp_pic){
            return <img src={acc.pfp_pic} alt="account-picture" className="profile_pic"/>
        }else{
            return <img src="../public/unknown_user.jpg" alt="account-picture" className="profile_pic"/>
        }
    }

    const postProfilePicture = (e) => {
        e.preventDefault();

        dataObjMultipart.append("author_id", acc.id);
        
        fetch("http://localhost:5000/api/account/image", {
            method: "POST",
            credentials: 'include',
            body: dataObjMultipart
        }).then(response => {
            if(!response.ok){
                throw new Error("*Failed...*")
            }
            return response.json();
        }).then(data => {
            console.log(data)
        }).catch(err => console.log(err))
    }

    const LikeCountUpdate = (e) => {

        fetch(`http://localhost:5000/api/${e.currentTarget.id}/like/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        }).then(response => response.json())
        .then(message => console.log(message))
        .catch(err => console.log(err));

        getAuthorBlogs(acc.id);
    }

    const UpdateFrontEnd = (e, isLiked) => {
        const children = e.currentTarget.children;

        if(children.length > 0){
            if(isLiked){
                children[0].src = "/like-inactive.svg";
                children[1].textContent = Number(children[1].textContent) - 1;
            }else{
                children[0].src = "/like-active.svg";
                children[1].textContent = Number(children[1].textContent) + 1;
            }
        }
    } 
    
    return  <div className="main-container-accoutn">
                <Nav/>

                <h1 className="account-title">Account</h1>

                <div className="account-info-container">
                    <div className="image-container">
                        {renderImage()}
                    </div>
                    <div className="account-text">
                        <div className="text">
                            <h2 className="user-name">{acc.name}</h2>
                            <h2 className="user-email">{acc.email}</h2>
                        </div>
                        <div className="buttons">
                            <form onSubmit={logOut} className="logout-form">
                                <button type="submit" className="logout">Log Out</button>
                            </form>
                            <button className="form-visibility-button" onClick={() => setIsActive(!isActive)}>Change Profile Pic</button>
                            <div className={`change-picture-form ${isActive ? 'change-picture-form-active' : ''} `}>
                                <form onSubmit={postProfilePicture}>
                                    <label htmlFor="profile-pic"><img src="../public/upload-file-svgrepo-com.svg" alt="upload-icon" /></label>
                                    <input type="file" name="profile-pic" id="profile-pic" onChange={handleImage}/>
                                <button type="submit">Choose Image</button>
                                </form>
                                <button className="closeBtn" onClick={(e) => setIsActive(!isActive)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="blogs-body">
                    {blogs.map((blog)=> {
                        return <>
                            <div className='blog-content'>
                                <div className='blog-text'>
                                    <a className="single-blog" key={blog._id} href={`/blogs/${blog._id}`}>
                                        <div className='text'>
                                            <p>Posted by: {blog.author}</p>
                                            <h3 className="title">{blog.title}</h3>
                                            <p className="snippit">{blog.snippet}</p>
                                        </div>
                                        <div className='image-blog'>
                                            <img src={blog.image} alt="Blog Image"/>
                                        </div>
                                    </a>
                                    <div className="topics">
                                        {
                                            blog.topics.map((topicBlog) => {
                                                return<>
                                                    <a className='topic'>{topicBlog}</a>
                                                </>
                                            })
                                        }
                                    </div>
                                    <div className='addings'>
                                        <p className='date'>{String (blog.createdAt).substring(0, 10)}</p>
                                        <div className='likes' onClick={(e) => {LikeCountUpdate(e), UpdateFrontEnd(e, blog.likedByCurrUser)}} id={blog._id}>
                                            <img src={blog.likedByCurrUser ? "/like-active.svg" : "/like-inactive.svg"}
                                            alt="like symbol"/> 
                                            <p>{blog.likes}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr color="#222" width="500px" size="4px" className="line"/>
                        </>
                        })
                    }
                </div>
        </div>
}

export default Account
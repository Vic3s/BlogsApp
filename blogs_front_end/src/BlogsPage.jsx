import { useEffect, useState, useRef, use } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import Footer from './partials/Footer'
import Nav from './partials/Nav'
import "./styles/blogs_page.css"

function BlogsPage(){

    const[blogs, setBlogs] = useState([]);
    const[mainContnetTopics, setMainContnetTopics] = useState([]);
    const[liked, setLiked] = useState(false);

    const topicsList = useRef(null);
    const arrowsInterval = useRef(null);

    const { topic }  = useParams();

    const location = useLocation();

    const getBlogs = async () => {

        await fetch("http://localhost:5000/api/blogs/data",{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        .then(response => response.json())
        .then(data => {
            setBlogs(data);
        })
        .catch(err => console.log(err));
    }

    const getTopics = async () => {
        await fetch("http://localhost:5000/api/topics/general",{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
        })
        .then(response => response.json())
        .then(data => {
            setMainContnetTopics(data)
        })
        .catch(err => console.log(err));
    }

    const getBlogsFilterdByTopic = async () => {

        fetch(`http://localhost:5000/api/blogs/topics/${topic}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        })
        .then(response =>  response.json())
        .then(data => {
            setBlogs(data)
        })
        .catch(err => console.log(err));
    }

    useEffect(() => {
        const fetchData = () => {
            if(location.pathname == "/"){
                getBlogs();
            }else{
                getBlogsFilterdByTopic();
            }
            getTopics();
        }

        fetchData();
        
        const rerenderInterval = setInterval(fetchData, 8000)

        return () => clearInterval(rerenderInterval)
        
    }, [location.pathname, topic])

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

        getBlogs();
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

    const clearArrowsInterval = () => {
        clearInterval(arrowsInterval.current);
        arrowsInterval.current = null;
    }

    const ArrowMoveLeft = () => {
        let currTransform = Number(getComputedStyle(topicsList.current)
        .getPropertyValue("transform")
        .substring(6)
        .split(", ")[4]);

        if(currTransform >= 0){
            return;
        }else{
            arrowsInterval.current = setInterval(() => {
                if(currTransform >= 0){
                    clearArrowsInterval();
                }
                topicsList.current.style.transform = `translateX(${currTransform+=5}px)`;
            }, 10)
        }
    }

    const ArrowMoveRight = () => {
        let currTransform = Number(getComputedStyle(topicsList.current)
        .getPropertyValue("transform")
        .substring(6)
        .split(", ")[4]);

        if(currTransform <= -1385){
            return;
        }else{
            arrowsInterval.current = setInterval(() => {
                if(currTransform <= -1385){
                    clearArrowsInterval();
                }
                topicsList.current.style.transform = `translateX(${currTransform-=5}px)`;
            }, 10)
        }
    }

    return <>
        <Nav/>
        <div className='topics-bar-container'>
            <div className='arrow-left'>
                <button className='left' onMouseDown={ArrowMoveLeft} onMouseUp={clearArrowsInterval} onMouseLeave={clearArrowsInterval}>
                    <img src="../public/arrow-left.svg" alt="arrow-left-symbol"/>
                </button>
            </div>
            <div className='topics-container'>
                <div className='topics-list' ref={topicsList}>
                    {
                        mainContnetTopics.map((topicGeneral) => {
                            return <a href={`/${topicGeneral}`} className='topic-general'>{topicGeneral}</a>
                        })
                    }
                </div>
            </div>
           
            <div className='arrow-right'>
                <button className='right' onMouseDown={ArrowMoveRight} onMouseUp={clearArrowsInterval} onMouseLeave={clearArrowsInterval}>
                    <img src="../public/arrow-right.svg" alt="arrow-right-symbol"/>
                </button>
            </div>
        </div>
        <div className="blogs-page">
            <div className='heading-content'>
                <div className='heading-text'>
                    <h1 className="heading1">A place to <br /><span>Create and Share!</span></h1>
                    <p className="under-heding">Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    <br />Vel, autem! Voluptatem eligendi maiores nemo perspiciatis eius sit veniam nihil vitae.</p>
                </div>
                <div className='heading-image'>
                    <img src="../public/typewriter_banner.png" alt="" />
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

        <Footer></Footer>
    </>
}

export default BlogsPage
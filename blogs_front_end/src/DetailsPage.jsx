import { useEffect, useState} from "react"
import { useParams } from "react-router-dom";
import "./styles/details_page.css"
import Nav from "./partials/Nav";


function DetailsPage (){

    const { id } = useParams();

    const [blog, setBlog] = useState({blog: null});

    useEffect(() => {
        const get_blog_id_data = async () => {
            await fetch(`http://localhost:5000/api/blogs/${id}`, {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
            }).then(response => response.json())
            .then(data => {
                setBlog(data)
            })
            .catch(err => console.log(err));
        }
        get_blog_id_data();
    }, [])

    return <>

        <div className="blog-container-details">
            <Nav/>

            <div className="main-info">
                <div className="title-container">
                    <h2 className="title">{blog.blog_title}</h2>
                </div>

                <div className="snippet-container">
                    <h3 className="snippet">{blog.blog_snippet}</h3>
                </div>

                <div className="blog-popularity-data">
                    <div className="author-container">
                        <img src={blog.blog_author_profilepic} alt="author profile picture" />
                        <p className="author-name">{blog.blog_author_name}</p>
                    </div>
                    <div className="popularity-data">
                        <p className='date'>{String (blog.blog_date).substring(0, 10)}</p>
                        <div className='likes'>
                            <img src="../public/like-hand-symbol-of-rounded-shape-variant-svgrepo-com.svg" alt="like symbol"/>
                            <p>{blog.likes}</p>
                        </div>
                    </div>
                </div>

                <div className="image-container">
                    <img src={blog.blog_image} alt="iamge of blog"/>
                </div>
            </div>
            
            <div className="content-container">
                <p className="content">{blog.blog_body}</p>
            </div>

        </div>
        
    </>
}

export default DetailsPage
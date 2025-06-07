import { useEffect, useState, useRef } from "react"
import "./partials_styles/nav_additional_styles.css"

function Nav() {

    const[user, setUser] = useState({user: null});
    const [blogsResult, setBlogsResult] = useState([]);
    const[searchQuery, setSearchQuery] = useState("");

    const refSerchMenu = useRef(null);

    const activateSeachMenu = () => {
        refSerchMenu.current.className = "search-menu-active";
    }
    const deActivateSeachMenu = () => {
        refSerchMenu.current.className = "search-menu-inactive";
        setBlogsResult([]);
    }

    const getUserIfExists = async() => {
        await fetch("http://localhost:5000/api/account/data", {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        })
        .then(response => response.json())
        .then(userObj => setUser(userObj))
        .catch(err => console.log(err));
    }

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if(searchQuery){
                fetch(`http://localhost:5000/api/search?query=${searchQuery}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                })
                .then(response => response.json() )
                .then(data => {
                    console.log(data);
                    setBlogsResult(data);
                })
                .catch(err => console.log(err)); 
            }
        }, 500);

        return() => clearInterval(delayDebounce);
    }, [searchQuery])

    useEffect(() => {
        getUserIfExists();
    }, []);

    const UserExistsCheck = () =>{
        if(user.user == null){
            return <li className="nav-item ms-3">
                        <a className="btn btn-dark btn-rounded" href="/signup">Sign Up</a>
                    </li>
        }else{
            return <>
                <li className="nav-item">
                    <a className="nav-link mx-2" href="/create">
                    <img src="../public/plus-circle-svgrepo-com.svg" alt="Blogs Icon" className="create-icon"/> Create</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link mx-2" href="/account">
                    <img src="../public/account-svgrepo-com.svg" alt="Blogs Icon" className="create-icon"/> Account</a>
                </li>
            </>
        }
    }

    return <>
    
    <nav className="navbar navbar-expand-lg fixed-top bg-light navbar-light">
        <div className="container">
            <a className="navbar-brand" href="/">Blogify</a>
            <div className="search-bar-content">
                <div className="search-bar-body">
                    <img src="../public/search-icon.svg" alt="search-icon" />
                    <div className="search-bar">
                        <form>
                            <input onBlur={() => setTimeout(() => deActivateSeachMenu(), 100)} 
                            onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    activateSeachMenu();
                                }
                            }
                            type="text" placeholder="Search..."/>    
                        </form>
                    </div>
                </div>
                <div className="search-menu" ref={refSerchMenu}>
                    <ul>
                        {blogsResult.map((blog) => {
                            return<>
                                <a href={`/blogs/${blog._id}`} className="search-item">
                                    <div className="img-container">
                                        <img src={blog.image} alt="blog-image-search-item"/>
                                    </div>
                                    <li key={blog._id}>{blog.title}</li>
                                </a>
                            </>
                        })}
                    </ul>
                </div>
            </div>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
                <ul className="navbar-nav ms-auto align-items-center">
                    <li className="nav-item">
                        <a className="nav-link mx-2" href="/">
                        <img src="../public/comment-lines-svgrepo-com.svg" alt="Blogs Icon" className="blogs-icon"/>Blogs</a>
                    </li>
                    <UserExistsCheck/>
                </ul>
            </div>
        </div>
    </nav>
    </>
}

export default Nav;
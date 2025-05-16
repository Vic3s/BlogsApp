import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Nav from "./partials/Nav";
import "./styles/account_page.css"

function Account(){

    const[acc, setAcc] = useState({user: null})
    const[isActive, setIsActive] = useState(false);
    const navigate = useNavigate();
    const[image, setImage] = useState(null);
    const dataObjMultipart = new FormData();

    function handleImage(e) {
        setImage(e.target.files[0])
    }

    useEffect(()=> {
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
                setAcc(accObj.user)})
            .catch(err => console.log(err));
        }
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
    
    return  <div className="main-container-accoutn">
                <Nav/>

                <h1 className="account-title">Account</h1>

                <div className="account-info-container">
                    <div className="image-container">
                        {renderImage()}
                    </div>
                    <div className="account-text">
                        <div className="text">
                            <h2>{acc.name}</h2>
                            <h2>{acc.email}</h2>
                        </div>
                        <div className="buttons">
                            <button className="form-visibility-button" onClick={() => setIsActive(!isActive)}>Change picture</button>
                            <div className={`change-picture-form ${isActive ? 'change-picture-form-active' : ''} `}>
                                <form onSubmit={postProfilePicture}>
                                    <label htmlFor="profile-pic"><img src="../public/upload-file-svgrepo-com.svg" alt="upload-icon" /></label>
                                    <input type="file" name="profile-pic" id="profile-pic" onChange={handleImage}/>
                                <button type="submit">Change Picture</button>
                                </form>
                                <button className="closeBtn" onClick={(e) => setIsActive(!isActive)}>Close</button>
                            </div>
                            <form onSubmit={logOut} className="logout-form">
                                <button type="submit" className="logout">Log Out</button>
                            </form>
                        </div>
                    </div>
                </div>
                
        </div>
}

export default Account
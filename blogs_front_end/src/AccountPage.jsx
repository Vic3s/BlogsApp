import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Nav from "./partials/Nav";
import "./styles/account_page.css"

function Account(){

    const[acc, setAcc] = useState({user: null})
    const[isActive, setIsActive] = useState(false);
    const navigate = useNavigate();

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
                console.log(accObj.user)
                setAcc(accObj.user)})
            .catch(err => console.log(err));
        }
        getAcc();
    }, [])

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

    function renderImage(){
        if(acc.pfp_pic){
            return <img src={acc.pfp} alt="account-picture" className="profile_pic"/>
        }else{
            return <img src="../public/unknown_user.jpg" alt="account-picture" className="profile_pic"/>
        }
    }

    function postProfilePicture(e){

    }
    

    return  <div className="main-container-accoutn">
                <Nav/>

                <h1 className="account-title">Account</h1>

                <div className="account-info-container">
                    {renderImage()}
                    <div className="account-text">
                        <div>
                            <h2>{acc.name}</h2>
                            <h2>{acc.email}</h2>
                        </div>
                        <button className="form-visibility-button" onClick={() => setIsActive(!isActive)}>Change picture</button>
                        <div className={`change-picture-form ${isActive ? 'change-picture-form-active' : ''} `}>
                            <form onsubmit={postProfilePicture}>
                                <label htmlFor="profile-pic"><img src="../public/upload-file-svgrepo-com.svg" alt="upload-icon" /></label>
                                <input type="file" name="profile-pic" id="profile-pic"/>
                            <button type="submit">Change Picture</button>
                        </form>
                        <button className="closeBtn" onClick={() => setIsActive(!isActive)}>Close</button>
                        </div>
                        <form onSubmit={logOut} className="logout-form">
                            <button type="submit" className="logout">Log Out</button>
                        </form>
                    </div>
                    
                </div>
                
        </div>
}

export default Account
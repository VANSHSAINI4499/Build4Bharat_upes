import React, { useEffect, useRef, useState } from 'react';
import '../Styles/Signup.css'; // Make sure this file starts with @import at the top
import Axios from 'axios'
import {useNavigate} from 'react-router-dom'

const Signup = () => {
  const containerRef = useRef(null);

  const toggle = () => {
    containerRef.current.classList.toggle('sign-in');
    containerRef.current.classList.toggle('sign-up');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      containerRef.current.classList.add('sign-in');
    }, 200);
    return () => clearTimeout(timer);
  }, []);

    const[name,setname] = useState("");
    const[email,setemail] = useState("");
    const[password,setpassword] = useState("");

    const navigate = useNavigate();

  const register = ()=>{

    Axios.post("http://localhost:4500/api/v1/register",{
      name:name,
      email:email,
      password:password
    }).then((response)=>{
      if(response.data === "success")
      {
        alert("register Succcessfully")
        navigate("/new")
      }

      else
      {
        alert("you are alredy register proceed to login")
      }
    })

  }

    const[lemail,setlemail] = useState("");
    const[lpassword,setlpassword] = useState("");

  const login = ()=>{

    Axios.post("http://localhost:4500/api/v1/login",{
      email:lemail,
      password:lpassword
    }).then((response)=>{
      if(response.data === "success")
      {
        alert("Login Successfully")
        navigate("/new")
      }
      else
      {
        alert("Invalid credentials. Please check your email and password.")
      }
    }).catch(()=>{
      alert("Login failed. Please check your credentials or register first.")
    })

  }

  return (
    <div ref={containerRef} id="container" className="container">
      <div className="row">
        {/* Sign Up Section */}
        <div className="col align-items-center flex-col sign-up">
          <div className="form-wrapper align-items-center">
            <div className="form sign-up">
              <div className="input-group">
                <i className="bx bxs-user"></i>
                <input type="text" placeholder="Username" onChange={(e)=>{setname(e.target.value)}}/>
              </div>
              <div className="input-group">
                <i className="bx bx-mail-send"></i>
                <input type="email" placeholder="Email" onChange={(e)=>{setemail(e.target.value)}}/>
              </div>
              <div className="input-group">
                <i className="bx bxs-lock-alt"></i>
                <input type="password" placeholder="Password" onChange={(e)=>{setpassword(e.target.value)}}/>
              </div>
              <button onClick={register}>Sign up</button>
              <p>
                <span>Already have an account?</span>
                <b onClick={toggle} className="pointer">
                  Sign in here
                </b>
              </p>
            </div>
          </div>
        </div>

        {/* Sign In Section */}
        <div className="col align-items-center flex-col sign-in">
          <div className="form-wrapper align-items-center">
            <div className="form sign-in">
              <div className="input-group">
                <i className="bx bxs-user"></i>
                <input type="text" placeholder="UserEmail" onChange={(e)=>{setlemail(e.target.value)}}/>
              </div>
              <div className="input-group">
                <i className="bx bxs-lock-alt"></i>
                <input type='password' placeholder='Password' onChange={(e)=>{setlpassword(e.target.value)}}/>
              </div>
              <button onClick={login}>Sign in</button>
              <p>
                <b>Forgot password?</b>
              </p>
              <p>
                <span>Don't have an account?</span>
                <b onClick={toggle} className="pointer">
                  Sign up here
                </b>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Row */}
      <div className="row content-row">
        <div className="col align-items-center flex-col">
          <div className="text sign-in">
            <h2>Welcome</h2>
          </div>
          <div className="img sign-in"></div>
        </div>
        <div className="col align-items-center flex-col">
          <div className="img sign-up"></div>
          <div className="text sign-up">
            <h2>Join with us</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
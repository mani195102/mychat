import React, { useState } from 'react';
import "./animation.css";
import logo from '../assets/chatapp.svg';
import { Backdrop, Button, CircularProgress, TextField } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Toaster from "../components/Toaster";

function Login() {
  const [showLogin, setShowLogin] = useState(true);
  const [data, setData] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [logInStatus, setLogInStatus] = useState("");
  const [signInStatus, setSignInStatus] = useState("");

  const navigate = useNavigate();

  const changeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const loginHandler = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const response = await axios.post("http://localhost:5000/user/login", data, config);
      setLogInStatus({ msg: "Success", key: Math.random() });
      localStorage.setItem("userdata", JSON.stringify(response.data)); // Store user data
      navigate("/app/welcome");
    } catch (error) {
      setLogInStatus({
        msg: "Invalid Username or Password",
        key: Math.random(),
      });
    } finally {
      setLoading(false);
    }
  };

  const signUpHandler = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const response = await axios.post("http://localhost:5000/user/register", data, config);
      setSignInStatus({ msg: "Success", key: Math.random() });
      localStorage.setItem("userdata", JSON.stringify(response.data)); // Store user data
      navigate("/app/welcome");
    } catch (error) {
      if (error.response.status === 405) {
        setSignInStatus({
          msg: "User with this email ID already exists",
          key: Math.random(),
        });
      } else if (error.response.status === 406) {
        setSignInStatus({
          msg: "Username already taken, please choose another one",
          key: Math.random(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
        <CircularProgress color="secondary" />
      </Backdrop>

      <div className='login-container'>
        <div className="image-container">
          <img src={logo} alt="logo" className='image' />
        </div>
        {showLogin && (
          <div className="login-box">
            <h3>Login to your account</h3>
            <TextField
              onChange={changeHandler}
              id="standard-basic"
              label="Enter username"
              variant="outlined"
              color="secondary"
              name="name"
            />
            <TextField
              onChange={changeHandler}
              id="outlined-password-input"
              label="Password"
              type="password"
              autoComplete='current-password'
              color="secondary"
              variant="outlined"
              name="password"
            />
            <Button variant="outlined" onClick={loginHandler}>Login</Button>
            <p> Don't have an Account ?{" "}
              <span className='hyper' onClick={() => setShowLogin(false)}>Sign Up</span>
            </p>
            {logInStatus ? (
              <Toaster key={logInStatus.key} message={logInStatus.msg} />
            ) : null}
          </div>
        )}
        {!showLogin && (
          <div className="login-box">
            <h3>Create your account</h3>
            <TextField
              onChange={changeHandler}
              id="standard-basic"
              label="Enter username"
              variant="outlined"
              color="secondary"
              name="name"
            />
            <TextField
              onChange={changeHandler}
              id="standard-basic"
              label="Enter Email Address"
              variant="outlined"
              color="secondary"
              name="email"
            />
            <TextField
              onChange={changeHandler}
              id="standard-basic"
              label="Enter Phone Number"
              variant="outlined"
              color="secondary"
              name="phone"
            />
            <TextField
              onChange={changeHandler}
              id="outlined-password-input"
              label="Password"
              type="password"
              autoComplete='current-password'
              color="secondary"
              variant="outlined"
              name="password"
            />
            <Button variant="outlined" onClick={signUpHandler}>Sign Up</Button>
            <p> Already have an Account ?<span className='hyper' onClick={() => setShowLogin(true)}>Log In</span></p>
            {signInStatus ? (
              <Toaster key={signInStatus.key} message={signInStatus.msg} />
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

export default Login;

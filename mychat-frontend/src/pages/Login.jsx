import React, { useState } from 'react';
import "./animation.css";
import logo from '../assets/chatapp.svg';
import { Backdrop, Button, CircularProgress, TextField } from '@mui/material'; // Import Link as RouterLink
import axios from 'axios';
import { useNavigate,Link as RouterLink } from 'react-router-dom';
import Toaster from "../components/Toaster";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function Login() {
  const [showLogin, setShowLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [logInStatus, setLogInStatus] = useState("");
  const [signInStatus, setSignInStatus] = useState("");

  const navigate = useNavigate();

  const initialValues = {
    name: "",
    email: "",
    password: "",
    phone: "",
    about: "",
    profileImage: null
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    password: Yup.string().required('Password is required'),
    phone: Yup.string().required('Phone number is required'),
    about: Yup.string(),
    profileImage: Yup.mixed().test('fileSize', 'File size is too large', (value) => {
      if (value) {
        return value.size <= 2000000; // 2MB
      }
      return true; // allow undefined value
    }),
  });

  const onSubmitLogin = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const response = await axios.post("http://localhost:5000/user/login", values, config);
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
      setSubmitting(false);
    }
  };

  const onSubmitSignUp = async (values, { setSubmitting }) => {
    setLoading(true);
    const formData = new FormData();
    for (const key in values) {
      formData.append(key, values[key]);
    }
    
    try {
      const config = {
        headers: {
          "Content-type": "multipart/form-data",
        },
      };
      const response = await axios.post("http://localhost:5000/user/register", formData, config);
      setSignInStatus({ msg: "Success", key: Math.random() });
      localStorage.setItem("userdata", JSON.stringify(response.data)); // Store user data
      navigate("/app/welcome");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setSignInStatus({
          msg: error.response.data.message,
          key: Math.random(),
        });
      } else {
        setSignInStatus({
          msg: "Something went wrong",
          key: Math.random(),
        });
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
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
        <div className="login-box">
          {showLogin ? (
            <>
              <h3 style={{marginBottom:'1em'}}>Login to your account</h3>
              <Formik
                initialValues={{ name: initialValues.name, password: initialValues.password }}
                validationSchema={Yup.object({
                  name: Yup.string().required('Username is required'),
                  password: Yup.string().required('Password is required'),
                })}
                onSubmit={onSubmitLogin}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Field
                      style={{marginBottom:'1em'}}
                      as={TextField}
                      type="text"
                      name="name"
                      label="Enter username"
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      helperText={<ErrorMessage name="name" />}
                    />
                    <Field
                      style={{marginBottom:'1em'}}
                      as={TextField}
                      type="password"
                      name="password"
                      label="Password"
                      autoComplete="current-password"
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      helperText={<ErrorMessage name="password" />}
                    />
                    <Button variant="outlined" disabled={isSubmitting} type="submit">
                      Login
                    </Button>
                  </Form>
                )}
              </Formik>
              <p style={{marginBottom:'1em',marginTop:'1em'}}>
                <RouterLink to="/forgetpassword" className='hyper'>Forgot Password?</RouterLink>
                {" | "}
                Don't have an Account ?{" "}
                <span className='hyper' onClick={() => setShowLogin(false)}>Sign Up</span>
              </p>
              {logInStatus ? (
                <Toaster key={logInStatus.key} message={logInStatus.msg} />
              ) : null}
            </>
          ) : (
            <>
              <h3>Create your account</h3>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmitSignUp}
              >
                {({ isSubmitting, setFieldValue }) => (
                  <Form>
                    <Field
                      style={{marginBottom:'1em'}}
                      as={TextField}
                      type="text"
                      name="name"
                      label="Enter username"
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      helperText={<ErrorMessage name="name" />}
                    />
                    <Field
                      style={{marginBottom:'1em'}}
                      as={TextField}
                      type="email"
                      name="email"
                      label="Enter Email Address"
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      helperText={<ErrorMessage name="email" />}
                    />
                    <Field
                      style={{marginBottom:'1em'}}
                      as={TextField}
                      type="tel"
                      name="phone"
                      label="Enter Phone Number"
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      helperText={<ErrorMessage name="phone" />}
                    />
                    <Field
                      style={{marginBottom:'1em'}}
                      as={TextField}
                      type="text"
                      name="about"
                      label="About"
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      helperText={<ErrorMessage name="about" />}
                    />
                    <input
                      style={{marginBottom:'1em'}}
                      type="file"
                      onChange={(event) => {
                        setFieldValue("profileImage", event.currentTarget.files[0]);
                      }}
                      accept="image/*"
                    />
                    <ErrorMessage name="profileImage" component="div" className="error" />
                    <Field
                      style={{marginBottom:'1em'}}
                      as={TextField}
                      type="password"
                      name="password"
                      label="Password"
                      autoComplete="current-password"
                      variant="outlined"
                      color="secondary"
                      fullWidth
                      helperText={<ErrorMessage name="password" />}
                    />
                    <Button style={{marginBottom:'1em'}} variant="outlined" disabled={isSubmitting} type="submit">
                      Sign Up
                    </Button>
                  </Form>
                )}
              </Formik>
              <p style={{marginBottom:'1em',marginTop:'1em'}}>
                Already have an Account ?<span className='hyper' onClick={() => setShowLogin(true)}>Log In</span>
              </p>
              {signInStatus ? (
                <Toaster key={signInStatus.key} message={signInStatus.msg} />
              ) : null}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Login;

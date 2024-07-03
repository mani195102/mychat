import React, { useState } from 'react';
import "./animation.css";
import { Backdrop, Button, CircularProgress, TextField } from '@mui/material';
import axios from 'axios';
import logo from '../assets/chatapp.svg';
import { useNavigate } from 'react-router-dom';
import Toaster from "../components/Toaster";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function ForgetPassword() {
  const [loading, setLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  const navigate = useNavigate();

  const initialValues = {
    email: ""
  };

  const validationSchema = Yup.object({
    email: Yup.string().email('Invalid email format').required('Email is required')
  });

  const onSubmitForgetPassword = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      await axios.post("https://mychat-ia72.onrender.com/user/forgotpassword", values, config);
      setResetStatus({ msg: "Password reset instructions sent to your email", key: Math.random() });
    } catch (error) {
      setResetStatus({
        msg: "Something went wrong",
        key: Math.random(),
      });
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
          <h3>Forgot Password?</h3>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmitForgetPassword}
          >
            {({ isSubmitting }) => (
              <Form>
                <Field
                  style={{marginBottom:'1em'}}
                  as={TextField}
                  type="email"
                  name="email"
                  label="Enter your registered Email Address"
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  helperText={<ErrorMessage name="email" />}
                />
                <Button variant="outlined" disabled={isSubmitting} type="submit">
                  Reset Password
                </Button>
              </Form>
            )}
          </Formik>
          {resetStatus && (
            <Toaster key={resetStatus.key} message={resetStatus.msg} />
          )}
        </div>
      </div>
    </>
  );
}

export default ForgetPassword;

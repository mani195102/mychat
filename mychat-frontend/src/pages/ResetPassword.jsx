import React, { useState, useEffect } from 'react';
import "./animation.css";
import { Backdrop, Button, CircularProgress, TextField } from '@mui/material';
import axios from 'axios';
import logo from '../assets/chatapp.svg';
import { useNavigate, useParams } from 'react-router-dom';
import Toaster from "../components/Toaster";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);
  const navigate = useNavigate();
  const { token } = useParams();
  console.log({token})

  const initialValues = {
    password: ""
  };

  const validationSchema = Yup.object({
    password: Yup.string().required('Password is required')
  });

  const onSubmitResetPassword = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      await axios.put(`http://localhost:5000/user/reset_password/${token}`, values,config);
      setResetStatus({ msg: "Password reset successfully", key: Math.random() });
      setTimeout(() => {
        navigate("/");
      }, 3000); // Navigate to '/' after 3 seconds
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

  // Cleanup function to clear resetStatus after navigating away
  useEffect(() => {
    return () => {
      setResetStatus(null);
    };
  }, []);

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
          <h3>Reset Password</h3>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmitResetPassword}
          >
            {({ isSubmitting }) => (
              <Form>
                <Field
                  style={{marginBottom:'1em'}}
                  as={TextField}
                  type="password"
                  name="password"
                  label="Enter new password"
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  helperText={<ErrorMessage name="password" />}
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

export default ResetPassword;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button, CircularProgress, TextField, Typography } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';

const Profile = () => {
  const { id } = useParams(); // Assuming you're using React Router for params
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Fetch profile data based on the ID from your backend
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/user/editProfile/${id}`);
        setProfileData(response.data); // Assuming response.data is { name, phone, profileImage, about }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const initialValues = {
    name: profileData.name || '',
    phone: profileData.phone || '',
    about: profileData.about || '',
    profileImage: null,
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    phone: Yup.string().required('Phone number is required'),
    about: Yup.string(),
    profileImage: Yup.mixed().test('fileSize', 'File size is too large', (value) => {
      if (value) {
        return value.size <= 2000000; // 2MB
      }
      return true; // allow undefined value
    }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    const formData = new FormData();
    for (const key in values) {
      formData.append(key, values[key]);
    }

    try {
      const config = {
        headers: {
          'Content-type': 'multipart/form-data',
        },
      };
      const response = await axios.put(`http://localhost:5000/user/editProfile/${id}`, formData, config);
      console.log('Profile updated successfully:', response.data);
      // Optionally, handle success feedback or navigate somewhere else
    } catch (error) {
      console.error('Error updating profile:', error);
      // Handle error feedback
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            User Profile
          </Typography>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
            {({ isSubmitting, setFieldValue }) => (
              <Form>
                <Field
                  as={TextField}
                  name="name"
                  label="Name"
                  variant="outlined"
                  fullWidth
                  disabled={!editMode}
                  style={{ marginBottom: '1em' }}
                />
                <ErrorMessage name="name" component="div" className="error" />

                <Field
                  as={TextField}
                  name="phone"
                  label="Phone Number"
                  variant="outlined"
                  fullWidth
                  disabled={!editMode}
                  style={{ marginBottom: '1em' }}
                />
                <ErrorMessage name="phone" component="div" className="error" />

                <Field
                  as={TextField}
                  name="about"
                  label="About"
                  variant="outlined"
                  multiline
                  rows={4}
                  fullWidth
                  disabled={!editMode}
                  style={{ marginBottom: '1em' }}
                />
                <ErrorMessage name="about" component="div" className="error" />

                <input
                  type="file"
                  name="profileImage"
                  onChange={(event) => {
                    setFieldValue('profileImage', event.currentTarget.files[0]);
                  }}
                  accept="image/*"
                  disabled={!editMode}
                  style={{ marginBottom: '1em' }}
                />
                <ErrorMessage name="profileImage" component="div" className="error" />

                <div style={{ marginTop: '1em' }}>
                  {!editMode ? (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setEditMode(true)}
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        disabled={isSubmitting}
                        onClick={() => setEditMode(false)}
                        style={{ marginRight: '1em' }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outlined"
                        disabled={isSubmitting}
                        type="submit"
                      >
                        Save
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};

export default Profile;

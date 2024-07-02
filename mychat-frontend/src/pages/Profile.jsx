import React, { useState, useEffect } from 'react';
import {
  Button,
  CircularProgress,
  TextField,
  Typography,
  Avatar,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const lightTheme = useSelector((state) => state.themeKey);
  const [profileData, setProfileData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [fieldToEdit, setFieldToEdit] = useState(null);

  // State to manage form values and errors
  const [formValues, setFormValues] = useState({
    name: '',
    phone: '',
    about: '',
    profileImage: null,
  });
  const [formErrors, setFormErrors] = useState({
    name: '',
    phone: '',
    profileImage: '',
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        const userDataString = localStorage.getItem('userdata');
        if (!userDataString) {
          throw new Error('No user data found');
        }

        const userData = JSON.parse(userDataString);
        const token = userData.token;
        if (!token) {
          throw new Error('No token found');
        }

        const { data } = await axios.get('http://localhost:5000/user/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfileData(data);
        setFormValues({
          name: data.name || '',
          phone: data.phone || '',
          about: data.about || '',
          profileImage: null,
        });
        localStorage.setItem('userdata', JSON.stringify({ ...userData, ...data }));
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
      setLoading(false);
    };

    fetchProfileData();
  }, []);

  // Validation schema using Yup
  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    phone: Yup.string().required('Phone number is required'),
    profileImage: Yup.mixed().test('fileSize', 'File size is too large', (value) => {
      if (value) {
        return value.size <= 2000000; // 2MB
      }
      return true;
    }),
  });

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent default form submission

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', formValues.name);
      formData.append('phone', formValues.phone);
      formData.append('about', formValues.about);
      if (formValues.profileImage) {
        formData.append('profileImage', formValues.profileImage);
      }

      const userDataString = localStorage.getItem('userdata');
      if (!userDataString) {
        throw new Error('No user data found');
      }

      const userData = JSON.parse(userDataString);
      const token = userData.token;
      if (!token) {
        throw new Error('No token found');
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put(`http://localhost:5000/user/editProfile/${profileData._id}`, formData, config);
      setProfileData(response.data);
      localStorage.setItem('userdata', JSON.stringify({ ...userData, ...response.data }));
      setLoading(false);
      setOpenDialog(false); // Close dialog after successful submission
    } catch (error) {
      console.error('Error submitting form:', error);
      setLoading(false);
      // Handle specific errors here, e.g., show error message to user
    }
  };

  // Handle input changes
  const handleInputChange = (event) => {
    const { name, value, files } = event.target;
    if (name === 'profileImage') {
      setFormValues({ ...formValues, [name]: files[0] });
    } else {
      setFormValues({ ...formValues, [name]: value });
    }
  };

  // Open dialog for editing fields
  const handleEditClick = (field) => {
    setFieldToEdit(field);
    setOpenDialog(true);
  };

  // Generate avatar fallback if profile image is not available
  const getAvatarSrc = () => {
    if (profileData.profileImage) {
      return profileData.profileImage;
    } else {
      // Generate fallback avatar based on user's name
      const firstName = profileData.name ? profileData.name.split(' ')[0] : '';
      return `https://ui-avatars.com/api/?name=${firstName}&background=random`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`profile-comp${lightTheme ? '' : ' dark'}`}
      style={{ textAlign: 'center' }}
    >
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <div className="profile-view">
            <Typography variant="h5" className={`pro-text ${lightTheme ? '' : ' dark'}`} gutterBottom>
              User Profile
            </Typography>

            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                className='img-avatar'
                src={getAvatarSrc()}
                alt="Profile"
                style={{ width: 180, height: 180, margin: 'auto' }}
              />
              
              <IconButton
                style={{ position: 'absolute', bottom: 8, right: 8 }}
                onClick={() => handleEditClick('profileImage')}
              >
                <CameraAltIcon />
              </IconButton>
            
            </div>
            <div style={{ marginTop: 20, textAlign: 'left' }}>
              <Typography className="viewtype" style={{ borderBottom: '1px solid' }} variant="h6" gutterBottom>
                Name: {profileData.name}
                <IconButton onClick={() => handleEditClick('name')} style={{ borderBottom: '1px solid' }}>
                  <EditIcon />
                </IconButton>
              </Typography>
              <Typography className="viewtype" style={{ borderBottom: '1px solid' }} variant="h6" gutterBottom>
                About: {profileData.about}
                <IconButton onClick={() => handleEditClick('about')} style={{ borderBottom: '1px solid' }}>
                  <EditIcon />
                </IconButton>
              </Typography>
              <Typography className="viewtype" style={{ borderBottom: '1px solid' }} variant="h6" gutterBottom>
                Phone Number: {profileData.phone}
                <IconButton onClick={() => handleEditClick('phone')} style={{ borderBottom: '1px solid' }}>
                  <EditIcon />
                </IconButton>
              </Typography>
            </div>
          </div>
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit {fieldToEdit}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            {fieldToEdit === 'profileImage' ? (
              <>
                <input
                  type="file"
                  name="profileImage"
                  onChange={handleInputChange}
                  accept="image/*"
                  style={{ marginBottom: '1em' }}
                />
                {formErrors.profileImage && (
                  <div className="error">{formErrors.profileImage}</div>
                )}
              </>
            ) : (
              <>
                <TextField
                  name={fieldToEdit}
                  label={fieldToEdit ? `${fieldToEdit.charAt(0).toUpperCase()}${fieldToEdit.slice(1)}` : ''}
                  variant="outlined"
                  fullWidth
                  value={formValues[fieldToEdit] || ''}
                  onChange={handleInputChange}
                  style={{ marginBottom: '1em',marginTop:'1em'}}
                />

                {formErrors[fieldToEdit] && (
                  <div className="error">{formErrors[fieldToEdit]}</div>
                )}
              </>
            )}
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)} color="primary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                Save
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Profile;

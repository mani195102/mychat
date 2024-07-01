const express = require("express");
const { 
    loginController, 
    registerController, 
    fetchAllUsersController, 
    deleteUserController,
    editUserProfileController // Import editUserProfileController
} = require("../Controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware

const Router = express.Router();

Router.post('/login', loginController);
Router.post('/register', upload.single('profileImage'), registerController); // Add upload middleware for profile image
Router.get('/fetchUsers', protect, fetchAllUsersController);
Router.delete('/delete/:userId', protect, deleteUserController); 
Router.put('/editProfile/:userId', protect, upload.single('profileImage'), editUserProfileController); // Add route for editing user profile

module.exports = Router;

const express = require("express");
const { 
    loginController, 
    registerController, 
    fetchAllUsersController, 
    deleteUserController,
    ProfileController,
    editUserProfileController,
    forgetPasswordController,
    resetPasswordcontroller
} = require("../Controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware

const Router = express.Router();

// Authentication routes
Router.post('/login', loginController);
Router.post('/register', upload.single('profileImage'), registerController);
Router.post('/forgotpassword', forgetPasswordController); // New route for forgot password
Router.put('/reset_password/:token', resetPasswordcontroller); // New route for reset password

// User management routes
Router.get('/fetchUsers', protect, fetchAllUsersController);
Router.delete('/delete/:userId', protect, deleteUserController); 
Router.get('/profile', protect, ProfileController);
Router.put('/editProfile/:userId', protect, upload.single('profileImage'), editUserProfileController);

module.exports = Router;

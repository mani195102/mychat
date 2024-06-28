const express = require("express");
const { loginController, registerController, fetchAllUsersController, deleteUserController } = require("../Controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const Router = express.Router();

Router.post('/login', loginController);
Router.post('/register', registerController);
Router.get('/fetchUsers', protect, fetchAllUsersController);
Router.delete('/delete/:userId', protect, deleteUserController); 

module.exports = Router;

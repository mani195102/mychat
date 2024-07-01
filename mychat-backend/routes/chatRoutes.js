const express = require("express");
const Router = express.Router();
const { protect, isAdmin, checkAdminPermission } = require("../middleware/authMiddleware");
const {
  createGroupChat,
  groupExit,
  fetchGroups,
  fetchChats,
  accessChat,
  addSelfToGroup,
  deleteGroupChat,
  createGroupChatWithAdminPermissions,
} = require("../Controllers/chatContoller");
//const upload = require('../middleware/uploadMiddleware'); // Import upload middleware
const multer = require("multer");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Multer instance
const upload = multer({ storage: storage });

// Routes definition
Router.post('/', protect, accessChat); // Example route
Router.get('/', protect, fetchChats); // Example route
Router.post('/createGroup', upload.single("groupImage"), protect, createGroupChat); // Example route with file upload
Router.get('/fetchGroups', protect, fetchGroups); // Example route
Router.post('/groupExit', protect, groupExit); // Example route
Router.post('/addSelfToGroup', protect, addSelfToGroup); // Example route
Router.delete('/deleteGroup/:groupId', protect, deleteGroupChat); // Example route
Router.post('/createGroupWithAdminPermissions', protect, isAdmin, checkAdminPermission, upload.single("groupImage"), createGroupChatWithAdminPermissions); // Route with isAdmin and checkAdminPermission middleware and file upload

module.exports = Router;

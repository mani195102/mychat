const express = require("express");
const { createGroupChat,groupExit,fetchGroups,fetchChats,accessChat,addSelfToGroup } = require("../Controllers/chatContoller");
const { protect } = require("../middleware/authMiddleware");

const Router = express.Router();

Router.route('/').post(protect, accessChat);
Router.route('/').get(protect, fetchChats);
// Router.route('/createPrivateChat').post(protect, accessChat);
Router.route('/createGroup').post(protect, createGroupChat);
Router.route('/fetchGroups').get(protect, fetchGroups);
Router.route('/groupExit').post(protect, groupExit);
Router.route('/addSelfToGroup').post(protect, addSelfToGroup);

module.exports = Router;
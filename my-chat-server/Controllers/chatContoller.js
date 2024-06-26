const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");


const accessChat = expressAsyncHandler(async (req, res) => {
    const { userId } = req.body;
  
    if (!userId) {
      return res.status(400).send({ message: 'UserId is required' });
    }
  
    let isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate('users', '-password')
      .populate('latestMessage');
  
    isChat = await User.populate(isChat, {
      path: 'latestMessage.sender',
      select: 'name email',
    });
  
    if (isChat.length > 0) {
      res.send(isChat[0]);
    } else {
      const chatData = {
        chatName: 'sender',
        isGroupChat: false,
        users: [req.user._id, userId],
      };
  
      try {
        const createdChat = await Chat.create(chatData);
        const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
        res.status(200).json(fullChat);
      } catch (error) {
        res.status(400);
        throw new Error(error.message);
      }
    }
  });
  
const fetchChats = expressAsyncHandler (async(req,res) =>{
    try{
        Chat.find({users: { $elemMatch: { $eq: req.user._id } } })
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({ updateAt: -1})
        .then(async (results) =>{
            results = await User.populate(results,{
                path: "latestMessage.sender",
                select: "name email",
            });
            res.status(200).send(results);
        });
     } catch (error){
        res.status(400);
        throw new Error(error.message);
     }

});
const fetchGroups = expressAsyncHandler (async(req,res) =>{
    try{
        const allGroups = await Chat.where("isGroupChat").equals(true);
        res.status(200).send(allGroups);
    } catch(error){
        res.status(400);
        throw new Error(error.message);
    }

});
const createGroupChat = expressAsyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Data is insufficient" });
    }

    let users;
    try {
        users = JSON.parse(req.body.users);  // Parse users if it's a JSON string
    } catch (error) {
        users = req.body.users;  // Use it directly if it's already an array
    }

    users.push(req.user);

    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user,
        });
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
const groupExit = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    try {
        // Remove the user from the chat's users array
        const removed = await Chat.findByIdAndUpdate(
            chatId,
            { $pull: { users: userId } },
            { new: true, useFindAndModify: false }
        )
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        if (!removed) {
            res.status(404);
            throw new Error("Chat Not Found");
        } else {
            res.json(removed);
        }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
const addSelfToGroup = expressAsyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    try {
     const added = await Chat.findByIdAndUpdate(
        chatId,
        {
            $push: {users: userId },
        },
        {
            new: true,
        }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

    if(!added) {
        res.status(404);
        throw new Error("Chat Not Found");
    }else{
        res.json(added);
    }
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

module.exports = { accessChat, fetchChats, fetchGroups, createGroupChat, groupExit, addSelfToGroup};


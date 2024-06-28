const expressAsyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const accessChat = expressAsyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send({ message: 'UserId is required' });
  }

  try {
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
      res.status(200).send({ message: 'Chat found', chat: isChat[0] });
    } else {
      const chatData = {
        chatName: 'sender', // Update this with appropriate logic
        isGroupChat: false,
        users: [req.user._id, userId],
      };

      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
      res.status(200).json({ message: 'New chat created', chat: fullChat });
    }
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
  }
});

const fetchChats = expressAsyncHandler(async (req, res) => {
  try {
    const results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    await User.populate(results, {
      path: "latestMessage.sender",
      select: "name email",
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
  }
});

const fetchGroups = expressAsyncHandler(async (req, res) => {
  try {
    const allGroups = await Chat.where("isGroupChat").equals(true);
    res.status(200).send(allGroups);
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
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

    res.status(200).json({ message: 'Group chat created', chat: fullGroupChat });
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
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
      res.status(404).send({ message: "Chat not found" });
    } else {
      res.status(200).json({ message: 'User removed from chat', chat: removed });
    }
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
  }
});

const addSelfToGroup = expressAsyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404).send({ message: "Chat not found" });
    } else {
      res.status(200).json({ message: 'User added to group chat', chat: added });
    }
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
  }
});

const deleteGroupChat = expressAsyncHandler(async (req, res) => {
  const { groupId } = req.params; // Assuming groupId is passed as a URL parameter

  try {
    const deletedGroup = await Chat.findByIdAndDelete(groupId);

    if (!deletedGroup) {
      res.status(404).send({ message: "Group not found" });
    } else {
      res.status(200).json({ message: 'Group deleted successfully' });
    }
  } catch (error) {
    res.status(500).send({ message: 'Server error', error: error.message });
  }
});

module.exports = { accessChat, fetchChats, fetchGroups, createGroupChat, groupExit, addSelfToGroup, deleteGroupChat };

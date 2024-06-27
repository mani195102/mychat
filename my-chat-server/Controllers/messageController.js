const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const cloudinary = require("../config/cloudinary");

const allMessages = expressAsyncHandler(async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .populate("receiver")
      .populate("chat");

    if (!messages) {
      return res.status(404).send({ message: "Messages not found for this chat" });
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
});

const sendMessage = expressAsyncHandler(async (req, res) => {
  const { content, chatId } = req.body;
  let mediaUrl = "";

  if (req.file) {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto"
      });
      mediaUrl = result.secure_url;
    } catch (error) {
      return res.status(500).send({ message: "Error uploading file", error: error.message });
    }
  }

  if (!content && !mediaUrl) {
    return res.status(400).send({ message: "Content or media is required" });
  }

  const newMessage = {
    sender: req.user._id,
    content: content || "",
    chat: chatId,
    media: mediaUrl,
  };

  try {
    let message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await message.populate("receiver");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.status(200).json(message);
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
});

module.exports = { allMessages, sendMessage };

const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

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
  let mediaPath = "";

  if (req.file) {
    mediaPath = `/uploads/${req.file.filename}`;
  }

  if (!content && !mediaPath) {
    return res.status(400).send({ message: "Content or media is required" });
  }

  var newMessage = {
    sender: req.user._id,
    content: content || "",
    chat: chatId,
    media: mediaPath,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic");
    message = await message.populate("chat");
    message = await message.populate("receiver");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.status(200).json({ message: "Message sent successfully", message });
  } catch (error) {
    res.status(500).send({ message: "Server error", error: error.message });
  }
});

module.exports = { allMessages, sendMessage };

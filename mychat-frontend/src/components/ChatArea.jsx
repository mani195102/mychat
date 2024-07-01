import React, { useContext, useEffect, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MessageSelf from "./MessageSelf";
import MessageOthers from "./MessageOthers";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";
import axios from "axios";
import { myContext } from "./MainContainer";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

const ENDPOINT = "http://localhost:5000/";
let socket;

function ChatArea() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [messageContent, setMessageContent] = useState("");
  const [file, setFile] = useState(null);
  const messagesEndRef = useRef(null);
  const dyParams = useParams();
  const [chat_id, chat_user] = dyParams._id.split("&");
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("userdata"));
  const [allMessages, setAllMessages] = useState([]);
  const { refresh, setRefresh } = useContext(myContext);
  const [loaded, setLoaded] = useState(false);
  const [socketConnectionStatus, setSocketConnectionStatus] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(ENDPOINT);
      socket.emit("setup", userData);
      socket.on("connected", () => {
        setSocketConnectionStatus(true);
      });
    }

    socket.on("message received", (newMessage) => {
      if (newMessage.chat._id === chat_id) { // Ensure message is for this chat area
        setAllMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [chat_id, userData]);

  useEffect(() => {
    const fetchMessages = async () => {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      };
      try {
        const { data } = await axios.get(`http://localhost:5000/message/${chat_id}`, config);
        setAllMessages(data);
        setLoaded(true);
        socket.emit("join chat", chat_id);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [refresh, chat_id, userData.token]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const sendMessage = async () => {
    if (!messageContent.trim() && !file) {
      setOpenDialog(true);
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    const formData = new FormData();
    formData.append("content", messageContent);
    formData.append("chatId", chat_id);
    if (file) {
      formData.append("file", file);
    }

    try {
      const { data } = await axios.post("http://localhost:5000/message/", formData, config);
      socket.emit("new message", data);
      setMessageContent("");
      setFile(null);
      setRefresh((prev) => !prev);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      };

      const deleteEndpoint = `http://localhost:5000/chat/deleteGroup/${chat_id}`;

      await axios.delete(deleteEndpoint, config);

      const response = await axios.get("http://localhost:5000/chat/", config);
      const updatedChats = response.data;

      if (updatedChats.length > 0) {
        const nextChat = updatedChats[0];
        const nextChatUser = nextChat.isGroupChat ? nextChat.chatName : nextChat.users.find(user => user._id !== userData._id).name;
        navigate(`/app/chat/${nextChat._id}&${nextChatUser}`);
        setRefresh((prev) => !prev);
      } else {
        navigate("/app/welcome");
      }

      setAllMessages([]);
      setLoaded(false);
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  if (!loaded) {
    return (
      <div
        style={{
          border: "20px",
          padding: "10px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
        <Skeleton
          variant="rectangular"
          sx={{
            width: "100%",
            borderRadius: "10px",
            flexGrow: "1",
          }}
        />
        <Skeleton
          variant="rectangular"
          sx={{ width: "100%", borderRadius: "10px" }}
          height={60}
        />
      </div>
    );
  }

  const getInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const getProfileImage = () => {
    // Check if the chat is a group chat based on chat_id or some other indicator
    const isGroupChat = chat_user.includes("group"); // Update this condition based on your actual logic
    const chatUserImage = sessionStorage.getItem('chatUserImage');
    const groupImage = sessionStorage.getItem('groupImage');
    
    if (isGroupChat) {
      // Mock group image logic
      // Replace with actual group image logic if needed
      return (
        <div className="profile-image">
          <img src={groupImage} alt="Group Profile" className="profile-img" />
        </div>
      );
    } else {
      // Assume the user profile image is stored in sessionStorage chatUserImage
      return chatUserImage ? (
        <div className="profile-image">
          <img src={chatUserImage} alt="User Profile" className="profile-img" />
        </div>
      ) : (
        <div className="profile-image">
          {getInitial(chat_user)}
        </div>
      );
    }
  };
  
  return (
    <motion.div
      className={"chatArea-container" + (lightTheme ? "" : " dark")}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div className={"chatArea-header" + (lightTheme ? "" : " dark")}>
        <div className={"con-icon" + (lightTheme ? "" : " dark")}>
          {getProfileImage()}
        </div>
        <div className={"header-text" + (lightTheme ? "" : " dark")}>
          <p className={"con-title" + (lightTheme ? "" : " dark")}>
            {chat_user}
          </p>
        </div>
        <IconButton className={"icon" + (lightTheme ? "" : " dark")} onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </div>
      <div className={"messages-container" + (lightTheme ? "" : " dark")}>
        <AnimatePresence>
          {allMessages
            .slice(0)
            .reverse()
            .map((message) => {
              const sender = message.sender;
              const self_id = userData._id;
              const key = message._id;
  
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {sender._id === self_id ? (
                    <MessageSelf props={message} />
                  ) : (
                    <MessageOthers props={message} />
                  )}
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
      <div ref={messagesEndRef} className="BOTTOM" />
      <motion.div
        className={"text-input-area" + (lightTheme ? "" : " dark")}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <input
          placeholder="Type a Message"
          className={"search-box" + (lightTheme ? "" : " dark")}
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={(event) => {
            if (event.code === "Enter") {
              sendMessage();
            }
          }}
        />
        <div>
          <label className={`file-input-label${lightTheme ? '' : ' dark'}`}>
            <input
              id="file-input"
              type="file"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <IconButton
              className={`file-input-icon${lightTheme ? '' : ' dark'}`}
              component="span"
            >
              <AttachFileIcon />
            </IconButton>
          </label>
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={sendMessage}
          >
            <SendIcon />
          </IconButton>
        </div>
      </motion.div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{"Empty Message Alert"}</DialogTitle>
        <DialogContent>
          <p>Please enter a message or attach a file before sending.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );  
}

export default ChatArea;

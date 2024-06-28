import React, { useContext, useEffect, useState } from "react";
import { IconButton, Snackbar } from "@mui/material";
import {
  AccountCircle as AccountCircleIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
  Nightlight as NightlightIcon,
  LightMode as LightModeIcon,
  ExitToApp as ExitToAppIcon,
  AddCircle as AddCircleIcon,
  Search as SearchIcon,
  Lock as LockIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Features/themeSlice";
import { useNavigate } from "react-router-dom";
import { myContext } from "./MainContainer";
import io from "socket.io-client";

const ENDPOINT = "http://localhost:5000/";
let socket;

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const { refresh, setRefresh } = useContext(myContext);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userData = JSON.parse(localStorage.getItem("userdata"));
  const [newMessagesSnackbarOpen, setNewMessagesSnackbarOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null); // Track the active chat ID
  const [messageHighlights, setMessageHighlights] = useState({}); // Track message highlights by chat ID

  useEffect(() => {
    if (!userData) {
      navigate("/");
      return;
    }

    if (!socket) {
      socket = io(ENDPOINT);
      socket.emit("setup", userData);
      socket.on("connected", () => {
        console.log("Socket connected");
      });
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    axios
      .get("http://localhost:5000/chat/", config)
      .then((response) => {
        setConversations(response.data);
      })
      .catch((error) => {
        console.error("Error fetching conversations:", error);
      });

    socket.on("message received", (newMessage) => {
      // Update conversations with new message count
      setConversations((prevConversations) => {
        const updatedConversations = prevConversations.map((conversation) => {
          if (conversation._id === newMessage.chat._id) {
            return {
              ...conversation,
              latestMessage: newMessage,
              hasNewMessages: true,
            };
          }
          return conversation;
        });
        return updatedConversations;
      });

      // Highlight new message if not in active chat
      if (newMessage.chat._id !== activeChatId) {
        setMessageHighlights((prevHighlights) => ({
          ...prevHighlights,
          [newMessage.chat._id]: true,
        }));
        setNewMessagesSnackbarOpen(true);
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [refresh, userData, navigate, activeChatId]);

  const handleLogout = () => {
    localStorage.removeItem("userdata");
    navigate("/");
  };

  const handleCloseSnackbar = () => {
    setNewMessagesSnackbarOpen(false);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredConversations = conversations.filter((conversation) => {
    let chatName = "";
    if (conversation.isGroupChat) {
      chatName = conversation.chatName.toLowerCase();
    } else {
      conversation.users.forEach((user) => {
        if (user._id !== userData._id) {
          chatName = user.name.toLowerCase();
        }
      });
    }
    return chatName.includes(searchTerm);
  });

  const handleConversationClick = (conversation) => {
    navigate(`chat/${conversation._id}&${getChatDisplayName(conversation)}`);
    setRefresh((prev) => !prev);

    // Reset new message indicators and clear message highlights for the clicked conversation
    const updatedConversations = conversations.map((conv) =>
      conv._id === conversation._id
        ? { ...conv, hasNewMessages: false }
        : conv
    );
    setConversations(updatedConversations);

    setMessageHighlights((prevHighlights) => ({
      ...prevHighlights,
      [conversation._id]: false,
    }));

    setActiveChatId(conversation._id); // Update active chat ID
  };

  const getChatDisplayName = (conversation) => {
    if (conversation.isGroupChat) {
      return conversation.chatName;
    } else {
      const otherUser = conversation.users.find((user) => user._id !== userData._id);
      return otherUser ? otherUser.name : "";
    }
  };

  return (
    <div className="sidebar-container">
      <div className={"sb-header" + (lightTheme ? "" : " dark")}>
        <div className="other-icons">
          <IconButton onClick={() => navigate("/app/welcome")}>
            <AccountCircleIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => navigate("users")}>
            <PersonAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => navigate("groups")}>
            <GroupAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => navigate("create-groups")}>
            <AddCircleIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => navigate("private-chat")}>
            <LockIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
          <IconButton onClick={() => dispatch(toggleTheme())}>
            {lightTheme ? (
              <LightModeIcon className={"icon" + (lightTheme ? "" : " dark")} />
            ) : (
              <NightlightIcon className={"icon" + (lightTheme ? "" : " dark")} />
            )}
          </IconButton>
          <IconButton onClick={handleLogout}>
            <ExitToAppIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
        </div>
      </div>
      <div className={"sb-search" + (lightTheme ? "" : " dark")}>
        <IconButton className={"icon" + (lightTheme ? "" : " dark")}>
          <SearchIcon />
        </IconButton>
        <input
          placeholder="Search"
          className={"search-box" + (lightTheme ? "" : " dark")}
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className={"sb-conversations" + (lightTheme ? "" : " dark")}>
        {filteredConversations.map((conversation, index) => {
          const chatDisplayName = getChatDisplayName(conversation);
          let latestMessageContent =
            conversation.latestMessage?.content ||
            "No previous messages, click here to start a new chat";

          // Truncate latest message content to 5 characters
          if (latestMessageContent.length > 30) {
            latestMessageContent = latestMessageContent.substring(0, 30) + "...";
          }

          // Determine styles based on active chat or new messages
          const isActive = conversation._id === activeChatId;
          const isHighlighted = messageHighlights[conversation._id];
          const messageStyle = isActive
            ? {}
            : isHighlighted
            ? { fontWeight: "bold", color: "orangered", fontSize: '1.2rem' }
            : {};

          return (
            <div
              key={index}
              className={`conversation-container ${
                conversation.hasNewMessages ? "new-message" : ""
              }`}
              onClick={() => handleConversationClick(conversation)}
            >
              <p className={"con-icon" + (lightTheme ? "" : " dark")}>
                {chatDisplayName[0]}
              </p>
              <div className="conversation-details">
                <p className={"con-title" + (lightTheme ? "" : " dark")}>
                  {chatDisplayName}
                </p>
                <p className="con-lastMessage" style={messageStyle}>
                  {conversation.hasNewMessages ? (
                    <strong>{latestMessageContent}</strong>
                  ) : (
                    latestMessageContent
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Snackbar for new messages */}
      <Snackbar
        open={newMessagesSnackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message="You have new messages"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      />
    </div>
  );
}

export default Sidebar;

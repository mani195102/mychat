import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconButton, Avatar } from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import axios from "axios";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";

const ENDPOINT = "https://mychat-ia72.onrender.com/";

function SearchAndConversations() {
  const lightTheme = useSelector((state) => state.themeKey);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChatId, setActiveChatId] = useState(null);
  const [messageHighlights, setMessageHighlights] = useState({});
  const [userData, setUserData] = useState(
    JSON.parse(localStorage.getItem("userdata")) || null
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!userData) {
      navigate("/");
      return;
    }

    const socket = io(ENDPOINT);
    socket.emit("setup", userData);
    socket.on("connected", () => {
      console.log("Socket connected");
    });

    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    axios
      .get("https://mychat-ia72.onrender.com/chat/", config)
      .then((response) => {
        setConversations(response.data);
      })
      .catch((error) => {
        console.error("Error fetching conversations:", error);
      });

    socket.on("message received", (newMessage) => {
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

      if (newMessage.chat._id !== activeChatId) {
        setMessageHighlights((prevHighlights) => ({
          ...prevHighlights,
          [newMessage.chat._id]: true,
        }));
      }
    });

    return () => {
      socket.off("message received");
      socket.disconnect();
    };
  }, [userData, activeChatId, navigate]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleConversationClick = (conversation) => {
    setActiveChatId(conversation._id);
    navigate(`/app/chat/${conversation._id}&${getChatDisplayName(conversation)}`);
  };

  const getChatDisplayName = (conversation) => {
    if (conversation.isGroupChat) {
      return conversation.chatName;
    } else {
      const otherUser = conversation.users.find(
        (user) => user._id !== userData._id
      );
      return otherUser ? otherUser.name : "";
    }
  };

  return (
    <div className="se-conversation">
      <div className={`sb-search ${lightTheme ? "" : "dark"}`}>
        <IconButton className={`icon ${lightTheme ? "" : "dark"}`}>
          <SearchIcon />
        </IconButton>
        <input
          placeholder="Search"
          className={`search-box ${lightTheme ? "" : "dark"}`}
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <div className={`sb-conversations ${lightTheme ? "" : "dark"}`}>
        {conversations
          .filter((conversation) => {
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
            return chatName.includes(searchTerm.toLowerCase());
          })
          .map((conversation, index) => {
            const chatDisplayName = getChatDisplayName(conversation);
            let latestMessageContent =
              conversation.latestMessage?.content ||
              "No previous messages, click here to start a new chat";

            if (latestMessageContent.length > 30) {
              latestMessageContent =
                latestMessageContent.substring(0, 30) + "...";
            }

            const isActive = conversation._id === activeChatId;
            const isHighlighted = messageHighlights[conversation._id];
            const messageStyle = isActive
              ? {}
              : isHighlighted
              ? { fontWeight: "bold", color: "orangered", fontSize: "1rem" }
              : {};

            return (
              <div
                key={index}
                className={`conversation-container ${
                  conversation.hasNewMessages ? "new-message" : ""
                }`}
                onClick={() => handleConversationClick(conversation)}
              >
                <div className={`con-icon ${lightTheme ? "" : "dark"}`}>
                  {conversation.isGroupChat ? (
                    conversation.groupImage ? (
                      <Avatar
                        src={conversation.groupImage}
                        alt="Group Image"
                        className={`profile-image icon ${lightTheme ? "" : "dark"}`}
                      />
                    ) : (
                      <Avatar className={`avatar-initials ${lightTheme ? "" : "dark"}`}>
                        {chatDisplayName[0]}
                      </Avatar>
                    )
                  ) : (
                    <Avatar
                      src={conversation.users.find((user) => user._id !== userData._id)?.profileImage}
                      alt="User Profile"
                      className={`profile-image icon ${lightTheme ? "" : "dark"}`}
                    />
                  )}
                </div>
                <div className="conversation-details">
                  <p className={`con-title ${lightTheme ? "" : "dark"}`}>
                    {chatDisplayName}
                  </p>
                  <p
                    className={`con-snippet ${lightTheme ? "" : "dark"}`}
                    style={messageStyle}
                  >
                    {latestMessageContent}
                  </p>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default SearchAndConversations;

import React, { useContext, useEffect, useState } from "react";
import {
  IconButton,
  Snackbar,
  Popover,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from "@mui/material";
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
  Chat as ChatIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import HomeIcon from '@mui/icons-material/Home';
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Features/themeSlice";
import { useNavigate, Link } from "react-router-dom";
import { myContext } from "./MainContainer";
import io from "socket.io-client";

const ENDPOINT = "https://mychat-ia72.onrender.com/";
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
  const [activeChatId, setActiveChatId] = useState(null);
  const [messageHighlights, setMessageHighlights] = useState({});
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State to track if menu is open
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for popover

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
        setNewMessagesSnackbarOpen(true);
        showNotification(newMessage);
      }
    });

    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("Notification permission granted");
        }
      });
    }

    return () => {
      socket.off("message received");
    };
  }, [refresh, userData, navigate, activeChatId]);

  const showNotification = (message) => {
    if (Notification.permission === "granted") {
      const otherUser = message.sender.name;
      const notification = new Notification("New Message", {
        body: `${otherUser}: ${message.content}`,
        icon: "/path/to/icon.png", // Ensure this path is correct
      });

      notification.onclick = () => {
        window.focus();
      };
    }
  };

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

  // const handleConversationClick = (conversation) => {
  //   navigate(`chat/${conversation._id}&${getChatDisplayName(conversation)}`);
  //   setRefresh((prev) => !prev);

  //   const updatedConversations = conversations.map((conv) =>
  //     conv._id === conversation._id ? { ...conv, hasNewMessages: false } : conv
  //   );
  //   setConversations(updatedConversations);

  //   setMessageHighlights((prevHighlights) => ({
  //     ...prevHighlights,
  //     [conversation._id]: false,
  //   }));

  //   setActiveChatId(conversation._id);
  //   sessionStorage.setItem('chatUserName', getChatDisplayName(conversation));
  //   sessionStorage.setItem('chatUserImage', getOtherUserProfileImage(conversation));
  //   sessionStorage.setItem('chatUserToken', userData.token);
  //   sessionStorage.setItem('groupImage', conversation.groupImage || '');
  // };

  const handleConversationClick = (conversation) => {
    // Determine if it's a group chat or user-to-user chat
    const isGroupChat = conversation.isGroupChat;
    const chatDisplayName = getChatDisplayName(conversation);
    const chatUserImage = isGroupChat ? (conversation.groupImage || '') : getOtherUserProfileImage(conversation);
  
    // Set sessionStorage items based on chat type
    sessionStorage.setItem('chatUserName', chatDisplayName);
    sessionStorage.setItem('chatUserImage', chatUserImage);
    sessionStorage.setItem('chatUserToken', userData.token);
    sessionStorage.setItem('groupImage', isGroupChat ? (conversation.groupImage || '') : '');
  
    // Navigate to chat page
    navigate(`chat/${conversation._id}&${chatDisplayName}`);
  
    // Update state and reset new message flag
    setRefresh((prev) => !prev);
    const updatedConversations = conversations.map((conv) =>
      conv._id === conversation._id ? { ...conv, hasNewMessages: false } : conv
    );
    setConversations(updatedConversations);
  
    setMessageHighlights((prevHighlights) => ({
      ...prevHighlights,
      [conversation._id]: false,
    }));
  
    setActiveChatId(conversation._id);
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

  const getOtherUserProfileImage = (conversation) => {
    const otherUser = conversation.users.find(
      (user) => user._id !== userData._id
    );
    return otherUser ? otherUser.profileImage : null;
  };

  const handleMenuToggle = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen((prev) => !prev);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="sidebar-container">
      <div className={"sb-header" + (lightTheme ? "" : " dark")}>
        <div className="menu-icon">
          {screenWidth <= 480 && (
            <IconButton onClick={handleMenuToggle}>
              <MenuIcon className={"icon" + (lightTheme ? "" : " dark")} />
            </IconButton>
          )}
        </div>
        <div className="other-icons">
          <Link to= {`/app/profile/${userData._id}`}>
            {/* Render Profile Image or AccountCircleIcon */}
            {userData.profileImage ? (
              <Avatar src={userData.profileImage} className={"profile-image icon" + (lightTheme ? "" : " dark")} />
            ) : (
              <AccountCircleIcon className={"icon" + (lightTheme ? "" : " dark")} />
            )}
          </Link>
          <Link to= "/app/welcome">
            <IconButton>
              <HomeIcon className={"icon" + (lightTheme ? "" : " dark")} />
            </IconButton>
            </Link>
          {screenWidth <= 992 && (
            <IconButton onClick={() => navigate("/app/conversations")}>
              <ChatIcon className={"icon" + (lightTheme ? "" : " dark")} />
            </IconButton>
          )}
          {screenWidth >= 480 && (
            <>
              <IconButton onClick={() => navigate("/app/users")}>
                <PersonAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
              </IconButton>
              <IconButton onClick={() => navigate("/app/groups")}>
                <GroupAddIcon className={"icon" + (lightTheme ? "" : " dark")} />
              </IconButton>
              <IconButton onClick={() => navigate("/app/create-groups")}>
                <AddCircleIcon className={"icon" + (lightTheme ? "" : " dark")} />
              </IconButton>
              <IconButton onClick={() => dispatch(toggleTheme())}>
                {lightTheme ? (
                  <LightModeIcon className={"icon" + (lightTheme ? "" : " dark")} />
                ) : (
                  <NightlightIcon className={"icon" + (lightTheme ? "" : " dark")} />
                )}
              </IconButton>
            </>
          )}
          <IconButton onClick={handleLogout}>
            <ExitToAppIcon className={"icon" + (lightTheme ? "" : " dark")} />
          </IconButton>
        </div>
      </div>
      <div className="sidebar-content">
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
                <div className={"con-icon" + (lightTheme ? "" : " dark")}>
                  {conversation.isGroupChat ? (
                    conversation.groupImage ? (
                      <Avatar
                        src={conversation.groupImage}
                        alt="Group Image"
                        className={"profile-image icon" + (lightTheme ? "" : " dark")}
                      />
                    ) : (
                      <span>{chatDisplayName[0]}</span>
                    )
                  ) : (
                    <Avatar
                      src={getOtherUserProfileImage(conversation)}
                      alt="User Profile Image"
                      className={"profile-image icon" + (lightTheme ? "" : " dark")}
                    />
                  )}
                </div>
                <div className="conversation-details">
                  <p className={"con-title" + (lightTheme ? "" : " dark")}>
                    {chatDisplayName}
                  </p>
                  <p
                    className={"con-snippet" + (lightTheme ? "" : " dark")}
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
      <Snackbar
        open={newMessagesSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="You have new messages!"
      />
      {/* Menu Popover */}
      <Popover
        open={isMenuOpen}
        anchorEl={anchorEl}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <div style={{ padding: "8px", minWidth: "200px" }}>
          <IconButton
            onClick={handleCloseMenu}
            style={{
              position: "absolute",
              right: "8px",
              top: "8px",
              zIndex: 1, // Ensure the close icon is above other elements
            }}
          >
            <CloseIcon />
          </IconButton>
          <List>
          <ListItem button onClick={() => navigate("/app/welcome")}>
              <ListItemText primary="Welcome" />
            </ListItem>
            <ListItem button onClick={() => navigate("/app/users")}>
              <ListItemText primary="Users" />
            </ListItem>
            <ListItem button onClick={() => navigate("/app/groups")}>
              <ListItemText primary="Groups" />
            </ListItem>
            <ListItem button onClick={() => navigate("/app/create-groups")}>
              <ListItemText primary="Create Groups" />
            </ListItem>
            <ListItem button onClick={() => navigate("/app/private-chat")}>
              <ListItemText primary="Private Chat" />
            </ListItem>
            <ListItem button onClick={() => dispatch(toggleTheme())}>
              <ListItemText primary="Toggle Theme" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </div>
      </Popover>
    </div>
  );
}

export default Sidebar;

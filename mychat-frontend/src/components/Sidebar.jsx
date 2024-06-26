import React, { useContext, useEffect, useState } from "react";
import {
  AccountCircle as AccountCircleIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
  Nightlight as NightlightIcon,
  LightMode as LightModeIcon,
  ExitToApp as ExitToAppIcon,
  AddCircle as AddCircleIcon,
  Search as SearchIcon,
  Lock as LockIcon, // Import LockIcon for private chat
} from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../Features/themeSlice";
import axios from "axios";
import { myContext } from "./MainContainer";

function Sidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);
  const { refresh, setRefresh } = useContext(myContext);
  const [conversations, setConversations] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userdata"));

  useEffect(() => {
    if (!userData) {
      navigate("/");
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    axios.get("http://localhost:5000/chat/", config)
      .then((response) => {
        setConversations(response.data);
      })
      .catch((error) => {
        console.error("Error fetching conversations:", error);
      });
  }, [refresh, userData, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userdata");
    navigate("/");
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
            <LockIcon className={"icon" + (lightTheme ? "" : " dark")} /> {/* Add Private Chat Icon */}
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
        />
      </div>
      <div className={"sb-conversations" + (lightTheme ? "" : " dark")}>
        {conversations.map((conversation, index) => {
          let chatName = '';
          if (conversation.isGroupChat) {
            chatName = conversation.chatName;
          } else {
            conversation.users.forEach((user) => {
              if (user._id !== userData._id) {
                chatName = user.name;
              }
            });
          }

          const latestMessageContent = conversation.latestMessage?.content || "No previous messages, click here to start a new chat";

          return (
            <div
              key={index}
              className="conversation-container"
              onClick={() => {
                navigate(`chat/${conversation._id}&${chatName}`);
                setRefresh((prev) => !prev);
              }}
            >
              <p className={"con-icon" + (lightTheme ? "" : " dark")}>
                {chatName[0]}
              </p>
              <div className="conversation-details">
                <p className={"con-title" + (lightTheme ? "" : " dark")}>
                  {chatName}
                </p>
                <p className="con-lastMessage">{latestMessageContent}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;

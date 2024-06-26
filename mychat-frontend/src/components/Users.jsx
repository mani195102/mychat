import React, { useContext, useEffect, useState } from "react";
import "./myStyles.css";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, Snackbar } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import logo from "../assets/chatapp.svg";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { refreshSidebarFun } from "../Features/refreshSidebar";
import { myContext } from "./MainContainer";

function Users() {
  const { refresh, setRefresh } = useContext(myContext);
  const lightTheme = useSelector((state) => state.themeKey);
  const [users, setUsers] = useState([]);
  const userData = JSON.parse(localStorage.getItem("userdata"));
  const nav = useNavigate();
  const dispatch = useDispatch();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  if (!userData) {
    console.log("User not Authenticated");
    nav(-1);
  }

  useEffect(() => {
    console.log("Users refreshed");
    fetchUsers();
  }, [refresh]);

  const fetchUsers = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      };
      const response = await axios.get("http://localhost:5000/user/fetchUsers", config);
      console.log("Users data refreshed");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleUserClick = async (user) => {
    console.log("Creating chat with ", user.name);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userData.token}`,
        },
      };
      await axios.post(
        "http://localhost:5000/chat/",
        {
          userId: user._id,
        },
        config
      );

      dispatch(refreshSidebarFun());

      // Display Snackbar notification
      const notificationMessage = `Message sent to ${user.name}`;
      setSnackbarMessage(notificationMessage);
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{
          duration: "0.3",
        }}
        className="list-container"
      >
        <div className={"ug-header" + (lightTheme ? "" : " dark")}>
          <img
            src={logo}
            style={{ height: "2rem", width: "2rem", marginLeft: "10px" }}
          />
          <p className={"ug-title" + (lightTheme ? "" : " dark")}>
            Available Users
          </p>
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={() => {
              setRefresh(!refresh);
            }}
          >
            <RefreshIcon />
          </IconButton>
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
        <div className="ug-list">
          {users.map((user, index) => (
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={"list-item" + (lightTheme ? "" : " dark")}
              key={user._id}
              onClick={() => handleUserClick(user)}
            >
              <p className={"con-icon" + (lightTheme ? "" : " dark")}>T</p>
              <p className={"con-title" + (lightTheme ? "" : " dark")}>
                {user.name}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </AnimatePresence>
  );
}

export default Users;
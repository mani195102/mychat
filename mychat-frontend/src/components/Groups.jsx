import React, { useContext, useEffect, useState } from "react";
import "./myStyles.css";
import SearchIcon from "@mui/icons-material/Search";
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
} from "@mui/material";
import logo from "../assets/chatapp.svg";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import RefreshIcon from "@mui/icons-material/Refresh";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { refreshSidebarFun } from "../Features/refreshSidebar";
import { myContext } from "./MainContainer";

function Groups() {
  const { refresh, setRefresh } = useContext(myContext);
  const lightTheme = useSelector((state) => state.themeKey);
  const dispatch = useDispatch();
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const userData = JSON.parse(localStorage.getItem("userdata"));
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const nav = useNavigate();

  if (!userData) {
    console.log("User not Authenticated");
    nav("/");
  }

  useEffect(() => {
    console.log("Users refreshed : ", userData.token);
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    axios
      .get("http://localhost:5000/chat/fetchGroups", config)
      .then((response) => {
        console.log("Group Data from API ", response.data);
        setGroups(response.data);
      });
  }, [refresh]);

  const handleGroupClick = (group) => {
    if (!group || !group.chatName.trim()) {
      setOpenDialog(true);
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    axios.post(
      "http://localhost:5000/chat/addSelfToGroup",
      {
        userId: userData._id,
        chatId: group._id,
      },
      config
    );

    dispatch(refreshSidebarFun());
    console.log("Creating chat with group", group.chatName);
  };

  const handleDeleteGroup = async (groupId) => {
    const config = {
      headers: {
        Authorization: `Bearer ${userData.token}`,
      },
    };

    try {
      const response = await axios.delete(
        `http://localhost:5000/chat/deleteGroup/${groupId}`,
        config
      );

      setSnackbarMessage("Group deleted successfully");
      setSnackbarOpen(true);

      // Remove the deleted group from the local state
      setGroups(groups.filter((group) => group._id !== groupId));
    } catch (error) {
      console.error("Error deleting group:", error);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const filteredGroups = groups.filter((group) =>
    group.chatName.toLowerCase().includes(searchTerm)
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{
          ease: "anticipate",
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
            Available Groups
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
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="ug-list">
          {filteredGroups.map((group) => (
            <motion.div
              key={group._id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={"list-item" + (lightTheme ? "" : " dark")}
              onClick={() => handleGroupClick(group)}
            >
              <div className="ug-row">
                <p className={"con-icon" + (lightTheme ? "" : " dark")}>
                  {group.chatName ? group.chatName[0] : ""}
                </p>
                <p className={"con-title" + (lightTheme ? "" : " dark")}>
                  {group.chatName}
                </p>
              </div>
              <IconButton
                className={"delete-icon" + (lightTheme ? "" : " dark")}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the handleGroupClick from firing
                  handleDeleteGroup(group._id);
                }}
              >
                <DeleteOutlineRoundedIcon />
              </IconButton>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Dialog for Empty Group Name */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{"Empty Group Name Alert"}</DialogTitle>
        <DialogContent>
          <p>Please enter a group name before proceeding.</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for group deletion */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <Button
            color="secondary"
            size="small"
            onClick={() => setSnackbarOpen(false)}
          >
            Close
          </Button>
        }
      />
    </AnimatePresence>
  );
}

export default Groups;

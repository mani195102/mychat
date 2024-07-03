import React, { useState } from "react";
import grouplogo from "../assets/chatgroup.svg";
import { motion } from "framer-motion";
import DoneOutlineRoundedIcon from "@mui/icons-material/DoneOutlineRounded";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateGroups() {
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(localStorage.getItem("userdata"));
  const nav = useNavigate();

  // State for group name, image, users, dialog, and snackbar
  const [groupName, setGroupName] = useState("");
  const [groupImage, setGroupImage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]); // State to hold selected users

  // Redirect to login if user not authenticated (consider useEffect for cleaner effect handling)
  if (!userData) {
    console.log("User not Authenticated");
    nav("/");
  }

  const user = userData;

  const handleClickOpen = () => {
    if (!groupName.trim()) {
      setSnackbarMessage("Group name cannot be empty");
      setSnackbarOpen(true);
      return;
    }
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleImageChange = (e) => {
    setGroupImage(e.target.files[0]);
  };

  const handleUserChange = (event) => {
    // Handle selecting users from the Select component
    setSelectedUsers(event.target.value);
  };

  // Function to create group with admin permissions
  const createGroupWithAdminPermissions = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const formData = new FormData();
    formData.append("name", groupName);
    formData.append("users", JSON.stringify(selectedUsers)); // Include selected users
    if (groupImage) {
      formData.append("groupImage", groupImage);
    }

    try {
      await axios.post(
        "https://mychat-ia72.onrender.com/chat/createGroupWithAdminPermissions",
        formData,
        config
      );

      // Show snackbar on successful creation
      setSnackbarMessage("Group with admin permissions created successfully");
      setSnackbarOpen(true);

      // Navigate to groups page after a short delay
      setTimeout(() => {
        nav("/app/groups");
      }, 1500); // Adjust delay as needed
    } catch (error) {
      console.error("Error creating group with admin permissions:", error);
      setSnackbarMessage("Error creating group");
      setSnackbarOpen(true);
    }
  };

  // Function to create group
  const createGroup = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "multipart/form-data",
      },
    };

    const formData = new FormData();
    formData.append("name", groupName);
    formData.append("users", JSON.stringify(selectedUsers)); // Include selected users
    if (groupImage) {
      formData.append("groupImage", groupImage);
    }

    try {
      await axios.post(
        "https://mychat-ia72.onrender.com/chat/createGroup",
        formData,
        config
      );

      // Show snackbar on successful creation
      setSnackbarMessage("Group created successfully");
      setSnackbarOpen(true);

      // Navigate to groups page after a short delay
      setTimeout(() => {
        nav("/app/groups");
      }, 1500); // Adjust delay as needed
    } catch (error) {
      console.error("Error creating group:", error);
      setSnackbarMessage("Error creating group");
      setSnackbarOpen(true);
    }
  };

  // Handle create group based on user role
  const handleCreateGroup = () => {
    if (user.isAdmin) {
      createGroupWithAdminPermissions();
    } else {
      createGroup();
    }
  };

  return (
    <>
      <div>
        <Dialog
          open={openDialog}
          onClose={handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Do you want to create a Group Named " + groupName + "?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This will create a group in which you will be the admin and others
              will be able to join this group.
            </DialogContentText>
            <FormControl fullWidth>
              <InputLabel id="users-label">Select Users</InputLabel>
              <Select
                labelId="users-label"
                id="users-select"
                multiple
                value={selectedUsers}
                onChange={handleUserChange}
                inputProps={{ "aria-label": "Select Users" }}
                fullWidth
              >
                <MenuItem value="647d94aea97e40a17278c7e5">User 1</MenuItem>
                <MenuItem value="647d999e4c3dd7ca9a2e6543">User 2</MenuItem>
                {/* Add more users as needed */}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Disagree</Button>
            <Button
              onClick={() => {
                handleCreateGroup();
                handleClose();
              }}
              autoFocus
            >
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div className="grouping">
        <div className="creategroup">
          <h2>Create a Group Here</h2>
          <motion.img
            drag
            whileTap={{ scale: 1.03, rotate: 360 }}
            src={grouplogo}
            alt="logo"
            className="group-logo"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className={"createGroups-container" + (lightTheme ? "" : " dark")}>
          <input
            placeholder="Enter Group Name"
            className={"search-box" + (lightTheme ? "" : " dark")}
            value={groupName}
            onChange={(e) => {
              setGroupName(e.target.value);
            }}
          />
          <input
            type="file"
            accept="image/*"
            className={"file-input" + (lightTheme ? "" : " dark")}
            onChange={handleImageChange}
          />
          <IconButton
            className={"icon" + (lightTheme ? "" : " dark")}
            onClick={handleClickOpen}
          >
            <DoneOutlineRoundedIcon />
          </IconButton>
        </div>
      </div>
      {/* Snackbar component for notification */}
      <Snackbar
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        open={snackbarOpen}
        autoHideDuration={3000} // Adjust duration as needed
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
    </>
  );
}

export default CreateGroups;

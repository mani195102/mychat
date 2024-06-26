import React, { useState } from "react";
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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function CreateGroups() {
  const lightTheme = useSelector((state) => state.themeKey);
  const userData = JSON.parse(localStorage.getItem("userdata"));
  const nav = useNavigate();
  
  // State for group name and snackbar
  const [groupName, setGroupName] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Redirect to login if user not authenticated
  if (!userData) {
    console.log("User not Authenticated");
    nav("/");
  }
  
  const user = userData;

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  // Function to create group
  const createGroup = async () => {
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/chat/createGroup",
        {
          name: groupName,
          users: ["647d94aea97e40a17278c7e5", "647d999e4c3dd7ca9a2e6543"], // Example users array
        },
        config
      );

      // Show snackbar on successful creation
      setSnackbarMessage("Group created successfully");
      setSnackbarOpen(true);

      // Navigate to groups page
      nav("/app/groups");
    } catch (error) {
      console.error("Error creating group:", error);
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
            {"Do you want to create a Group Named " + groupName}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              This will create a create group in which you will be the admin and
              others will be able to join this group.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Disagree</Button>
            <Button
              onClick={() => {
                createGroup();
                handleClose();
              }}
              autoFocus
            >
              Agree
            </Button>
          </DialogActions>
        </Dialog>
      </div>
      <div className={"createGroups-container" + (lightTheme ? "" : " dark")}>
        <input
          placeholder="Enter Group Name"
          className={"search-box" + (lightTheme ? "" : " dark")}
          onChange={(e) => {
            setGroupName(e.target.value);
          }}
        />
        <IconButton
          className={"icon" + (lightTheme ? "" : " dark")}
          onClick={handleClickOpen}
        >
          <DoneOutlineRoundedIcon />
        </IconButton>
      </div>
      {/* Snackbar component for notification */}
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        open={snackbarOpen}
        autoHideDuration={6000} // Adjust duration as needed
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        action={
          <Button color="secondary" size="small" onClick={() => setSnackbarOpen(false)}>
            Close
          </Button>
        }
      />
    </>
  );
}

export default CreateGroups;

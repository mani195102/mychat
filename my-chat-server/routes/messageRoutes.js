const express = require("express");
const { allMessages, sendMessage } = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");
const multer = require("multer");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, upload.single("file"), sendMessage);

module.exports = router;

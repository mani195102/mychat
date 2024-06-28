const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./config/cloudinary');

const app = express();

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4']
  }
});

const upload = multer({ storage: storage });


app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/message', messageRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const result = await cloudinary.uploader.upload(req.file.path);

    return res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error('Error uploading file:', err);
    return res.status(500).json({ message: 'Error uploading file' });
  }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
  pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User joined room: " + room);
  });

  socket.on("new message", (newMessageReceived) => {
    var chat = newMessageReceived.chat;

    if (!chat || !chat.users || !Array.isArray(chat.users)) {
      console.log("Invalid chat or chat.users structure:", newMessageReceived);
      return;
    }

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;

      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

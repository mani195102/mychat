const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const multer = require('multer');
const cloudinary = require('./config/cloudinary');

const app = express();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads')); // Temporarily store uploads locally
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/message', messageRoutes);

// Serve static files if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
    res.send("API is running");
});

//  route for handling file uploads to Cloudinary
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await cloudinary.uploader.upload(req.file.path);

        // Optionally, you can save the Cloudinary URL or any other data to your database
        // Example: Save result.secure_url to your database

        return res.status(200).json({ url: result.secure_url });
    } catch (err) {
        console.error('Error uploading file:', err);
        return res.status(500).json({ message: 'Error uploading file' });
    }
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server is running on port ${PORT}`));

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

        if (!chat.users) {
            return console.log("chat.users not defined");
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

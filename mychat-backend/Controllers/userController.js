const expressAsyncHandler = require("express-async-handler");
const UserModel = require("../models/userModel");
//const crypto = require('crypto');
const bcrypt = require('bcrypt');
const generateToken = require("../config/generateToken");
const nodemailer = require('nodemailer');
require('dotenv').config();
const cloudinary = require("../config/cloudinary"); // Import Cloudinary configuration

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
    },
    tls: {
        rejectUnauthorized: false
    }
});

const loginController = expressAsyncHandler(async (req, res) => {
    const { name, password } = req.body;
    const user = await UserModel.findOne({ name });
    if (user && (await user.matchPassword(password))) {
        const isAdmin = user.isAdmin;
        const token = generateToken(user._id, isAdmin);
        console.log(token);
        const response = {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            about: user.about,
            profileImage: user.profileImage,
            isAdmin: user.isAdmin,
            token: token,
        };
        res.status(200).json(response);
    } else {
        res.status(401);
        throw new Error("Invalid Username or Password");
    }
});
const forgetPasswordController = expressAsyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate token for password reset
        const hexToken = generateToken(user._id, user.isAdmin);
        const token = Buffer.from(hexToken).toString('hex');
        user.resetToken = hexToken; // Store token in user document
        user. resetTokenExpiry = Date.now() + 3600000; // Token expiration (1 hour)

        await user.save();

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   ${process.env.CLIENT_URL}/reset_password/${token}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        };

        transporter.sendMail(mailOptions, (err, response) => {
            if (err) {
                console.error('Error sending email:', err);
                res.status(500).json({ message: 'Failed to send email' });
            } else {
                res.status(200).json({ message: 'Recovery email sent' });
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

const resetPasswordcontroller = expressAsyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        // Decode the token from hex to its original string
        const originalToken = Buffer.from(token, 'hex').toString();

        // Find the user by reset token and check if the token has not expired
        const user = await UserModel.findOne({ resetToken: originalToken, resetTokenExpiry: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Assign the new password to the user object
        user.password = password;

        // Clear the reset token and expiry
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        // Save the user with the new password (password will be hashed by the pre-save middleware)
        await user.save();

        res.status(200).json({ message: 'Password has been reset' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



const registerController = expressAsyncHandler(async (req, res) => {
    const { name, email, password, phone, about } = req.body;
    console.log(password);

    if (!name || !email || !password || !phone) {
        res.status(400).send({ message: "All necessary input fields have not been filled" });
        return;
    }

    const userExist = await UserModel.findOne({ email });
    if (userExist) {
        res.status(400).send({ message: "User Email already exists" });
        return;
    }

    const userNameExist = await UserModel.findOne({ name });
    if (userNameExist) {
        res.status(400).send({ message: "User Name already exists" });
        return;
    }

    let profileImage = null;
    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        profileImage = result.secure_url; // Save the Cloudinary URL
    }

    const user = await UserModel.create({ name, email, password, phone, about, profileImage });
    console.log(user)
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            about: user.about,
            password:user.password,
            profileImage: user.profileImage,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Registration Error");
    }
});


const fetchAllUsersController = expressAsyncHandler(async (req, res) => {
    const keyword = req.query.search
        ? {
            $or: [
                { name: { $regex: req.query.search, $options: "i" } },
                { email: { $regex: req.query.search, $options: "i" } },
                { phone: { $regex: req.query.search, $options: "i" } },
            ],
        }
        : {};

    try {
        const users = await UserModel.find({ ...keyword, _id: { $ne: req.user_id } });

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.status(200).json(users); // Changed status to 200 for success
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


const deleteUserController = expressAsyncHandler(async (req, res) => {
    const userId = req.params.userId;

    try {
        const deletedUser = await UserModel.findByIdAndDelete(userId);

        if (deletedUser) {
            res.status(200).json({ message: "User deleted successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
const ProfileController = expressAsyncHandler(async (req, res) => {
    try {
        // Fetch profile based on authenticated user's ID
        const profile = await UserModel.findById(req.user._id);

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json({
            _id: profile._id,
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            about: profile.about,
            profileImage: profile.profileImage,
            isAdmin: profile.isAdmin,
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const editUserProfileController = expressAsyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const { name, about, phone } = req.body;
    let profileImage = null;

    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        profileImage = result.secure_url; // Save the Cloudinary URL
    }

    try {
        const user = await UserModel.findById(userId);

        if (user) {
            user.name = name || user.name;
            user.about = about || user.about;
            user.phone = phone || user.phone;
            user.profileImage = profileImage || user.profileImage;

            const updatedUser = await user.save();

            res.status(200).json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                about: updatedUser.about,
                profileImage: updatedUser.profileImage,
                isAdmin: updatedUser.isAdmin,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = {
    loginController,
    forgetPasswordController,
    resetPasswordcontroller,
    registerController,
    fetchAllUsersController,
    deleteUserController,
    ProfileController,
    editUserProfileController
};

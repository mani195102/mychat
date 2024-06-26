const express = require("express");
const UserModel = require("../models/userModel");
const generateToken = require("../config/generateToken");
const expressAsyncHandler = require("express-async-handler");

const loginController = expressAsyncHandler(async (req, res) => {
    const { name, password } = req.body;
    const user = await UserModel.findOne({ name });
    if(user && (await user.matchPassword(password))) {
        const response = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        };
        res.json(response);
    } else {
        res.status(401);
        throw new Error("Invalid Username Or Password");
    }
});


const registerController = expressAsyncHandler(async (req, res) => {
    const { name, email, password, phone } = req.body; // Added phone

    if (!name || !email || !password || !phone) { // Check for phone
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

    const user = await UserModel.create({ name, email, password, phone }); // Added phone
    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone, // Added phone
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    }
    else{
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
                { phone: { $regex: req.query.search, $options: "i" } }, // Include phone number search
            ],
        }
        : {};

    try {
        const users = await UserModel.find({ ...keyword, _id: { $ne: req.user_id } });

        if (users.length === 0) {
            return res.status(404).json({ message: "No users found" });
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = { loginController, registerController, fetchAllUsersController };

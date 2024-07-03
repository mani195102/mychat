const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define user schema with additional fields
const userModel = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    about: { type: String },
    profileImage: { type: String },
    resetToken: String,
    resetTokenExpiry: Date,
}, {
    timestamps: true,
});

// Method to match entered password with hashed password in the database
userModel.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving if it is modified
userModel.pre("save", async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Create and export User model
const User = mongoose.model("User", userModel);

module.exports = User;

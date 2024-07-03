const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (userId, isAdmin) => {
    return jwt.sign({ id: userId, isAdmin }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
    });
};

module.exports = generateToken;

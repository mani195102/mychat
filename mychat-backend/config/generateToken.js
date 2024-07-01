const jwt = require("jsonwebtoken");
require("dotenv").config();


const generateToken = (userId, isAdmin) => {
    return jwt.sign({ id: userId, isAdmin }, process.env.JWT_SECRET, {
      expiresIn: '30d', // Adjust token expiration as needed
    });
  };
module.exports = generateToken;
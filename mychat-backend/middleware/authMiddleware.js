require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const AsyncHandler = require("express-async-handler");

const USER_ROLE = 'user';
const ADMIN_ROLE = 'admin';

const checkAdminPermission = (req, res, next) => {
  if (req.user && req.user.role === ADMIN_ROLE) {
    next();
  } else {
    res.status(403).json({ message: 'Unauthorized: Admin access required' });
  }
};

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === ADMIN_ROLE) {
    next();
  } else {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
};

module.exports = { protect, isAdmin, checkAdminPermission, USER_ROLE, ADMIN_ROLE };

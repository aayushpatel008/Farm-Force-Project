const jwt = require("jsonwebtoken");
const User = require("../models/model");

exports.protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, "shhhh");

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;   // 🔥 attach user to request

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
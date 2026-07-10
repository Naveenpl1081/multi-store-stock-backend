import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRATION }
  );
};

export const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};
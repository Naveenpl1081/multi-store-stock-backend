import bcrypt from "bcrypt";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { generateToken } from "../utils/token.util.js";
import { ROLES } from "../constants/roles.js";
import { HTTP_STATUS } from "../constants/http-status.js";

const SALT_ROUNDS = 10;

export const registerUser = async ({ username, email, password }) => {
  const sanitizedEmail = email.trim().toLowerCase();


  const existingUser = await User.findOne({ email: sanitizedEmail });
  if (existingUser) {
    throw new AppError("Email is already registered", HTTP_STATUS.CONFLICT);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    username: username.trim(),
    email: sanitizedEmail,
    password: hashedPassword,
    role: ROLES.SHOPPER
  });

  return {
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
    token: generateToken(user),
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.UNAUTHORIZED);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid password", HTTP_STATUS.UNAUTHORIZED);
  }

  return {
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
    token: generateToken(user),
  };
};
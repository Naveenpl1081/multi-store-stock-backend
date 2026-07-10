import bcrypt from "bcrypt";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import { generateToken } from "../utils/token.util.js";
import { ROLES } from "../constants/roles.js";
import { validateEmail } from "../utils/validation.util.js";

const SALT_ROUNDS = 10;

export const registerUser = async ({ username, email, password }) => {
    if (!username?.trim() || !email?.trim() || !password) {
      throw new AppError("Username, email, and password are required", 400);
    }
  
    validateEmail(email.trim());
  
    if (password.length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }
  
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: ROLES.SHOPPER
    });
  
    return {
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
      token: generateToken(user),
    };
  };

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    token,
  };
};
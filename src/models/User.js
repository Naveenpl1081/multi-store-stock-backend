import mongoose from "mongoose";
import { ROLE_VALUES, ROLES } from "../constants/roles.js";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.SHOPPER,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
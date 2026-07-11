import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../models/User.js";
import { ROLES } from "../constants/roles.js";
import { config } from "../config/env.js";

const SALT_ROUNDS = 10;

const seedAdmin = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("Connected to MongoDB for seeding");

    const adminEmail = "admin@multistore.com";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log("Admin already exists. Skipping seed.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Admin@123", SALT_ROUNDS);

    await User.create({
      username: "admin",
      email: adminEmail,
      password: hashedPassword,
      role: ROLES.ADMIN,
    });

    console.log("Admin user created successfully");
    console.log(`Email: ${adminEmail}`);
    console.log("Password: Admin@123");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
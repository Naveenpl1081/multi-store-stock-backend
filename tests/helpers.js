import bcrypt from "bcrypt";
import User from "../src/models/User.js";
import Product from "../src/models/Product.js";
import Store from "../src/models/Store.js";
import { generateToken } from "../src/utils/token.util.js";
import { ROLES } from "../src/constants/roles.js";

export const createAdminAndToken = async () => {
  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  const admin = await User.create({
    username: "admin",
    email: "admin@test.com",
    password: hashedPassword,
    role: ROLES.ADMIN,
  });
  const token = generateToken(admin);
  return { admin, token };
};

export const createShopperAndToken = async () => {
  const hashedPassword = await bcrypt.hash("Shopper@123", 10);
  const shopper = await User.create({
    username: "shopper",
    email: "shopper@test.com",
    password: hashedPassword,
    role: ROLES.SHOPPER,
  });
  const token = generateToken(shopper);
  return { shopper, token };
};

export const createProduct = async (overrides = {}) => {
  return Product.create({
    name: "Red T-Shirt",
    sku: "TSHIRT-RED-001",
    ...overrides,
  });
};

export const createStore = async (overrides = {}) => {
  return Store.create({
    name: "Downtown Branch",
    ...overrides,
  });
};
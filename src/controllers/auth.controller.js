import { registerUser, loginUser } from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await registerUser({ username, email, password });
    res.status(201).json(result);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        error: { message: "Email is already registered" },
      });
    }
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
import { HTTP_STATUS } from "../constants/http-status.js";
import { registerUser, loginUser } from "../services/auth.service.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await registerUser({ username, email, password });
    res.status(HTTP_STATUS.CREATED).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    next(error);
  }
};
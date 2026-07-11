import { HTTP_STATUS } from "../constants/http-status.js";
import { registerUser, loginUser } from "../services/auth.service.js";
import { sendResponse } from "../utils/response.util.js";

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await registerUser({ username, email, password });
    
    return sendResponse(
      res, 
      HTTP_STATUS.CREATED, 
      "User registered successfully", 
      result
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    
    return sendResponse(
      res, 
      HTTP_STATUS.OK, 
      "Login successful", 
      result
    );
  } catch (error) {
    next(error);
  }
};
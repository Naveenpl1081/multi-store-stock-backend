import { verifyToken } from "../utils/token.util.js";
import AppError from "../utils/AppError.js";
import { ROLES } from "../constants/roles.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication token is required", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = decoded; 
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new AppError("Invalid or expired token", 401));
    }
    next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== ROLES.ADMIN) {
    return res.status(403).json({ error: { message: "Admin access required" } });
  }
  next();
};
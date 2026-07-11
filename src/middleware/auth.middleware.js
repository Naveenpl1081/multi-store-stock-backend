import { verifyToken } from "../utils/token.util.js";
import AppError from "../utils/AppError.js";


export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

    
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new AppError("Authentication token is required", 401);
      }

      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      req.user = decoded; 

      
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        throw new AppError("Access denied: insufficient permissions", 403);
      }

      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        return next(new AppError("Invalid or expired token", 401));
      }
      next(error);
    }
  };
};
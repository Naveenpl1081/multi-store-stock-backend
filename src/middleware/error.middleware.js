import { HTTP_STATUS } from "../constants/http-status.js";

export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  

    console.error(err.stack);

    if (err.name === "CastError") {
      error.message = `Invalid format for field ${err.path}: ${err.value}`;
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
    }
  

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
      error.statusCode = HTTP_STATUS.CONFLICT;
    }

    if (err.name === "ValidationError") {
      error.message = Object.values(err.errors).map((val) => val.message).join(", ");
      error.statusCode = HTTP_STATUS.BAD_REQUEST;
    }
  
    res.status(error.statusCode).json({
      error: { message: error.message || "Internal server error" },
    });
  };
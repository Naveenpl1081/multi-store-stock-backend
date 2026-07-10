
export const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;
  

    console.error(err.stack);

    if (err.name === "CastError") {
      error.message = `Invalid format for field ${err.path}: ${err.value}`;
      error.statusCode = 400;
    }
  

    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      error.message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
      error.statusCode = 409;
    }

    if (err.name === "ValidationError") {
      error.message = Object.values(err.errors).map((val) => val.message).join(", ");
      error.statusCode = 400;
    }
  
    res.status(error.statusCode).json({
      error: { message: error.message || "Internal server error" },
    });
  };
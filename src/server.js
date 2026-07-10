import "./config/env.js"; 
import app from "./app.js";
import connectDB from "./config/db.js";
import { config } from "./config/env.js";

const startServer = async () => {
  await connectDB();
  app.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT}`);
  });
};

startServer();
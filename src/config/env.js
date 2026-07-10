import dotenv from "dotenv";
dotenv.config();

function validateEnvVars() {
  const requiredEnvVars = [
    "PORT",
    "MONGO_URI",
    "JWT_SECRET",
    "JWT_EXPIRATION",
    "CLIENT_URL",
    "NODE_ENV",
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    console.error(
      `Missing required environment variables:\n${missingVars.map((v) => "  - " + v).join("\n")}`
    );
    process.exit(1);
  }
}

validateEnvVars();

export const config = {
  PORT: Number(process.env.PORT),
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION,
  CLIENT_URL: process.env.CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV,
};
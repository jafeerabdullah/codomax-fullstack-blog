"use strict";

const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const port = Number(process.env.PORT || 5000);
const jwtSecret = process.env.JWT_SECRET || "";
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be a valid port number.");
if (jwtSecret.length < 32 || jwtSecret.startsWith("replace-with-")) {
  throw new Error("Set a random JWT_SECRET in backend/.env. Run npm run setup-env to create a new .env.");
}

module.exports = {
  port,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  jwtIssuer: "codomax-blog",
  jwtAudience: "codomax-web",
  dataDirectory: path.resolve(process.env.DATA_DIR || path.join(__dirname, "data")),
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5000,http://127.0.0.1:5000,http://localhost:5500,http://127.0.0.1:5500").split(",").map(value => value.trim()).filter(Boolean)
};

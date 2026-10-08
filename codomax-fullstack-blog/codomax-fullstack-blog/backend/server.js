"use strict";

const express = require("express");
const cors = require("cors");
const path = require("node:path");
const config = require("./config");
const HttpError = require("./utils/HttpError");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    // Requests from Postman/curl have no Origin. Browsers use the explicit allowlist.
    callback(null, !origin || config.corsOrigins.includes(origin));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "256kb" }));
app.use("/api", (req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
app.get("/", (req, res) => res.type("text/plain").send("Blog API Server Running"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/frontend", express.static(path.join(__dirname, "..", "frontend"), { index: "index.html" }));
app.use((req, res, next) => next(new HttpError(404, "Route not found.")));
app.use(errorHandler);

if (require.main === module) {
  const server = app.listen(config.port, "127.0.0.1", () => {
    console.log(`Blog API Server Running on http://localhost:${config.port}`);
    console.log(`Frontend: http://localhost:${config.port}/frontend/`);
  });
  server.on("error", error => {
    console.error(`Server could not start: ${error.message}`);
    process.exitCode = 1;
  });
}

// Exporting the app lets tests run it on an isolated ephemeral port.
module.exports = app;

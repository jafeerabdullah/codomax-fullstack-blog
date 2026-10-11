"use strict";

const express = require("express");
const cors = require("cors");
const path = require("node:path");
const config = require("./config");
const HttpError = require("./utils/HttpError");
const errorHandler = require("./middleware/errorHandler");

const app = express();
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Content-Security-Policy": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' https: http:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'"
  });
  next();
});
app.use(cors({
  origin(origin, callback) { callback(null, !origin || config.corsOrigins.includes(origin)); },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "256kb" }));
app.use("/api", (req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
app.get("/health", (req, res) => res.set("Cache-Control", "no-store").json({ status: "ok" }));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
// Vercel serves generated public/ assets through its CDN. These mounts are for local use.
const frontend = path.join(__dirname, "..", "frontend");
app.use("/frontend", express.static(frontend, { index: "index.html" }));
app.use(express.static(frontend, { index: "index.html" }));
app.use((req, res, next) => next(new HttpError(404, "Route not found.")));
app.use(errorHandler);

module.exports = app;

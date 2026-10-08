"use strict";

const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../models/User");
const HttpError = require("../utils/HttpError");

async function requireAuth(req, res, next) {
  const match = /^Bearer\s+(\S+)$/i.exec(req.get("Authorization") || "");
  if (!match) return next(new HttpError(401, "Please login to continue."));
  let payload;
  try {
    payload = jwt.verify(match[1], config.jwtSecret, { algorithms: ["HS256"], issuer: config.jwtIssuer, audience: config.jwtAudience });
    if (typeof payload.sub !== "string") throw new Error("Missing token subject");
  } catch { return next(new HttpError(401, "Your login session is invalid or expired. Please login again.")); }
  try {
    const user = await User.findById(payload.sub);
    if (!user) return next(new HttpError(401, "Please login again."));
    req.user = User.publicInfo(user);
    next();
  } catch (error) { next(error); }
}

module.exports = requireAuth;

"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const config = require("../config");
const HttpError = require("../utils/HttpError");
const { registerInput, loginInput } = require("../utils/validation");

async function registerUser(req, res) {
  const input = registerInput(req.body);
  if (await User.findByEmail(input.email)) throw new HttpError(409, "An account with this email already exists.", { email: "This email is already registered." });
  const password = await bcrypt.hash(input.password, 12);
  await User.create({ ...input, password });
  res.status(201).json({ message: "User registered successfully" });
}

async function loginUser(req, res) {
  const { email, password } = loginInput(req.body);
  const user = await User.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) throw new HttpError(401, "Invalid email or password.");
  const token = jwt.sign({}, config.jwtSecret, { algorithm: "HS256", subject: user.id, issuer: config.jwtIssuer, audience: config.jwtAudience, expiresIn: config.jwtExpiresIn });
  res.json({ message: "Login successful", token, user: User.publicInfo(user) });
}

function currentUser(req, res) { res.json({ user: req.user }); }

module.exports = { registerUser, loginUser, currentUser };

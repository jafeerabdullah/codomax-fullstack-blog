"use strict";

const Blog = require("../models/Blog");

async function getProfile(req, res) {
  const statistics = await Blog.statistics(req.user.id);
  res.json({ ...req.user, ...statistics });
}

module.exports = { getProfile };

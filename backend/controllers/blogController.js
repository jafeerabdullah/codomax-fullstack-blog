"use strict";

const Blog = require("../models/Blog");
const { blogInput } = require("../utils/validation");

async function createBlog(req, res) {
  const blog = await Blog.create(blogInput(req.body), req.user);
  res.status(201).json({ message: "Blog created successfully", blog });
}
async function listBlogs(req, res) { res.json({ blogs: await Blog.published() }); }
async function listMyBlogs(req, res) { res.json({ blogs: await Blog.byAuthor(req.user.id) }); }
async function getBlog(req, res) { res.json({ blog: await Blog.readable(req.params.id, req.user?.id) }); }
async function updateBlog(req, res) {
  const blog = await Blog.update(req.params.id, req.user.id, blogInput(req.body));
  res.json({ message: "Blog updated successfully", blog });
}
async function deleteBlog(req, res) {
  await Blog.remove(req.params.id, req.user.id);
  res.json({ message: "Blog deleted successfully" });
}

module.exports = { createBlog, listBlogs, listMyBlogs, getBlog, updateBlog, deleteBlog };

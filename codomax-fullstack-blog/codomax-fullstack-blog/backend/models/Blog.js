"use strict";

const { randomUUID } = require("node:crypto");
const createJsonStore = require("../utils/jsonStore");
const HttpError = require("../utils/HttpError");
const blogs = createJsonStore("blogs.json");

class Blog {
  static async published() { return (await blogs.read()).filter(blog => blog.status === "published").sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  static async byAuthor(authorId) { return (await blogs.read()).filter(blog => blog.authorId === authorId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
  static async owned(id, authorId) {
    const blog = (await blogs.read()).find(blog => blog.id === id);
    if (!blog) throw new HttpError(404, "Blog not found.");
    if (blog.authorId !== authorId) throw new HttpError(403, "You can only manage your own blogs.");
    return blog;
  }
  static async create(input, user) {
    return blogs.mutate(records => {
      const now = new Date().toISOString();
      const blog = { ...input, id: randomUUID(), authorId: user.id, author: user.name, date: now.slice(0, 10), createdAt: now, updatedAt: now };
      records.push(blog);
      return blog;
    });
  }
  static async update(id, authorId, changes) {
    return blogs.mutate(records => {
      const index = records.findIndex(blog => blog.id === id);
      if (index === -1) throw new HttpError(404, "Blog not found.");
      if (records[index].authorId !== authorId) throw new HttpError(403, "You can only manage your own blogs.");
      records[index] = { ...records[index], ...changes, updatedAt: new Date().toISOString() };
      return records[index];
    });
  }
  static async remove(id, authorId) {
    return blogs.mutate(records => {
      const index = records.findIndex(blog => blog.id === id);
      if (index === -1) throw new HttpError(404, "Blog not found.");
      if (records[index].authorId !== authorId) throw new HttpError(403, "You can only manage your own blogs.");
      records.splice(index, 1);
    });
  }
}

module.exports = Blog;

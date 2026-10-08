"use strict";

const { randomUUID } = require("node:crypto");
const createJsonStore = require("../utils/jsonStore");
const HttpError = require("../utils/HttpError");
const users = createJsonStore("users.json");

class User {
  static async findByEmail(email) { return (await users.read()).find(user => user.email === email); }
  static async findById(id) { return (await users.read()).find(user => user.id === id); }
  static async create({ name, email, password }) {
    return users.mutate(records => {
      if (records.some(user => user.email === email)) throw new HttpError(409, "An account with this email already exists.", { email: "This email is already registered." });
      const user = { id: randomUUID(), name, email, password, createdAt: new Date().toISOString() };
      records.push(user);
      return user;
    });
  }
  static publicInfo(user) { return { id: user.id, name: user.name, email: user.email }; }
}

module.exports = User;

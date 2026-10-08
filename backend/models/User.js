"use strict";

const supabase = require("../config/supabase");
const databaseResult = require("../utils/databaseResult");
const HttpError = require("../utils/HttpError");

class User {
  static async findByEmail(email) {
    return databaseResult(await supabase.from("users").select("id,name,email,password,created_at").eq("email", email).maybeSingle());
  }
  static async findById(id) {
    return databaseResult(await supabase.from("users").select("id,name,email").eq("id", id).maybeSingle());
  }
  static async create({ name, email, password }) {
    const result = await supabase.from("users").insert({ name, email, password }).select("id,name,email").single();
    // The unique constraint also handles registrations racing after the pre-check.
    if (result.error?.code === "23505") throw new HttpError(409, "An account with this email already exists.", { email: "This email is already registered." });
    return databaseResult(result);
  }
  static publicInfo(user) { return { id: user.id, name: user.name, email: user.email }; }
}

module.exports = User;

"use strict";

const HttpError = require("./HttpError");
const categories = ["Web Development", "Design", "Productivity", "Technology", "Personal Growth"];
const images = ["images/code-workspace.jpg", "images/design-perspective.jpg", "images/writing-routine.jpg", "images/cover-fallback.svg"];
const text = value => typeof value === "string" ? value.trim() : "";
const emailValid = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

function bodyObject(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new HttpError(400, "Send a JSON object as the request body.");
  return body;
}
function fail(errors) {
  if (Object.keys(errors).length) throw new HttpError(400, "Please check the submitted fields.", errors);
}
function registerInput(body) {
  bodyObject(body);
  const name = text(body.name);
  const email = text(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const errors = {};
  if (!name || name.length > 80) errors.name = "Enter a name between 1 and 80 characters.";
  else if (!/\p{L}/u.test(name) || /[\u0000-\u001f\u007f]/.test(name)) errors.name = "Use a name containing a letter, without control characters.";
  if (!emailValid(email)) errors.email = "Enter a valid email address.";
  if (!password.trim() || password.length < 8) errors.password = "Use a password with at least 8 characters.";
  else if (Buffer.byteLength(password, "utf8") > 72) errors.password = "Password is too long. Use a shorter password.";
  else if (!/\p{Lu}/u.test(password) || !/\p{Ll}/u.test(password) || !/\p{N}/u.test(password)) errors.password = "Use at least 8 characters, including an uppercase letter, a lowercase letter, and a number.";
  fail(errors);
  return { name, email, password };
}
function loginInput(body) {
  bodyObject(body);
  const email = text(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const errors = {};
  if (!emailValid(email)) errors.email = "Enter a valid email address.";
  if (!password.trim() || Buffer.byteLength(password, "utf8") > 72) errors.password = "Enter a valid password.";
  fail(errors);
  return { email, password };
}
function imageValid(value) {
  if (images.includes(value)) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}
function blogFilters(query) {
  const errors = {};
  for (const name of ["search", "category"]) {
    if (query[name] !== undefined && typeof query[name] !== "string") errors[name] = `Provide one ${name} value.`;
  }
  const search = text(query.search);
  const category = text(query.category);
  if (search.length > 200 || /[\u0000-\u001f\u007f]/.test(search)) errors.search = "Use a search term of at most 200 characters without control characters.";
  if (category && !categories.includes(category)) errors.category = "Choose one of the supported categories.";
  fail(errors);
  return { search, category };
}
function blogInput(body, existing = {}) {
  bodyObject(body);
  const title = text(body.title === undefined ? existing.title : body.title);
  const category = text(body.category === undefined ? existing.category : body.category);
  const content = text(body.content === undefined ? existing.content : body.content);
  // Accept the requested image field while preserving the Module 2/3 imageUrl contract.
  const imageInput = body.imageUrl === undefined ? body.image : body.imageUrl;
  const imageUrl = imageInput === undefined ? (existing.imageUrl || images[0]) : text(imageInput);
  const status = body.status === undefined ? (existing.status || "published") : body.status;
  const errors = {};
  if (!title || title.length > 120) errors.title = "Enter a title between 1 and 120 characters.";
  if (!categories.includes(category)) errors.category = "Choose one of the supported categories.";
  if (!content || content.length > 30000) errors.content = "Enter content between 1 and 30000 characters.";
  if (!imageValid(imageUrl) || imageUrl.length > 2048) errors.imageUrl = "Use a valid HTTP/HTTPS cover URL or a bundled image path.";
  if (!["published", "draft"].includes(status)) errors.status = "Status must be published or draft.";
  // Author is accepted for the documented request format, but ownership comes from JWT.
  if (body.author !== undefined && (!text(body.author) || text(body.author).length > 80)) errors.author = "Enter a valid author name.";
  fail(errors);
  const compact = content.replace(/\s+/g, " ");
  return {
    title, category, content, imageUrl, status,
    imageAlt: `Cover image for ${title}`,
    description: compact.slice(0, 145) + (compact.length > 145 ? "…" : ""),
    readMinutes: Math.max(1, Math.ceil(content.split(/\s+/).length / 200))
  };
}

module.exports = { registerInput, loginInput, blogInput, blogFilters };

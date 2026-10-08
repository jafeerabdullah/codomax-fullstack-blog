"use strict";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const { mkdtempSync } = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { randomBytes } = require("node:crypto");
const bcrypt = require("bcryptjs");

const dataDirectory = mkdtempSync(path.join(os.tmpdir(), "codomax-module2-test-"));
process.env.DATA_DIR = dataDirectory;
process.env.JWT_SECRET = randomBytes(48).toString("hex");
const app = require("../server");
let server, base, token, otherToken, blogId;
const password = "Testing-password-123";
const blogInput = { title: "A working backend", category: "Web Development", content: "This story is persisted in JSON storage.", author: "Jafeer Abdullah", imageUrl: "images/code-workspace.jpg" };

async function start() {
  server = await new Promise(resolve => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  base = `http://127.0.0.1:${server.address().port}`;
}
async function call(route, { method = "GET", body, bearer, raw } = {}) {
  const response = await fetch(`${base}${route}`, {
    method,
    headers: { ...(body !== undefined || raw !== undefined ? { "Content-Type": "application/json" } : {}), ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
    ...(raw !== undefined ? { body: raw } : body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  return { status: response.status, body: await response.json() };
}

before(start);
after(async () => {
  await new Promise(resolve => server.close(resolve));
  const allowedPrefix = path.join(os.tmpdir(), "codomax-module2-test-");
  assert.ok(dataDirectory.startsWith(allowedPrefix));
  await fs.rm(dataDirectory, { recursive: true, force: true });
});

test("server root, static frontend, missing routes, invalid JSON and body limits", async () => {
  assert.equal(await (await fetch(base)).text(), "Blog API Server Running");
  assert.equal((await fetch(`${base}/frontend/index.html`)).status, 200);
  assert.equal((await call("/api/missing")).status, 404);
  assert.equal((await call("/api/auth/register", { method: "POST", raw: "{" })).status, 400);
  assert.equal((await call("/api/auth/register", { method: "POST", body: { name: "x".repeat(270000) } })).status, 413);
});

test("registration validates required fields, email and bcrypt byte length", async () => {
  const empty = await call("/api/auth/register", { method: "POST", body: {} });
  assert.equal(empty.status, 400);
  assert.deepEqual(Object.keys(empty.body.errors).sort(), ["email", "name", "password"]);
  assert.equal((await call("/api/auth/register", { method: "POST", body: { name: "Jafeer", email: "bad-email", password } })).status, 400);
  assert.equal((await call("/api/auth/register", { method: "POST", body: { name: "Jafeer", email: "long@example.com", password: "😀".repeat(20) } })).status, 400);
});

test("registration normalizes email, hashes passwords and rejects duplicate accounts", async () => {
  const registered = await call("/api/auth/register", { method: "POST", body: { name: "Jafeer Abdullah", email: " JAFEER@example.com ", password } });
  assert.equal(registered.status, 201);
  assert.equal(registered.body.message, "User registered successfully");
  const users = JSON.parse(await fs.readFile(path.join(dataDirectory, "users.json"), "utf8"));
  assert.equal(users[0].email, "jafeer@example.com");
  assert.notEqual(users[0].password, password);
  assert.ok(await bcrypt.compare(password, users[0].password));
  assert.equal((await call("/api/auth/register", { method: "POST", body: { name: "Duplicate", email: "jafeer@example.com", password } })).status, 409);
  const concurrent = await Promise.all([1, 2].map(() => call("/api/auth/register", { method: "POST", body: { name: "Other Writer", email: "other@example.com", password } })));
  assert.deepEqual(concurrent.map(result => result.status).sort(), [201, 409]);
});

test("login returns a working JWT and public user information, with generic invalid credential errors", async () => {
  const login = await call("/api/auth/login", { method: "POST", body: { email: "JAFEER@example.com", password } });
  assert.equal(login.status, 200);
  assert.equal(login.body.message, "Login successful");
  assert.equal(login.body.user.name, "Jafeer Abdullah");
  assert.ok(!("password" in login.body.user));
  token = login.body.token;
  assert.equal((await call("/api/auth/me", { bearer: token })).body.user.name, "Jafeer Abdullah");
  const wrong = await call("/api/auth/login", { method: "POST", body: { email: "jafeer@example.com", password: "incorrect" } });
  const missing = await call("/api/auth/login", { method: "POST", body: { email: "missing@example.com", password } });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.message, missing.body.message);
  otherToken = (await call("/api/auth/login", { method: "POST", body: { email: "other@example.com", password } })).body.token;
});

test("blog creation requires valid JWT and validates fields without trusting the submitted author", async () => {
  assert.equal((await call("/api/blogs", { method: "POST", body: blogInput })).status, 401);
  assert.equal((await call("/api/blogs", { method: "POST", body: blogInput, bearer: "not-a-token" })).status, 401);
  assert.equal((await call("/api/blogs", { method: "POST", body: {}, bearer: token })).status, 400);
  assert.equal((await call("/api/blogs", { method: "POST", body: { ...blogInput, imageUrl: "javascript:alert(1)" }, bearer: token })).status, 400);
  const created = await call("/api/blogs", { method: "POST", body: { ...blogInput, author: "Another Person" }, bearer: token });
  assert.equal(created.status, 201);
  assert.equal(created.body.message, "Blog created successfully");
  assert.equal(created.body.blog.author, "Jafeer Abdullah");
  blogId = created.body.blog.id;
  assert.equal((await call("/api/blogs")).body.blogs.length, 1);
  assert.equal((await call("/api/blogs/mine", { bearer: otherToken })).body.blogs.length, 0);
});

test("edit/delete enforce ownership; drafts are private; missing posts return JSON errors", async () => {
  assert.equal((await call(`/api/blogs/${blogId}`, { bearer: otherToken })).status, 403);
  assert.equal((await call(`/api/blogs/${blogId}`, { method: "PUT", body: blogInput, bearer: otherToken })).status, 403);
  assert.equal((await call(`/api/blogs/${blogId}`, { method: "DELETE", bearer: otherToken })).status, 403);
  const edited = await call(`/api/blogs/${blogId}`, { method: "PUT", body: { ...blogInput, title: "Edited story", status: "draft" }, bearer: token });
  assert.equal(edited.body.blog.title, "Edited story");
  assert.equal((await call("/api/blogs")).body.blogs.length, 0);
  assert.equal((await call("/api/blogs/mine", { bearer: token })).body.blogs.length, 1);
  assert.equal((await call("/api/blogs/missing", { bearer: token })).status, 404);
});

test("concurrent blog writes keep every record and persist across a server restart", async () => {
  const created = await Promise.all(Array.from({ length: 5 }, (_, index) => call("/api/blogs", { method: "POST", body: { ...blogInput, title: `Concurrent story ${index}` }, bearer: token })));
  assert.ok(created.every(result => result.status === 201));
  const stored = JSON.parse(await fs.readFile(path.join(dataDirectory, "blogs.json"), "utf8"));
  assert.equal(stored.length, 6);
  await new Promise(resolve => server.close(resolve));
  await start();
  assert.equal((await call("/api/blogs/mine", { bearer: token })).body.blogs.length, 6);
  assert.equal((await call(`/api/blogs/${blogId}`, { method: "DELETE", bearer: token })).status, 200);
  assert.equal((await call(`/api/blogs/${blogId}`, { bearer: token })).status, 404);
});

test("CORS permits configured frontend origins and does not grant access to other origins", async () => {
  const allowed = await fetch(`${base}/api/blogs`, { headers: { Origin: "http://localhost:5500" } });
  assert.equal(allowed.headers.get("access-control-allow-origin"), "http://localhost:5500");
  const denied = await fetch(`${base}/api/blogs`, { headers: { Origin: "https://untrusted.example" } });
  assert.equal(denied.headers.get("access-control-allow-origin"), null);
});

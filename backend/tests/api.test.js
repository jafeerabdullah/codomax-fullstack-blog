"use strict";

const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { randomBytes } = require("node:crypto");
const bcrypt = require("bcryptjs");
const createSupabaseFixture = require("./helpers/supabaseFixture");

const fixture = createSupabaseFixture();
process.env.JWT_SECRET = randomBytes(48).toString("hex");
let app, server, base, token, otherToken, blogId;
const password = "Testing-password-123";
const blogInput = { title: "A working backend", category: "Web Development", content: "This story is saved through the Supabase client.", author: "Jafeer Abdullah", imageUrl: "images/code-workspace.jpg" };

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

before(async () => {
  process.env.SUPABASE_URL = await fixture.start();
  process.env.SUPABASE_SERVICE_ROLE_KEY = fixture.key;
  app = require("../server");
  await start();
});
after(async () => {
  await new Promise(resolve => server.close(resolve));
  await fixture.close();
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
  const users = fixture.tables.users;
  assert.equal(users[0].email, "jafeer@example.com");
  assert.notEqual(users[0].password, password);
  assert.ok(await bcrypt.compare(password, users[0].password));
  assert.ok(!JSON.stringify(registered.body).includes(users[0].password));
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
  assert.equal(fixture.tables.blogs[0].image, blogInput.imageUrl);
  assert.equal(fixture.tables.blogs[0].author_id, created.body.blog.authorId);
  assert.equal(fixture.tables.blogs[0].author_name, "Jafeer Abdullah");
  blogId = created.body.blog.id;
  assert.equal((await call("/api/blogs")).body.blogs.length, 1);
  assert.equal((await call("/api/blogs/mine", { bearer: otherToken })).body.blogs.length, 0);
});

test("edit/delete enforce ownership; drafts are private; missing posts return JSON errors", async () => {
  assert.equal((await call(`/api/blogs/${blogId}`)).status, 200);
  assert.equal((await call(`/api/blogs/${blogId}`, { bearer: otherToken })).status, 200);
  assert.equal((await call(`/api/blogs/${blogId}`, { method: "PUT", body: blogInput, bearer: otherToken })).status, 403);
  assert.equal((await call(`/api/blogs/${blogId}`, { method: "DELETE", bearer: otherToken })).status, 403);
  const edited = await call(`/api/blogs/${blogId}`, { method: "PUT", body: { ...blogInput, title: "Edited story", status: "draft" }, bearer: token });
  assert.equal(edited.body.blog.title, "Edited story");
  assert.equal((await call("/api/blogs")).body.blogs.length, 0);
  assert.equal((await call("/api/blogs/mine", { bearer: token })).body.blogs.length, 1);
  assert.equal((await call(`/api/blogs/${blogId}`)).status, 404);
  assert.equal((await call(`/api/blogs/${blogId}`, { bearer: otherToken })).status, 404);
  assert.equal((await call(`/api/blogs/${blogId}`, { bearer: token })).status, 200);
  assert.equal((await call("/api/blogs/missing", { bearer: token })).status, 404);
});

test("concurrent blog writes keep every record and persist across a server restart", async () => {
  const created = await Promise.all(Array.from({ length: 5 }, (_, index) => call("/api/blogs", { method: "POST", body: { ...blogInput, title: `Concurrent story ${index}` }, bearer: token })));
  assert.ok(created.every(result => result.status === 201));
  const stored = fixture.tables.blogs;
  assert.equal(stored.length, 6);
  await new Promise(resolve => server.close(resolve));
  await start();
  assert.equal((await call("/api/blogs/mine", { bearer: token })).body.blogs.length, 6);
  assert.equal((await call(`/api/blogs/${blogId}`, { method: "DELETE", bearer: token })).status, 200);
  assert.equal((await call(`/api/blogs/${blogId}`, { bearer: token })).status, 404);
});

test("public blog details, newest-first feed, missing UUIDs and safe frontend serving", async () => {
  const feed = await call("/api/blogs");
  assert.equal(feed.status, 200);
  const dates = feed.body.blogs.map(blog => blog.createdAt);
  assert.deepEqual(dates, [...dates].sort().reverse());
  const id = feed.body.blogs[0].id;
  assert.equal((await call(`/api/blogs/${id}`)).body.blog.content, blogInput.content);
  assert.equal((await call("/api/blogs/00000000-0000-0000-0000-000000000000")).status, 404);
  assert.equal((await call("/api/blogs/not-a-uuid")).status, 404);
  assert.equal((await call(`/api/blogs/${id}`, { bearer: "invalid-token" })).status, 401);
  const html = await (await fetch(`${base}/frontend/blog-details.html`)).text();
  assert.ok(html.includes('id="blog-details-content"'));
  assert.ok(!html.includes(fixture.key));
  assert.equal((await fetch(`${base}/frontend/.env`)).status, 404);
  assert.equal((await fetch(`${base}/backend/.env`)).status, 404);
});

test("database failures use a safe JSON response without leaking upstream credentials", async () => {
  fixture.failNext({ code: "XX000", message: `Private database error ${fixture.key}` });
  const originalError = console.error;
  const logged = [];
  console.error = (...args) => logged.push(args.join(" "));
  try {
    const result = await call("/api/blogs");
    assert.equal(result.status, 500);
    assert.equal(result.body.message, "The server could not complete the request. Please try again.");
    assert.ok(!JSON.stringify(result.body).includes(fixture.key));
    assert.ok(logged.length > 0 && !logged.join(" ").includes(fixture.key));
  } finally { console.error = originalError; }
});

test("feeds include rows beyond the Supabase response limit", async () => {
  const originalCount = fixture.tables.blogs.length;
  const template = fixture.tables.blogs[0];
  const { randomUUID } = require("node:crypto");
  fixture.tables.blogs.push(...Array.from({ length: 1002 }, (_, index) => ({ ...template, id: randomUUID(), title: `Paged story ${index}` })));
  try { assert.equal((await call("/api/blogs")).body.blogs.length, originalCount + 1002); }
  finally { fixture.tables.blogs.splice(originalCount); }
});

test("CORS permits configured frontend origins and does not grant access to other origins", async () => {
  const allowed = await fetch(`${base}/api/blogs`, { headers: { Origin: "http://localhost:5500" } });
  assert.equal(allowed.headers.get("access-control-allow-origin"), "http://localhost:5500");
  const denied = await fetch(`${base}/api/blogs`, { headers: { Origin: "https://untrusted.example" } });
  assert.equal(denied.headers.get("access-control-allow-origin"), null);
});

test("Module 4 user endpoint requires login and returns only the owner's published posts and drafts", async () => {
  assert.equal((await call("/api/blogs/user")).status, 401);
  assert.equal((await call("/api/blogs/user", { bearer: "invalid" })).status, 401);
  const jwt = require("jsonwebtoken");
  const config = require("../config");
  const userId = (await call("/api/auth/me", { bearer: token })).body.user.id;
  const expired = jwt.sign({}, config.jwtSecret, { subject: userId, issuer: config.jwtIssuer, audience: config.jwtAudience, expiresIn: -1 });
  const parts = token.split(".");
  parts[1] = Buffer.from(JSON.stringify({ ...jwt.decode(token), sub: "forged-user" })).toString("base64url");
  for (const bearer of [expired, parts.join(".")]) {
    assert.equal((await call("/api/blogs/user", { bearer })).status, 401);
    assert.equal((await call("/api/blogs", { method: "POST", bearer, body: blogInput })).status, 401);
  }
  const mine = await call("/api/blogs/user", { bearer: token });
  assert.equal(mine.status, 200);
  assert.deepEqual(mine.body, (await call("/api/blogs/mine", { bearer: token })).body);
  assert.equal((await call("/api/blogs/user", { bearer: otherToken })).body.blogs.length, 0);
});

test("Module 4 update preserves omitted fields, validates changes, protects ownership and handles status transitions", async () => {
  const created = await call("/api/blogs", { method: "POST", bearer: token, body: {
    ...blogInput, imageUrl: undefined, image: "images/design-perspective.jpg", status: "draft"
  } });
  const id = created.body.blog.id;
  assert.equal(created.status, 201);
  assert.equal(created.body.blog.imageUrl, "images/design-perspective.jpg");
  const before = created.body.blog;
  assert.ok((await call("/api/blogs/user", { bearer: token })).body.blogs.some(blog => blog.id === id && blog.status === "draft"));
  assert.equal((await call(`/api/blogs/${id}`, { method: "PUT", body: { title: "Other" }, bearer: otherToken })).status, 403);
  for (const method of ["PUT", "DELETE"]) {
    assert.equal((await call(`/api/blogs/${id}`, { method, body: method === "PUT" ? blogInput : undefined })).status, 401);
    assert.equal((await call(`/api/blogs/${id}`, { method, bearer: "invalid", body: method === "PUT" ? blogInput : undefined })).status, 401);
    assert.equal((await call("/api/blogs/not-a-uuid", { method, bearer: token, body: method === "PUT" ? blogInput : undefined })).status, 404);
  }
  const edited = await call(`/api/blogs/${id}`, { method: "PUT", bearer: token, body: {
    title: "Updated draft", author_id: "forged", authorId: "forged", author: "Forged Name", author_name: "Forged Name"
  } });
  assert.equal(edited.status, 200);
  for (const field of ["category", "content", "imageUrl", "status", "author", "authorId", "createdAt"]) assert.equal(edited.body.blog[field], before[field]);
  for (const body of [{ title: " " }, { category: "Unknown" }, { content: "" }, { status: "private" }, { image: "javascript:alert(1)" }, null, []]) {
    assert.equal((await call(`/api/blogs/${id}`, { method: "PUT", bearer: token, body })).status, 400);
  }
  assert.equal((await call(`/api/blogs/${id}`, { bearer: token })).body.blog.title, "Updated draft");
  const published = await call(`/api/blogs/${id}`, { method: "PUT", bearer: token, body: { status: "published", image: "images/writing-routine.jpg" } });
  assert.equal(published.body.blog.status, "published");
  assert.equal(published.body.blog.imageUrl, "images/writing-routine.jpg");
  assert.equal((await call(`/api/blogs/${id}`)).status, 200);
  assert.equal((await call(`/api/blogs/${id}`, { method: "PUT", bearer: token, body: { status: "draft" } })).status, 200);
  assert.equal((await call(`/api/blogs/${id}`)).status, 404);
  assert.equal((await call(`/api/blogs/${id}`, { method: "DELETE", bearer: token })).body.message, "Blog deleted successfully");
  assert.ok(!(await call("/api/blogs/user", { bearer: token })).body.blogs.some(blog => blog.id === id));
});

test("Module 4 search matches title or content, combines with category, treats punctuation literally and excludes drafts", async () => {
  const samples = [
    { title: "Learning Node.js", category: "Technology", content: "JavaScript servers" },
    { title: "Server notes", category: "Web Development", content: "Learning NODE.js today" },
    { title: "Private Node.js", category: "Technology", content: "Draft content", status: "draft" },
    { title: 'Literal (node), "quotes", 100%_ * \\ path', category: "Design", content: "Literal symbols" }
  ];
  const ids = [];
  try {
    for (const sample of samples) {
      const created = await call("/api/blogs", { method: "POST", bearer: token, body: { ...blogInput, ...sample } });
      assert.equal(created.status, 201);
      ids.push(created.body.blog.id);
    }
    const results = await call("/api/blogs?search=NoDe.js");
    assert.equal(results.status, 200);
    assert.deepEqual(results.body.blogs.map(blog => blog.id).sort(), ids.slice(0, 2).sort());
    assert.deepEqual((await call("/api/blogs?search=node.js&category=Technology")).body.blogs.map(blog => blog.id), [ids[0]]);
    assert.deepEqual((await call("/api/blogs?category=Design")).body.blogs.map(blog => blog.id), [ids[3]]);
    for (const search of ['(node), "quotes"', '100%_', '*', '\\ path']) {
      assert.deepEqual((await call(`/api/blogs?search=${encodeURIComponent(search)}`)).body.blogs.map(blog => blog.id), [ids[3]]);
    }
    for (const search of ["definitely-absent", "x),status.eq.draft,content.imatch.(x"]) {
      assert.deepEqual((await call(`/api/blogs?search=${encodeURIComponent(search)}`)).body.blogs, []);
    }
    for (const query of ["category=Unknown", "search=one&search=two", "category=Design&category=Technology", `search=${"x".repeat(201)}`, "search=%00"]) {
      assert.equal((await call(`/api/blogs?${query}`)).status, 400);
    }
  } finally {
    for (const id of ids) await call(`/api/blogs/${id}`, { method: "DELETE", bearer: token });
  }
});

test("Module 4 filtered results page through all matching database rows", async () => {
  const originalCount = fixture.tables.blogs.length;
  const template = fixture.tables.blogs[0];
  const { randomUUID } = require("node:crypto");
  fixture.tables.blogs.push(...Array.from({ length: 1002 }, (_, index) => ({ ...template, id: randomUUID(), title: `Searchable paged story ${index}`, category: "Technology" })));
  try {
    assert.equal((await call("/api/blogs?search=Searchable&category=Technology")).body.blogs.length, 1002);
  } finally { fixture.tables.blogs.splice(originalCount); }
});

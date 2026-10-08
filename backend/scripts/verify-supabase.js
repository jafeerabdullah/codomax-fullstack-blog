"use strict";

// Opt-in live verification. Creates unique test accounts/posts and removes only
// those records in finally. Never use sample emails or delete existing records.
const assert = require("node:assert/strict");
const { randomUUID, randomBytes } = require("node:crypto");
const bcrypt = require("bcryptjs");

async function verify() {
  const supabase = require("../config/supabase");
  const app = require("../server");
  const runId = randomUUID();
  const emails = [`module3-${runId}@example.com`, `module3-other-${runId}@example.com`];
  const password = randomBytes(24).toString("hex");
  let server;
  const open = async () => {
    server = await new Promise(resolve => {
      const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
    });
    return `http://127.0.0.1:${server.address().port}`;
  };
  let base = await open();
  async function call(route, { method = "GET", body, token, status = 200 } = {}) {
    const response = await fetch(`${base}${route}`, {
      method,
      headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(20000)
    });
    assert.equal(response.status, status, `Unexpected HTTP status for ${method} ${route}`);
    return response.json();
  }
  const blogInput = { title: `Module 3 verification ${runId}`, category: "Technology", content: "Live Supabase verification.\n\nThis post belongs to this test run only.", imageUrl: "images/code-workspace.jpg", status: "published" };
  try {
    for (const email of emails) {
      const result = await call("/api/auth/register", { method: "POST", body: { name: "Module 3 Test Writer", email: email.toUpperCase(), password }, status: 201 });
      assert.ok(!("password" in result));
    }
    await call("/api/auth/register", { method: "POST", body: { name: "Duplicate", email: emails[0], password }, status: 409 });
    const stored = await supabase.from("users").select("id,email,password").eq("email", emails[0]).single();
    assert.ok(!stored.error, "Unable to query the saved Supabase user");
    assert.notEqual(stored.data.password, password);
    assert.ok(await bcrypt.compare(password, stored.data.password), "Password must be a bcrypt hash");
    const login = await call("/api/auth/login", { method: "POST", body: { email: emails[0], password } });
    const other = await call("/api/auth/login", { method: "POST", body: { email: emails[1], password } });
    assert.ok(!("password" in login.user));
    const token = login.token;
    assert.equal((await call("/api/auth/me", { token })).user.id, stored.data.id);
    const created = await call("/api/blogs", { method: "POST", token, body: { ...blogInput, author: "Forged author", author_id: other.user.id }, status: 201 });
    const id = created.blog.id;
    const savedBlog = await supabase.from("blogs").select("*").eq("id", id).single();
    assert.ok(!savedBlog.error, "Unable to query the saved Supabase blog");
    assert.equal(savedBlog.data.author_id, stored.data.id);
    assert.equal(savedBlog.data.author_name, login.user.name);
    assert.equal(savedBlog.data.image, blogInput.imageUrl);
    assert.equal((await call(`/api/blogs/${id}`)).blog.content, blogInput.content);
    await call(`/api/blogs/${id}`, { method: "PUT", token: other.token, body: blogInput, status: 403 });
    await call(`/api/blogs/${id}`, { method: "DELETE", token: other.token, status: 403 });
    const feed = (await call("/api/blogs")).blogs;
    assert.ok(feed.some(blog => blog.id === id));
    const times = feed.map(blog => Date.parse(blog.createdAt));
    assert.deepEqual(times, [...times].sort((a, b) => b - a));
    const draft = await call("/api/blogs", { method: "POST", token, body: { ...blogInput, status: "draft" }, status: 201 });
    assert.ok(!(await call("/api/blogs")).blogs.some(blog => blog.id === draft.blog.id));
    await call(`/api/blogs/${draft.blog.id}`, { status: 404 });
    await call(`/api/blogs/${draft.blog.id}`, { token: other.token, status: 404 });
    await call(`/api/blogs/${draft.blog.id}`, { token });
    await call(`/api/blogs/${id}`, { method: "PUT", token, body: { ...blogInput, title: `${blogInput.title} edited` } });
    const updated = await supabase.from("blogs").select("updated_at").eq("id", id).single();
    assert.ok(!updated.error);
    assert.ok(Date.parse(updated.data.updated_at) > Date.parse(savedBlog.data.updated_at), "The timestamp trigger must run on updates");
    await new Promise(resolve => server.close(resolve));
    base = await open();
    assert.ok((await call("/api/blogs/mine", { token })).blogs.some(blog => blog.id === id));
    await call(`/api/blogs/${id}`, { method: "DELETE", token });
    await call(`/api/blogs/${id}`, { status: 404 });
    assert.equal((await fetch(`${base}/frontend/blog-details.html`)).status, 200);
  } finally {
    await new Promise(resolve => server.close(resolve));
    // Exact unique emails for this run; no existing accounts or posts are touched.
    const users = await supabase.from("users").select("id").in("email", emails);
    if (users.error) throw new Error("Could not locate verification accounts for cleanup.");
    const ids = users.data.map(user => user.id);
    if (ids.length) {
      const blogs = await supabase.from("blogs").delete().in("author_id", ids);
      const accounts = blogs.error ? blogs : await supabase.from("users").delete().in("id", ids);
      if (accounts.error) throw new Error("Verification cleanup failed. Remove only this run's module3- test accounts manually.");
    }
    console.log("Verification records cleaned up.");
  }
  console.log("Live Supabase verification passed: registration, bcrypt, login, JWT, blog storage, feed ordering, details, draft privacy, ownership, updates, persistence and deletion.");
}

verify().catch(() => {
  console.error("Live Supabase verification failed. Check backend/.env, run database/module-3.sql, and check your Supabase connection. No credentials were printed.");
  process.exitCode = 1;
});

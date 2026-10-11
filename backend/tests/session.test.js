"use strict";

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const jwt = require("jsonwebtoken");

const source = readFileSync(path.join(__dirname, "../../frontend/js/api.js"), "utf8");
const sessionKey = "codomax.module2.session";
const user = { id: "b719b847-0059-43dd-8ba8-c9deeeebfd7f", name: "Session Writer", email: "writer@example.com", createdDate: "2026-10-01T00:00:00.000Z" };
function token(exp = Math.floor(Date.now() / 1000) + 3600, extra = {}) {
  return jwt.sign({ sub: user.id, iss: "codomax-blog", aud: "codomax-web", exp, ...extra }, "isolated-session-test-signing-secret");
}

// Exercise the real API/session module with browser storage, navigation, requests,
// and an adjustable clock. Full page interactions are also checked in Chromium.
function browser({ url = "http://localhost:5000/frontend/dashboard.html", saved, fetch } = {}) {
  let currentTime = Date.now();
  let nextTimer = 0;
  let location = new URL(url);
  const storage = new Map(saved === undefined ? [] : [[sessionKey, saved]]);
  const timers = new Map();
  const events = [];
  const navigations = [];
  const listeners = new Map();
  const sessionStorage = {
    getItem: key => storage.get(key) || null,
    setItem: (key, value) => storage.set(key, value),
    removeItem: key => storage.delete(key)
  };
  const window = {
    get location() { return { ...Object.fromEntries(["href", "port", "origin", "protocol", "pathname", "search"].map(key => [key, location[key]])), replace: target => { navigations.push(target); location = new URL(target, location); } }; },
    addEventListener: (name, callback) => listeners.set(name, [...(listeners.get(name) || []), callback]),
    dispatchEvent: event => { events.push(event.type); for (const listener of listeners.get(event.type) || []) listener(event); }
  };
  const context = vm.createContext({
    window, sessionStorage, URLSearchParams, AbortController, TextDecoder, Uint8Array, atob, Event,
    Date: class extends Date { static now() { return currentTime; } },
    setTimeout: (callback, delay) => { const id = ++nextTimer; timers.set(id, { callback, delay }); return id; },
    clearTimeout: id => timers.delete(id),
    fetch: fetch || (async () => Response.json({ user }))
  });
  vm.runInContext(source, context, { filename: "frontend/js/api.js" });
  return { api: window.BlogAPI, storage, timers, events, navigations, sessionStorage, advance: milliseconds => { currentTime += milliseconds; } };
}

test("frontend login stores only the tab's token and safe user fields, then sends Bearer headers", async () => {
  const bearer = token();
  const requests = [];
  const app = browser({ url: "http://localhost:5000/frontend/login.html", fetch: async (url, options) => {
    requests.push({ url, options });
    return url.endsWith("/auth/login") ? Response.json({ token: bearer, user: { ...user, password: "never-store-a-password" } }) : Response.json({ blogs: [] });
  } });
  await app.api.login({ email: user.email, password: "Login-password-123" });
  const stored = JSON.parse(app.storage.get(sessionKey));
  assert.equal(stored.token, bearer);
  assert.deepEqual(stored.user, user);
  assert.ok(!app.storage.get(sessionKey).includes("password"));
  await app.api.mine();
  assert.ok(requests[1].url.endsWith("/api/blogs/user"));
  assert.equal(requests[1].options.headers.Authorization, `Bearer ${bearer}`);
});

test("frontend rejects malformed, expired and mismatched sessions without retaining a token", () => {
  const samples = [
    "invalid-json", JSON.stringify({ token: "invalid", user }),
    JSON.stringify({ token: token(1), user }),
    JSON.stringify({ token: token(undefined, { sub: "another-user" }), user }),
    JSON.stringify({ token: token(undefined, { iss: "another-app" }), user })
  ];
  for (const saved of samples) {
    const app = browser({ saved });
    assert.equal(app.api.session(), null);
    assert.ok(!app.storage.has(sessionKey));
  }
});

test("backend 401 clears the frontend session and sends a private page to login", async () => {
  const app = browser({ saved: JSON.stringify({ token: token(), user }), fetch: async () => Response.json({ message: "Session rejected" }, { status: 401 }) });
  await assert.rejects(app.api.profile(), error => error.status === 401);
  assert.equal(app.api.session(), null);
  assert.ok(!app.storage.has(sessionKey));
  assert.ok(app.events.includes("codomax:session-ended"));
  assert.ok(app.navigations[0].startsWith("login.html?"));
  assert.ok(app.navigations[0].includes("reason=session-expired"));
});

test("idle expiry ends the session, and logout stays effective when storage removal is blocked", async () => {
  const app = browser({ saved: JSON.stringify({ token: token(), user }) });
  const expiry = [...app.timers.values()][0];
  app.advance(3601000);
  expiry.callback();
  assert.equal(app.api.session(), null);
  assert.ok(app.navigations[0].startsWith("login.html?"));
  const blocked = browser({ saved: JSON.stringify({ token: token(), user }) });
  blocked.sessionStorage.removeItem = () => { throw new Error("Storage blocked"); };
  blocked.api.logout();
  assert.equal(blocked.api.session(), null);
  assert.equal(blocked.timers.size, 0);
  await assert.rejects(blocked.api.profile(), error => error.status === 401);
});

test("login return destinations allow only the local workspace pages", () => {
  for (const next of ["https://evil.example", "//evil.example", "../dashboard.html", "javascript:alert(1)", "dashboard.html\n"]) {
    const app = browser({ url: `http://localhost:5000/frontend/login.html?next=${encodeURIComponent(next)}` });
    assert.equal(app.api.loginDestination(), "dashboard.html");
  }
  const app = browser({ url: "http://localhost:5000/frontend/login.html?next=edit-blog.html%3Fid%3DBLOG_ID" });
  assert.equal(app.api.loginDestination(), "edit-blog.html?id=BLOG_ID");
});

test("blocked browser storage does not report a usable login session", async () => {
  const app = browser({ url: "http://localhost:5000/frontend/login.html", fetch: async () => Response.json({ token: token(), user }) });
  app.sessionStorage.setItem = () => { throw new Error("Storage blocked"); };
  await assert.rejects(app.api.login({ email: user.email, password: "Secure-password-123" }), /browser storage is blocked/);
  assert.equal(app.api.session(), null);
  assert.equal(app.storage.size, 0);
});

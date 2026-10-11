/* API and login session boundary. Replace only this layer if API URLs change. */
"use strict";

(() => {
  const BASE_URL = window.location.port === "5000" && ["http:", "https:"].includes(window.location.protocol)
    ? `${window.location.origin}/api` : "http://localhost:5000/api";
  const SESSION_KEY = "codomax.module2.session";
  let expiryTimer;
  let sessionEnded = false;
  const privatePages = ["dashboard.html", "create-blog.html", "edit-blog.html"];
  const pageName = () => window.location.pathname.split("/").pop();
  const requiresLogin = () => privatePages.includes(pageName()) && new URLSearchParams(window.location.search).get("demo") !== "1";

  function redirectToLogin(expired = false) {
    const query = new URLSearchParams({ next: `${pageName()}${window.location.search}` });
    if (expired) query.set("reason", "session-expired");
    window.location.replace(`login.html?${query}`);
  }
  function loginDestination() {
    const next = new URLSearchParams(window.location.search).get("next") || "";
    // Only local workspace pages can be a return destination.
    return !/[\u0000-\u001f\u007f]/.test(next) && /^(dashboard|create-blog|edit-blog)\.html(?:\?[^#]*)?(?:#.*)?$/.test(next) ? next : "dashboard.html";
  }
  function payload(token) {
    const parts = token.split(".");
    if (parts.length !== 3) throw new Error("Invalid token");
    const bytes = Uint8Array.from(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")), character => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function logout() {
    sessionEnded = true;
    clearTimeout(expiryTimer);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* In-memory session is still cleared. */ }
    window.dispatchEvent(new Event("codomax:session-ended"));
  }
  function session() {
    if (sessionEnded) return null;
    let current;
    try { current = JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { logout(); return null; }
    if (!current) return null;
    try {
      const { token, user } = current;
      if (typeof token !== "string" || !user || typeof user.id !== "string" || typeof user.name !== "string" || typeof user.email !== "string") throw new Error("Invalid session");
      // These checks only control the UI; Express verifies the signature and account.
      const claims = payload(token);
      if (claims.sub !== user.id || claims.iss !== "codomax-blog" || claims.aud !== "codomax-web" || !Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now()) throw new Error("Invalid or expired session");
      return current;
    } catch { logout(); return null; }
  }
  function endSession() {
    logout();
    if (requiresLogin()) redirectToLogin(true);
  }
  function scheduleExpiry() {
    clearTimeout(expiryTimer);
    const current = session();
    if (!current) return;
    expiryTimer = setTimeout(() => {
      if (!session()) endSession();
      else scheduleExpiry();
    }, Math.min(payload(current.token).exp * 1000 - Date.now(), 2147483647));
  }
  function missingSession() {
    const error = new Error("Please login to continue.");
    error.status = 401;
    return error;
  }
  async function request(route, { method = "GET", body, authenticated = false } = {}) {
    const current = session();
    if (authenticated && !current) { endSession(); throw missingSession(); }
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (authenticated) headers.Authorization = `Bearer ${current.token}`;
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 10000);
    try {
      const response = await fetch(`${BASE_URL}${route}`, {
        method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: abort.signal
      });
      let data;
      try { data = await response.json(); } catch { throw new Error("The server returned an invalid response. Please try again."); }
      if (!response.ok) {
        if (response.status === 401 && authenticated) {
          const active = session();
          if (!active || active.token === current.token) endSession();
        }
        const error = new Error(data.message || "The request could not be completed.");
        error.status = response.status;
        error.fields = data.errors || {};
        throw error;
      }
      if (authenticated) {
        const active = session();
        if (active?.token !== current.token) {
          if (!active) endSession();
          throw missingSession();
        }
      }
      return data;
    } catch (error) {
      if (error.name === "AbortError") throw new Error("The server took too long to respond. Please try again.");
      if (error instanceof TypeError) throw new Error("Cannot reach the backend. Start it with npm run dev and open http://localhost:5000/frontend/.");
      throw error;
    } finally { clearTimeout(timeout); }
  }
  async function login(credentials) {
    const data = await request("/auth/login", { method: "POST", body: credentials });
    const { id, name, email, createdDate } = data.user;
    const nextSession = { token: data.token, user: { id, name, email, createdDate } };
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession)); }
    catch { throw new Error("Login succeeded, but browser storage is blocked. Enable session storage to continue between pages."); }
    sessionEnded = false;
    scheduleExpiry();
    return data;
  }
  async function currentUser() {
    const data = await request("/auth/me", { authenticated: true });
    const current = session();
    if (!current) throw missingSession();
    const { id, name, email, createdDate } = data.user;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify({ token: current.token, user: { id, name, email, createdDate } })); }
    catch { endSession(); throw missingSession(); }
    scheduleExpiry();
    return data;
  }

  window.BlogAPI = Object.freeze({
    session, logout, login, currentUser, requiresLogin, redirectToLogin, loginDestination,
    register: input => request("/auth/register", { method: "POST", body: input }),
    profile: () => request("/users/profile", { authenticated: true }),
    published: async (filters = {}) => {
      const query = new URLSearchParams();
      for (const name of ["search", "category"]) if (filters[name]) query.set(name, filters[name]);
      return (await request(`/blogs${query.size ? `?${query}` : ""}`)).blogs;
    },
    mine: async () => (await request("/blogs/user", { authenticated: true })).blogs,
    details: async id => (await request(`/blogs/${encodeURIComponent(id)}`, { authenticated: Boolean(session()) })).blog,
    find: async id => (await request(`/blogs/${encodeURIComponent(id)}`, { authenticated: true })).blog,
    create: input => request("/blogs", { method: "POST", body: input, authenticated: true }),
    update: (id, input) => request(`/blogs/${encodeURIComponent(id)}`, { method: "PUT", body: input, authenticated: true }),
    remove: id => request(`/blogs/${encodeURIComponent(id)}`, { method: "DELETE", authenticated: true })
  });
  window.addEventListener("focus", () => {
    if (requiresLogin() && !session()) endSession();
    else scheduleExpiry();
  });
  window.addEventListener("pageshow", event => {
    if (event.persisted && requiresLogin()) currentUser().catch(() => { /* The next API call also verifies the session. */ });
    scheduleExpiry();
  });
  scheduleExpiry();
})();

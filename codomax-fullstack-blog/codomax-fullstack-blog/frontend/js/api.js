/* API and login session boundary. Replace only this layer if API URLs change. */
"use strict";

(() => {
  const BASE_URL = window.location.port === "5000" && ["http:", "https:"].includes(window.location.protocol)
    ? `${window.location.origin}/api` : "http://localhost:5000/api";
  const SESSION_KEY = "codomax.module2.session";
  let cachedSession;

  function logout() {
    cachedSession = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* In-memory session is still cleared. */ }
  }
  function session() {
    if (cachedSession === undefined) {
      try { cachedSession = JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { cachedSession = null; }
    }
    if (!cachedSession) return null;
    try {
      const { token, user } = cachedSession;
      if (typeof token !== "string" || !user || typeof user.id !== "string" || typeof user.name !== "string") throw new Error("Invalid session");
      // This expiration check is for the UI. The server verifies the JWT signature.
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      if (!Number.isFinite(payload.exp) || payload.exp * 1000 <= Date.now()) throw new Error("Expired session");
      return cachedSession;
    } catch { logout(); return null; }
  }
  async function request(route, { method = "GET", body, authenticated = false } = {}) {
    const current = session();
    if (authenticated && !current) throw new Error("Please login to continue.");
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (authenticated) headers.Authorization = `Bearer ${current.token}`;
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 10000);
    try {
      const response = await fetch(`${BASE_URL}${route}`, {
        method, headers, ...(body === undefined ? {} : { body: JSON.stringify(body) }), signal: abort.signal
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401 && authenticated) logout();
        const error = new Error(data.message || "The request could not be completed.");
        error.status = response.status;
        error.fields = data.errors || {};
        throw error;
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
    const nextSession = { token: data.token, user: data.user };
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(nextSession)); }
    catch { throw new Error("Login succeeded, but browser storage is blocked. Enable session storage to continue between pages."); }
    cachedSession = nextSession;
    return data;
  }

  window.BlogAPI = Object.freeze({
    session, logout, login,
    register: input => request("/auth/register", { method: "POST", body: input }),
    currentUser: () => request("/auth/me", { authenticated: true }),
    published: async () => (await request("/blogs")).blogs,
    mine: async () => (await request("/blogs/mine", { authenticated: true })).blogs,
    find: async id => (await request(`/blogs/${encodeURIComponent(id)}`, { authenticated: true })).blog,
    create: input => request("/blogs", { method: "POST", body: input, authenticated: true }),
    update: (id, input) => request(`/blogs/${encodeURIComponent(id)}`, { method: "PUT", body: input, authenticated: true }),
    remove: id => request(`/blogs/${encodeURIComponent(id)}`, { method: "DELETE", authenticated: true })
  });
})();

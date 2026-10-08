"use strict";

// An isolated PostgREST HTTP fixture. Tests exercise the real Supabase SDK;
// this fixture cannot verify a live Supabase connection or PostgreSQL schema.
const http = require("node:http");
const { randomUUID } = require("node:crypto");

module.exports = function createSupabaseFixture() {
  const tables = { users: [], blogs: [] };
  const key = "isolated-test-service-role-key";
  let failure;
  const server = http.createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
    if (req.headers.apikey !== key || req.headers.authorization !== `Bearer ${key}`) return send(401, { message: "Invalid fixture key" });
    if (failure) { const error = failure; failure = undefined; return send(500, error); }
    const url = new URL(req.url, "http://localhost");
    const table = url.pathname.split("/").pop();
    if (!tables[table]) return send(404, { code: "42P01", message: "Unknown fixture table" });
    const matches = row => [...url.searchParams].every(([column, value]) => {
      if (value.startsWith("eq.")) return String(row[column]) === value.slice(3);
      if (value.startsWith("in.(")) return value.slice(4, -1).split(",").map(item => item.replace(/^"|"$/g, "")).includes(String(row[column]));
      return true;
    });
    let rows = tables[table].filter(matches);
    let body;
    if (["POST", "PATCH"].includes(req.method)) {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      body = JSON.parse(raw);
    }
    if (req.method === "POST") {
      if (table === "users" && tables.users.some(user => user.email === body.email)) return send(409, { code: "23505", message: "Duplicate email" });
      if (table === "blogs" && !tables.users.some(user => user.id === body.author_id)) return send(409, { code: "23503", message: "Missing author" });
      const now = new Date().toISOString();
      const row = { ...body, id: randomUUID(), created_at: now, ...(table === "blogs" ? { updated_at: now } : {}) };
      tables[table].push(row);
      rows = [row];
    } else if (req.method === "PATCH") {
      rows.forEach(row => Object.assign(row, body, { updated_at: new Date().toISOString() }));
    } else if (req.method === "DELETE") {
      tables[table] = tables[table].filter(row => !matches(row));
    }
    const order = url.searchParams.get("order");
    if (order) rows.sort((a, b) => {
      for (const part of order.split(",")) {
        const [column, direction] = part.split(".");
        const comparison = String(a[column]).localeCompare(String(b[column]));
        if (comparison) return direction === "desc" ? -comparison : comparison;
      }
      return 0;
    });
    const offset = Number(url.searchParams.get("offset") || 0);
    const limit = Number(url.searchParams.get("limit") || 1000);
    rows = rows.slice(offset, offset + limit);
    const selected = url.searchParams.get("select");
    if (selected && selected !== "*") rows = rows.map(row => Object.fromEntries(selected.split(",").map(column => [column, row[column]])));
    if (req.headers.accept?.includes("application/vnd.pgrst.object+json")) {
      if (rows.length !== 1) return send(406, { code: "PGRST116", details: `The result contains ${rows.length} rows`, message: "Expected one row" });
      return send(req.method === "POST" ? 201 : 200, rows[0]);
    }
    send(req.method === "POST" ? 201 : 200, rows);
  });
  return {
    tables, key,
    failNext(error) { failure = error; },
    async start() {
      await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
      return `http://127.0.0.1:${server.address().port}`;
    },
    async close() { await new Promise(resolve => server.close(resolve)); }
  };
};

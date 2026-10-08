"use strict";

const { createClient } = require("@supabase/supabase-js");
require("../config"); // Loads backend/.env without exposing it to the frontend.

const url = process.env.SUPABASE_URL || "";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
let validUrl = false;
try {
  const parsed = new URL(url);
  validUrl = ["http:", "https:"].includes(parsed.protocol) && !parsed.username && !parsed.password;
} catch { /* Report configuration errors without printing their values. */ }
if (!validUrl || url.includes("your-project") || !key || key.startsWith("replace-with-")) {
  throw new Error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env, then run the Module 3 database SQL. See README.md.");
}

module.exports = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  global: {
    fetch: (input, options = {}) => fetch(input, { ...options, signal: options.signal || AbortSignal.timeout(10000) })
  }
});

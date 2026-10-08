"use strict";

const { randomBytes } = require("node:crypto");
const { readFileSync, writeFileSync, existsSync } = require("node:fs");
const path = require("node:path");
const target = path.join(__dirname, "..", ".env");

if (existsSync(target)) {
  let existing = readFileSync(target, "utf8");
  for (const setting of ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]) {
    if (!new RegExp(`^\\s*${setting}\\s*=`, "m").test(existing)) existing += `\n${setting}=\n`;
  }
  writeFileSync(target, existing);
  console.log(".env already exists; existing settings were preserved.");
} else {
  const template = readFileSync(path.join(__dirname, "..", ".env.example"), "utf8");
  writeFileSync(target, template.replace("replace-with-a-random-secret-at-least-32-characters-long", randomBytes(48).toString("hex")), { flag: "wx" });
  console.log("Created .env with a new local JWT secret.");
}

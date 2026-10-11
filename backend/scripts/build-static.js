"use strict";

const fs = require("node:fs");
const path = require("node:path");

const backend = path.resolve(__dirname, "..");
const source = path.resolve(backend, "../frontend");
const destination = path.resolve(backend, "public");
if (path.dirname(destination) !== backend || path.basename(destination) !== "public") throw new Error("Invalid static build destination.");
if (fs.existsSync(destination) && fs.lstatSync(destination).isSymbolicLink()) throw new Error("Static build destination must not be a symbolic link.");
// public/ is an ignored build artifact, never a second source tree or project.
fs.rmSync(destination, { recursive: true, force: true });
fs.mkdirSync(destination, { recursive: true });
const assets = ["index.html", "blogs.html", "blog-details.html", "login.html", "register.html", "dashboard.html", "create-blog.html", "edit-blog.html", "css", "js", "images"];
for (const asset of assets) {
  fs.cpSync(path.join(source, asset), path.join(destination, asset), {
    recursive: true,
    filter(file) {
      const info = fs.lstatSync(file);
      if (info.isSymbolicLink()) throw new Error("Static assets must not be symbolic links.");
      return !path.basename(file).startsWith(".") && (info.isDirectory() || /\.(html|css|js|jpg|jpeg|png|webp|svg)$/i.test(file));
    }
  });
}
console.log("Frontend assets prepared in backend/public for the Vercel CDN.");

"use strict";

const path = require("node:path");
const fs = require("node:fs");
const nodemon = require("../codomax-fullstack-blog/backend/node_modules/nodemon");
const root = path.resolve(__dirname, "../codomax-fullstack-blog/backend");
const file = path.join(root, "utils/HttpError.js");
const data = path.join(__dirname, "nodemon-test-data");
let starts = 0;
let passed = false;
const timer = setTimeout(() => { console.error("Development watcher did not restart in time."); nodemon.emit("quit"); }, 25000);

async function ready() {
  for (let attempt = 0; attempt < 50; attempt++) {
    try {
      const response = await fetch("http://127.0.0.1:5001/");
      if ((await response.text()) === "Blog API Server Running") return;
    } catch { /* Wait for child startup. */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Development server did not serve its root response.");
}

process.chdir(root);
nodemon({ script: "server.js", stdout: true, env: { PORT: "5001", DATA_DIR: data } });
nodemon.on("start", async () => {
  try {
    starts++;
    await ready();
    if (starts === 1) {
      setTimeout(() => {
        const now = new Date();
        fs.utimesSync(file, now, now); // Trigger file watching without changing the source.
      }, 800);
    } else {
      passed = true;
      console.log("PASS: nodemon starts and automatically restarts the working server with Chokidar 4.");
      nodemon.emit("quit");
    }
  } catch (error) { console.error(error.message); nodemon.emit("quit"); }
});
nodemon.on("quit", () => {
  clearTimeout(timer);
  setTimeout(() => process.exit(passed ? 0 : 1), 500);
});

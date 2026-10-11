"use strict";

const app = require("./app");
const config = require("./config");

if (require.main === module) {
  const server = app.listen(config.port, "127.0.0.1", () => {
    console.log(`Codomax Journal: http://localhost:${config.port}/`);
  });
  server.on("error", error => {
    console.error(`Server could not start: ${error.message}`);
    process.exitCode = 1;
  });
}

// Preserve the existing test/script import while Vercel uses app.js directly.
module.exports = app;

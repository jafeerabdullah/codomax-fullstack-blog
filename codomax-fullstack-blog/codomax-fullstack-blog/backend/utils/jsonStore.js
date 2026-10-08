"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { dataDirectory } = require("../config");

// One queue per file serializes read/modify/write operations in this server process.
// Replace this persistence adapter with database operations in Module 3.
function createJsonStore(filename) {
  const file = path.join(dataDirectory, filename);
  let queue = Promise.resolve();
  async function readFile() {
    await fs.mkdir(dataDirectory, { recursive: true });
    try {
      await fs.writeFile(file, "[]\n", { flag: "wx" });
    } catch (error) {
      if (error.code !== "EEXIST") throw error;
    }
    const records = JSON.parse(await fs.readFile(file, "utf8"));
    if (!Array.isArray(records)) throw new Error(`${filename} must contain a JSON array.`);
    return records;
  }
  async function writeFile(records) {
    const temporary = `${file}.${randomUUID()}.tmp`;
    try {
      await fs.writeFile(temporary, `${JSON.stringify(records, null, 2)}\n`, { flag: "wx" });
      await fs.rename(temporary, file);
    } finally {
      await fs.rm(temporary, { force: true });
    }
  }
  return {
    async read() { await queue; return readFile(); },
    mutate(operation) {
      const transaction = queue.then(async () => {
        const records = await readFile();
        const result = await operation(records);
        await writeFile(records);
        return result;
      });
      // A rejected operation must not prevent later valid transactions.
      queue = transaction.catch(() => {});
      return transaction;
    }
  };
}

module.exports = createJsonStore;

"use strict";

const HttpError = require("./HttpError");

module.exports = function databaseResult({ data, error }) {
  // Do not forward database messages, URLs, headers, or credentials to clients/logs.
  if (error) throw new HttpError(500, "Database request failed. Check the Supabase connection and Module 3 schema.");
  return data;
};

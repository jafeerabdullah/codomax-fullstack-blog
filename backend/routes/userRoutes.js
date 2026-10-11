"use strict";

const router = require("express").Router();
const requireAuth = require("../middleware/authMiddleware");
const { getProfile } = require("../controllers/userController");

router.get("/profile", requireAuth, getProfile);

module.exports = router;

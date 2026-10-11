"use strict";

const router = require("express").Router();
const { registerUser, loginUser, currentUser } = require("../controllers/authController");
const requireAuth = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", requireAuth, currentUser);

module.exports = router;

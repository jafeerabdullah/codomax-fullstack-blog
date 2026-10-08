"use strict";

const router = require("express").Router();
const controller = require("../controllers/blogController");
const requireAuth = require("../middleware/auth");

router.get("/", controller.listBlogs);
router.get("/mine", requireAuth, controller.listMyBlogs);
router.get("/:id", requireAuth, controller.getBlog);
router.post("/", requireAuth, controller.createBlog);
router.put("/:id", requireAuth, controller.updateBlog);
router.delete("/:id", requireAuth, controller.deleteBlog);

module.exports = router;

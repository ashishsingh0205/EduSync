const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/dashboard", protect, allowRoles("student"), (req, res) => {
  res.json({
    message: "Welcome to Student Dashboard",
    user: req.user,
  });
});

module.exports = router;
const express = require("express");
const protect = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.get(
  "/dashboard",
  protect,
  allowRoles("instructor"),
  (req, res) => {
    res.json({
      message: "Welcome to Instructor Dashboard",
      user: req.user,
    });
  }
);

module.exports = router;
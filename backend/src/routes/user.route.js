import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/profile", isAuthenticated, async (req, res) => {
  const user = await User.findById(req.user.userId).select("name email role");
  res.json({
    message: "Protected route accessed",
    user,
  });
});
router.get("/admin-test", isAuthenticated, allowRoles("admin"), (req, res) => {
  res.json({
    message: "Welcome Malik",
  });
});

router.put("/profile", isAuthenticated, async (req, res) => {
  try {
    const { name } = req.body;
    name.trim();
    if (!name) {
      return res.status(400).json({
        message: "Name is required",
      });
    }
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name },
      { new: true },
    ).select("name email role");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error updating profile",
      error: err.message,
    });
  }
});
export default router;

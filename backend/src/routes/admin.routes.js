import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { allowRoles } from "../middleware/role.middleware.js";
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from "../controllers/admin.Controller.js";

const router = express.Router();

router.get("/users", isAuthenticated, allowRoles("admin"), getAllUsers);
router.get("/users/:id", isAuthenticated, allowRoles("admin"), getUserById);
router.patch(
  "/users/:id/role",
  isAuthenticated,
  allowRoles("admin"),
  updateUserRole,
);

router.delete("/users/:id", isAuthenticated, allowRoles("admin"), deleteUser);
export default router;

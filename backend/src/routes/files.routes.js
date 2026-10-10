import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  uploadFile,
  getMyFiles,
  getFile,
  deleteFile,
  updateFile,
  getAllFiles,
} from "../controllers/file.controller.js";
import { allowRoles } from "../middleware/role.middleware.js";
import { hasPermission } from "../middleware/permission.middleware.js";
import { checkFileOwnership } from "../middleware/ownership.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, upload.single("file"), uploadFile);
router.get("/", isAuthenticated, getMyFiles);
router.get("/:id", isAuthenticated, getFile);
router.delete(
  "/:id",
  isAuthenticated,
  hasPermission("FILE_DELETE"),
  checkFileOwnership,
  deleteFile,
);

router.put(
  "/:id",
  isAuthenticated,
  hasPermission("FILE_UPDATE"),
  checkFileOwnership,
  upload.single("file"),
  updateFile,
);

router.get(
  "/admin/all",
  isAuthenticated,
  allowRoles("admin"),
  hasPermission("ALL_FILES_READ"),
  getAllFiles,
);

router.delete(
  "/admin/:id",
  isAuthenticated,
  allowRoles("admin"),
  hasPermission("ALL_FILES_DELETE"),
  checkFileOwnership,
  deleteFile,
);

export default router;

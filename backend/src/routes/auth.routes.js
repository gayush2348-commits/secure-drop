import express from "express";
import {
  signup,
  login,
  refreshAccessToken,
  logout,
  logoutAll,
  verifyEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.Controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), signup);
router.get("/verify-email", verifyEmail);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);
router.post("/logoutAll", isAuthenticated, logoutAll);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;

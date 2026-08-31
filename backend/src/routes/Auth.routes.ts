import express from "express";
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  me,
  updateProfile,
  changePassword
} from "../controllers/Auth.controller.js";
import {
  registerValidator,
  loginValidator,
  refreshValidator,
  updateProfileValidator,
  changePasswordValidator
} from "../validators/Auth.validator.js";
import { validateRequest } from "../middleware/Validation.middleware.js";
import { authenticate } from "../middleware/Auth.middleware.js";
import { authLimiter, refreshLimiter } from "../middleware/RateLimit.middleware.js";

const router = express.Router();

router.post(
  "/register",
  authLimiter,
  registerValidator,
  validateRequest,
  register
);

router.post(
  "/login",
  authLimiter,
  loginValidator,
  validateRequest,
  login
);

router.post(
  "/refresh",
  refreshLimiter,
  refreshValidator,
  validateRequest,
  refresh
);

router.post("/logout", logout);

router.get("/me", authenticate, me);

router.patch(
  "/me",
  authenticate,
  updateProfileValidator,
  validateRequest,
  updateProfile
);

router.patch(
  "/me/password",
  authenticate,
  authLimiter,
  changePasswordValidator,
  validateRequest,
  changePassword
);

router.post("/logout-all", authenticate, logoutAll);

export default router;



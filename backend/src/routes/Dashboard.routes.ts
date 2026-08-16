import express from "express";
import { authenticate } from "../middleware/Auth.middleware.js";
import { getDashboard } from "../controllers/Dashboard.controller.js";

const router = express.Router();

// GET /api/dashboard
router.get("/", authenticate, getDashboard);

export default router;

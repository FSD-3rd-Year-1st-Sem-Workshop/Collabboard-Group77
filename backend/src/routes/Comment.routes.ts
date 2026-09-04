import { Router } from "express";
import { updateComment, deleteComment } from "../controllers/Comment.controller.js";
import { authenticate } from "../middleware/Auth.middleware.js";
import { requireCommentWorkspaceMember } from "../middleware/ResourceAuth.middleware.js";
import { validateRequest } from "../middleware/Validation.middleware.js";
import { updateCommentValidator } from "../validators/Comment.validator.js";

const router = Router();

// Protect all comment routes
router.use(authenticate);

// Middleware resolves workspace membership via Comment -> Task -> Board
router.use("/:commentId", requireCommentWorkspaceMember);

router.patch("/:commentId", updateCommentValidator, validateRequest, updateComment);
router.delete("/:commentId", deleteComment);

export default router;

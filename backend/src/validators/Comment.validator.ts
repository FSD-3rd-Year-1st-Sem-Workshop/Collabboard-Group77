import { body } from "express-validator";

export const createCommentValidator = [
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Comment content is required")
        .isLength({ max: 2000 })
        .withMessage("Comment cannot exceed 2000 characters"),
];

export const updateCommentValidator = [
    body("content")
        .trim()
        .notEmpty()
        .withMessage("Comment content is required")
        .isLength({ max: 2000 })
        .withMessage("Comment cannot exceed 2000 characters"),
];

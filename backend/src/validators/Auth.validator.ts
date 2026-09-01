import { body } from "express-validator";

export const registerValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 6, max: 60 })
    .withMessage("Full name must be 6–60 characters"),

  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be 8–72 characters"),

  body("bio")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters")
];

export const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("A valid email is required")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
];

export const refreshValidator = [
  body("refreshToken")
    .optional()
    .isString()
    .withMessage("Invalid refresh token")
];

export const updateProfileValidator = [
  body("fullName")
    .optional()
    .trim()
    .isLength({ min: 6, max: 60 })
    .withMessage("Full name must be 6–60 characters"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),

  body("avatar")
    .optional({ nullable: true })
    .isURL({ protocols: ["http", "https"], require_protocol: true })
    .withMessage("Avatar must be a valid HTTP(S) URL or null")
];

export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .isLength({ min: 8, max: 72 })
    .withMessage("New password must be 8–72 characters")
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage("New password must be different from the current password")
];

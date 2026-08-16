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

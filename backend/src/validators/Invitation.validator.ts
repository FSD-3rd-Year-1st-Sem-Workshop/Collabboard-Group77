import { body } from "express-validator";

export const sendInvitationValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("A valid email is required")
        .normalizeEmail(),

    body("role")
        .optional()
        .trim()
        .isIn(["admin", "member"])
        .withMessage("Role must be either 'admin' or 'member'"),
];

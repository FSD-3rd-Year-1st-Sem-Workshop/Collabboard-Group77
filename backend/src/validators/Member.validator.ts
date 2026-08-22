import { body } from "express-validator";

export const updateMemberValidator = [
    body("role")
        .trim()
        .notEmpty()
        .withMessage("Role is required")
        .isIn(["admin", "member"])
        .withMessage("Role must be either 'admin' or 'member'")
];

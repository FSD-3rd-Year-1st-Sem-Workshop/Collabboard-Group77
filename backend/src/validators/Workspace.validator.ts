import { body } from "express-validator";

export const createWorkspaceValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Workspace name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Workspace name must be between 3 and 100 characters"),

    body("description")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),

    body("logo")
        .optional({ nullable: true })
        .trim()
        .isString()
        .withMessage("Logo must be a valid URL/string"),

    body("color")
        .optional({ values: "falsy" })
        .trim()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage("Color must be a valid Hex color code"),

    body("visibility")
        .optional({ values: "falsy" })
        .trim()
        .isIn(["private", "team"])
        .withMessage("Visibility must be either 'private' or 'team'")
];

export const updateWorkspaceValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Workspace name must be between 3 and 100 characters"),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),

    body("logo")
        .optional({ nullable: true })
        .trim()
        .isString(),

    body("color")
        .optional()
        .trim()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage("Color must be a valid Hex color code"),

    body("visibility")
        .optional()
        .trim()
        .isIn(["private", "team"])
        .withMessage("Visibility must be either 'private' or 'team'")
];

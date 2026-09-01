import { body } from "express-validator";

export const createBoardValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Board name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Board name must be between 3 and 100 characters"),

    body("description")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),

    body("color")
        .optional({ values: "falsy" })
        .trim()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage("Color must be a valid Hex color code"),

    body("visibility")
        .optional({ values: "falsy" })
        .trim()
        .isIn(["workspace", "private", "public"])
        .withMessage("Visibility must be workspace, private, or public")
];

export const updateBoardValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Board name must be between 3 and 100 characters"),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),

    body("color")
        .optional()
        .trim()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage("Color must be a valid Hex color code"),

    body("visibility")
        .optional()
        .trim()
        .isIn(["workspace", "private", "public"])
        .withMessage("Visibility must be workspace, private, or public")
];

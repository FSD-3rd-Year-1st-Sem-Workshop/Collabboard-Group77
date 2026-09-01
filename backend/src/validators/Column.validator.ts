import { body } from "express-validator";

export const createColumnValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Column name is required")
        .isLength({ max: 50 })
        .withMessage("Column name cannot exceed 50 characters"),

    body("description")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 250 })
        .withMessage("Description cannot exceed 250 characters"),

    body("color")
        .optional({ values: "falsy" })
        .trim()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage("Color must be a valid Hex color code"),
];

export const updateColumnValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage("Column name must be between 1 and 50 characters"),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 250 })
        .withMessage("Description cannot exceed 250 characters"),

    body("color")
        .optional()
        .trim()
        .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
        .withMessage("Color must be a valid Hex color code"),
];

export const reorderColumnsValidator = [
    body("columns")
        .isArray({ min: 1 })
        .withMessage("Columns array is required"),

    body("columns.*.id")
        .isMongoId()
        .withMessage("Valid column ID is required"),

    body("columns.*.position")
        .isNumeric()
        .withMessage("Position must be a number")
];

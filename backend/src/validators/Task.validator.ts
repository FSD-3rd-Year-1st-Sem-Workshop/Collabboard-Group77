import { body } from "express-validator";

export const createTaskValidator = [
    body("columnId")
        .isMongoId()
        .withMessage("Valid column ID is required"),

    body("title")
        .trim()
        .notEmpty()
        .withMessage("Task title is required")
        .isLength({ max: 200 })
        .withMessage("Title cannot exceed 200 characters"),

    body("description")
        .optional({ values: "falsy" })
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description cannot exceed 5000 characters"),

    body("priority")
        .optional({ values: "falsy" })
        .isIn(["low", "medium", "high", "critical"])
        .withMessage("Invalid priority level"),
];

export const updateTaskValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage("Title must be between 1 and 200 characters"),

    body("description")
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 5000 })
        .withMessage("Description cannot exceed 5000 characters"),

    body("priority")
        .optional()
        .isIn(["low", "medium", "high", "critical"])
        .withMessage("Invalid priority level"),

    body("dueDate")
        .optional({ nullable: true })
        .isISO8601()
        .withMessage("Due date must be a valid ISO 8601 string"),

    body("estimatedHours")
        .optional({ nullable: true })
        .isNumeric()
        .withMessage("Estimated hours must be a number"),
];

export const moveTaskValidator = [
    body("columnId")
        .isMongoId()
        .withMessage("Valid column ID is required"),

    body("position")
        .isNumeric()
        .withMessage("Position is required"),

    body("version")
        .isNumeric()
        .notEmpty()
        .withMessage("Task version is required for optimistic concurrency control")
];

export const assignTaskValidator = [
    body("assignedTo")
        .isArray()
        .withMessage("Assigned users must be an array of user IDs"),

    body("assignedTo.*")
        .isMongoId()
        .withMessage("Valid user ID is required")
];

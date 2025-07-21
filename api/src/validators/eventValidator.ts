import { body } from 'express-validator';

export const createEventValidator = [
  body('category')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Category must be at least 2 characters long'),
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('language')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Language must be at least 2 characters long'),
  body('duration')
    .isFloat({ min: 0.5 })
    .withMessage('Duration must be at least 0.5 hours'),
  body('assessment')
    .optional()
    .isBoolean()
    .withMessage('Assessment must be a boolean value'),
  body('lecturers')
    .isInt({ min: 1 })
    .withMessage('Number of lecturers must be at least 1'),
  body('quota')
    .isInt({ min: 1 })
    .withMessage('Quota must be at least 1'),
  body('level')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Level must be at least 2 characters long'),
  body('location')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Location must be at least 3 characters long'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('status')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Status must be at least 2 characters long'),
];

export const updateEventValidator = [
  body('category')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Category must be at least 2 characters long'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('language')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Language must be at least 2 characters long'),
  body('duration')
    .optional()
    .isFloat({ min: 0.5 })
    .withMessage('Duration must be at least 0.5 hours'),
  body('assessment')
    .optional()
    .isBoolean()
    .withMessage('Assessment must be a boolean value'),
  body('lecturers')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Number of lecturers must be at least 1'),
  body('quota')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quota must be at least 1'),
  body('level')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Level must be at least 2 characters long'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Location must be at least 3 characters long'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('status')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Status must be at least 2 characters long'),
];
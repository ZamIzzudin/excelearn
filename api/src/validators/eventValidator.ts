import { body } from 'express-validator';

export const createEventValidator = [
  body('title')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  body('description')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('location')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Location must be at least 3 characters long'),
  body('max_participants')
    .isInt({ min: 1 })
    .withMessage('Max participants must be a positive integer'),
];

export const updateEventValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Title must be at least 3 characters long'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters long'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide a valid time in HH:MM format'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage('Location must be at least 3 characters long'),
  body('max_participants')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max participants must be a positive integer'),
];
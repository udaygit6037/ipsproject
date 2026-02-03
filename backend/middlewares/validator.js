/**
 * Input Validation Middleware
 * Validates and sanitizes request data
 */

import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Middleware to handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// Validation rules for authentication
export const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
    .isLength({ max: 100 }).withMessage('Email must be less than 100 characters'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['student', 'counsellor', 'admin']).withMessage('Invalid role'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/).withMessage('Invalid phone number format'),
  
  body('studentId')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Student ID must be less than 20 characters'),
  
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Department must be less than 100 characters'),
  
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

// Validation rules for bookings
export const validateBooking = [
  body('counsellorId')
    .notEmpty().withMessage('Counsellor ID is required')
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid counsellor ID format');
      }
      return true;
    }),
  
  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    }),
  
  body('timeSlot.startTime')
    .notEmpty().withMessage('Start time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  
  body('timeSlot.endTime')
    .notEmpty().withMessage('End time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  
  body('concern')
    .trim()
    .notEmpty().withMessage('Concern description is required')
    .isLength({ min: 10, max: 500 }).withMessage('Concern must be between 10 and 500 characters'),
  
  body('sessionType')
    .optional()
    .isIn(['individual', 'group', 'emergency']).withMessage('Invalid session type'),
  
  handleValidationErrors
];

// Validation rules for forum posts
export const validateForumPost = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ min: 20, max: 2000 }).withMessage('Content must be between 20 and 2000 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['general', 'anxiety', 'depression', 'stress', 'relationships', 'academic', 'other']).withMessage('Invalid category'),
  
  body('isAnonymous')
    .optional()
    .isBoolean().withMessage('isAnonymous must be a boolean'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error('Maximum 10 tags allowed');
      }
      return true;
    }),
  
  handleValidationErrors
];

// Validation rules for resources
export const validateResource = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['article', 'video', 'podcast', 'exercise', 'guide', 'other']).withMessage('Invalid category'),
  
  body('tags')
    .optional()
    .isString().withMessage('Tags must be a comma-separated string'),
  
  body('url')
    .optional()
    .isURL().withMessage('URL must be a valid URL'),
  
  handleValidationErrors
];

// Validation for MongoDB ObjectId params
export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .notEmpty().withMessage(`${paramName} is required`)
    .custom((value) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error(`Invalid ${paramName} format`);
      }
      return true;
    }),
  handleValidationErrors
];

// Sanitize input to prevent NoSQL injection
export const sanitizeInput = (req, res, next) => {
  // Remove $ and . from object keys to prevent NoSQL injection
  const sanitize = (obj) => {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = key.replace(/[$.]/g, '');
      sanitized[sanitizedKey] = sanitize(value);
    }
    return sanitized;
  };
  
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }
  
  next();
};

export default {
  validateRegister,
  validateLogin,
  validateBooking,
  validateForumPost,
  validateResource,
  validateObjectId,
  sanitizeInput,
  handleValidationErrors
};


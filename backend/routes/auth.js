import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  resetPasswordByEmail
} from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);

router.post('/login', login);

// Simple password reset (demo): reset by email and new password
router.post('/forgot-password', resetPasswordByEmail);

router.get('/profile', authenticate, getProfile);

router.put('/profile', authenticate, updateProfile);

export default router;

/**
 * Chat Routes
 * Handles AI chatbot endpoints
 */

import express from 'express';
import { sendMessage, healthCheck } from '../controllers/chatController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Health check endpoint (public)
router.get('/health', healthCheck);

// Chat message endpoint (requires authentication)
router.post('/message', authenticate, sendMessage);

export default router;


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import bookingRoutes from './routes/bookings.js';
import resourceRoutes from './routes/resources.js';
import forumRoutes from './routes/forum.js';
import adminRoutes from './routes/admin.js';
import chatRoutes from './routes/chat.js';

// Security and validation middleware
import { securityMiddleware } from './middlewares/security.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { sanitizeInput } from './middlewares/validator.js';
import { errorHandler } from './utils/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware - must be first
app.use(securityMiddleware);

// CORS configuration - restrict to specific origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Anonymous-Id']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization - prevent NoSQL injection
app.use(sanitizeInput);

// Rate limiting - apply to all routes
app.use('/api', apiLimiter);

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.json({
    message: 'Digital Psychological Intervention System API',
    version: '1.0.0',
    status: 'running'
  });
});

// --- API Route Middleware ---
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);

// Centralized error handling - must be last middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
});
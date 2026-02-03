import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const anonymousId = req.header('X-Anonymous-Id');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');

      if (user && user.isActive) {
        req.user = user;
        req.userId = decoded.userId;
      }
    } else if (anonymousId) {
      req.anonymousId = anonymousId;
    }
    next();
  } catch (error) {
    // If token is invalid or expired, clear user and proceed anonymously if possible
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      console.warn('Invalid or expired token, proceeding without authenticated user.');
      // If there's an anonymousId, let it pass for now.
      if (req.header('X-Anonymous-Id')) {
        req.anonymousId = req.header('X-Anonymous-Id');
        return next();
      }
    }
    next(); // Proceed without authentication or anonymousId if errors
  }
};

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. User not found.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact admin.'
      });
    }

    req.user = user;
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed.',
      error: error.message
    });
  }
};

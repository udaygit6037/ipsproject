/**
 * Token Utility Functions
 * Handles JWT token generation and refresh token management
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';

// Generate access token (short-lived)
export const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
  );
};

// Generate refresh token (long-lived)
export const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

// Save refresh token to database
export const saveRefreshToken = async (token, userId, req) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS || '30'));

  const refreshToken = new RefreshToken({
    token,
    userId,
    expiresAt,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  });

  await refreshToken.save();
  return refreshToken;
};

// Verify and get refresh token
export const verifyRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({ token });
  
  if (!refreshToken) {
    throw new Error('Invalid refresh token');
  }

  if (!refreshToken.isValid()) {
    throw new Error('Refresh token expired or revoked');
  }

  return refreshToken;
};

// Revoke refresh token
export const revokeRefreshToken = async (token) => {
  const refreshToken = await RefreshToken.findOne({ token });
  
  if (refreshToken && refreshToken.isValid()) {
    refreshToken.revokedAt = new Date();
    await refreshToken.save();
  }
};

// Revoke all refresh tokens for a user
export const revokeAllUserTokens = async (userId) => {
  await RefreshToken.updateMany(
    { userId, revokedAt: null },
    { revokedAt: new Date() }
  );
};

export default {
  generateAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens
};


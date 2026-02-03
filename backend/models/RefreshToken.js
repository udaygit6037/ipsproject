/**
 * Refresh Token Model
 * Stores refresh tokens for token rotation
 */

import mongoose from 'mongoose';

const refreshTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // Auto-delete expired tokens
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  revokedAt: {
    type: Date,
    default: null
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
});

// Index for efficient lookups
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });

// Method to check if token is valid
refreshTokenSchema.methods.isValid = function() {
  return !this.revokedAt && this.expiresAt > new Date();
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

export default RefreshToken;


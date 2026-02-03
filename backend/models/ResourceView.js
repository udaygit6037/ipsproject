/**
 * Resource View Model
 * Tracks which users have viewed/read which resources
 */

import mongoose from 'mongoose';

const resourceViewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true,
    index: true
  },
  viewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one view per user per resource (for counting)
resourceViewSchema.index({ user: 1, resource: 1 }, { unique: true });

const ResourceView = mongoose.model('ResourceView', resourceViewSchema);

export default ResourceView;


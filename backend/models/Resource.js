import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Resource title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },

  description: {
    type: String,
    required: [true, 'Resource description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },

  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['article', 'video', 'podcast', 'exercise', 'guide', 'other']
  },

  tags: [{
    type: String,
    trim: true
  }],

  url: {
    type: String,
    trim: true
  },

  // File upload fields for Cloudinary
  fileUrl: {
    type: String,
    trim: true
  },

  fileType: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'pdf']
  },

  fileSize: {
    type: Number // in bytes
  },

  fileName: {
    type: String,
    trim: true
  },

  cloudinaryId: {
    type: String,
    trim: true
  },

  content: {
    type: String
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  isPublished: {
    type: Boolean,
    default: true
  },

  views: {
    type: Number,
    default: 0
  },

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

resourceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Resource = mongoose.model('Resource', resourceSchema);

export default Resource;

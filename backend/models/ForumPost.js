import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const forumPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Post title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },

  content: {
    type: String,
    required: [true, 'Post content is required'],
    maxlength: [2000, 'Content cannot exceed 2000 characters']
  },

  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  category: {
    type: String,
    required: true,
    enum: ['general', 'anxiety', 'depression', 'stress', 'relationships', 'academic', 'other']
  },

  isAnonymous: {
    type: Boolean,
    default: false
  },

  tags: [{
    type: String,
    trim: true
  }],

  comments: [commentSchema],

  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  isApproved: {
    type: Boolean,
    default: true
  },

  isPinned: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

forumPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const ForumPost = mongoose.model('ForumPost', forumPostSchema);

export default ForumPost;

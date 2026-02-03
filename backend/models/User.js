import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  role: {
    type: String,
    enum: ['student', 'counsellor', 'admin'],
    default: 'student'
  },

  phoneNumber: {
    type: String,
    trim: true
  },

  studentId: {
    type: String,
    sparse: true
  },

  department: {
    type: String,
    trim: true
  },

  specialization: {
    type: String,
    trim: true
  },

  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],

  isActive: {
    type: Boolean,
    default: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
userSchema.index({ email: 1 }); // Already unique, but explicit index
userSchema.index({ role: 1, isActive: 1 }); // For role-based queries
userSchema.index({ studentId: 1 }, { sparse: true }); // For student lookups
userSchema.index({ createdAt: -1 }); // For sorting by creation date

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

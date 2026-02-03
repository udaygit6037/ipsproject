import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student reference is required']
  },

  counsellor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Counsellor reference is required']
  },

  date: {
    type: Date,
    required: [true, 'Appointment date is required']
  },

  timeSlot: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },

  concern: {
    type: String,
    required: [true, 'Please describe your concern'],
    maxlength: [500, 'Concern description cannot exceed 500 characters']
  },

  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },

  sessionType: {
    type: String,
    enum: ['individual', 'group', 'emergency'],
    default: 'individual'
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

// Indexes for performance
bookingSchema.index({ student: 1, createdAt: -1 }); // Student bookings query
bookingSchema.index({ counsellor: 1, date: 1 }); // Counsellor availability check
bookingSchema.index({ counsellor: 1, date: 1, 'timeSlot.startTime': 1, status: 1 }); // Duplicate booking check
bookingSchema.index({ status: 1, createdAt: -1 }); // Status-based queries
bookingSchema.index({ date: 1 }); // Date-based queries

bookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;

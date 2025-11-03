import Booking from '../models/Booking.js';
import User from '../models/User.js';

export const createBooking = async (req, res) => {
  try {
    const { counsellorId, date, timeSlot, concern, sessionType } = req.body;

    if (!counsellorId || !date || !timeSlot || !concern) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const counsellor = await User.findById(counsellorId);
    if (!counsellor || counsellor.role !== 'counsellor') {
      return res.status(404).json({
        success: false,
        message: 'Counsellor not found'
      });
    }

    const existingBooking = await Booking.findOne({
      counsellor: counsellorId,
      date,
      'timeSlot.startTime': timeSlot.startTime,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    const booking = new Booking({
      student: req.userId,
      counsellor: counsellorId,
      date,
      timeSlot,
      concern,
      sessionType: sessionType || 'individual'
    });

    await booking.save();
    await booking.populate('student', 'name email');
    await booking.populate('counsellor', 'name email specialization');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const query = req.user.role === 'student'
      ? { student: req.userId }
      : { counsellor: req.userId };

    const bookings = await Booking.find(query)
      .populate('student', 'name email studentId')
      .populate('counsellor', 'name email specialization')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: { bookings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('student', 'name email studentId phoneNumber')
      .populate('counsellor', 'name email specialization phoneNumber');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (
      booking.student._id.toString() !== req.userId &&
      booking.counsellor._id.toString() !== req.userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (
      booking.counsellor.toString() !== req.userId &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned counsellor or admin can update booking status'
      });
    }

    if (status) booking.status = status;
    if (notes) booking.notes = notes;

    await booking.save();
    await booking.populate('student', 'name email');
    await booking.populate('counsellor', 'name email specialization');

    res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.student.toString() !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the student who made the booking or admin can cancel it'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed booking'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};

export const getAllCounsellors = async (req, res) => {
  try {
    const counsellors = await User.find({
      role: 'counsellor',
      isActive: true
    }).select('-password');

    res.status(200).json({
      success: true,
      count: counsellors.length,
      data: { counsellors }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch counsellors',
      error: error.message
    });
  }
};

import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllCounsellors
} from '../controllers/bookingController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/', authenticate, authorizeRoles('student'), createBooking);

router.get('/my-bookings', authenticate, getMyBookings);

router.get('/counsellors', authenticate, getAllCounsellors);

router.get('/:id', authenticate, getBookingById);

router.put('/:id/status', authenticate, authorizeRoles('counsellor', 'admin'), updateBookingStatus);

router.put('/:id/cancel', authenticate, cancelBooking);

export default router;

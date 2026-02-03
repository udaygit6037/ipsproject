import express from 'express';
import {
  getDashboardStats,
  getEnhancedStats,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getAllBookings,
  approveForumPost,
  pinForumPost,
  getUserGrowth,
  getTopCounsellors,
  getRecentActivity
} from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorizeRoles } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/stats', getDashboardStats);
router.get('/stats/enhanced', getEnhancedStats);
router.get('/analytics/user-growth', getUserGrowth);
router.get('/analytics/top-counsellors', getTopCounsellors);
router.get('/analytics/recent-activity', getRecentActivity);

router.get('/users', getAllUsers);

router.get('/users/:id', getUserById);

router.put('/users/:id', updateUser);

router.delete('/users/:id', deleteUser);

router.get('/bookings', getAllBookings);

router.put('/forum/:id/approve', approveForumPost);

router.put('/forum/:id/pin', pinForumPost);

export default router;

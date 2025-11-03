import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Resource from '../models/Resource.js';
import ForumPost from '../models/ForumPost.js';

export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCounsellors = await User.countDocuments({ role: 'counsellor' });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const totalResources = await Resource.countDocuments();
    const totalForumPosts = await ForumPost.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCounsellors,
          totalBookings,
          pendingBookings,
          totalResources,
          totalForumPosts
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role, isActive } = req.query;

    const query = {};
    if (role) query.role = role;
    if (typeof isActive !== 'undefined') query.isActive = isActive === 'true';

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, isActive, phoneNumber, department, specialization } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive !== 'undefined') updateData.isActive = isActive;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (department) updateData.department = department;
    if (specialization) updateData.specialization = specialization;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;

    const query = {};
    if (status) query.status = status;

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

export const approveForumPost = async (req, res) => {
  try {
    const { isApproved } = req.body;

    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Post ${isApproved ? 'approved' : 'rejected'} successfully`,
      data: { post }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update post approval status',
      error: error.message
    });
  }
};

export const pinForumPost = async (req, res) => {
  try {
    const { isPinned } = req.body;

    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { isPinned },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Post ${isPinned ? 'pinned' : 'unpinned'} successfully`,
      data: { post }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update post pin status',
      error: error.message
    });
  }
};

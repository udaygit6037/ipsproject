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

// Get user growth data (monthly for last 6 months)
export const getUserGrowth = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const students = await User.find({ role: 'student', createdAt: { $gte: sixMonthsAgo } })
      .select('createdAt')
      .sort({ createdAt: 1 });
    
    const counsellors = await User.find({ role: 'counsellor', createdAt: { $gte: sixMonthsAgo } })
      .select('createdAt')
      .sort({ createdAt: 1 });

    // Group by month
    const monthlyData = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${monthNames[date.getMonth()]}`;
      monthlyData[monthKey] = { month: monthKey, students: 0, counsellors: 0 };
    }

    // Count students by month
    students.forEach(student => {
      const month = monthNames[new Date(student.createdAt).getMonth()];
      if (monthlyData[month]) {
        monthlyData[month].students++;
      }
    });

    // Count counsellors by month
    counsellors.forEach(counsellor => {
      const month = monthNames[new Date(counsellor.createdAt).getMonth()];
      if (monthlyData[month]) {
        monthlyData[month].counsellors++;
      }
    });

    // Convert to array and calculate cumulative
    let cumulativeStudents = 0;
    let cumulativeCounsellors = 0;
    const growthData = Object.values(monthlyData).map(data => {
      cumulativeStudents += data.students;
      cumulativeCounsellors += data.counsellors;
      return {
        month: data.month,
        students: cumulativeStudents,
        counsellors: cumulativeCounsellors
      };
    });

    res.status(200).json({
      success: true,
      data: { growth: growthData }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user growth data',
      error: error.message
    });
  }
};

// Get top counsellors by session count
export const getTopCounsellors = async (req, res) => {
  try {
    const counsellors = await User.find({ role: 'counsellor', isActive: true })
      .select('name email specialization')
      .limit(10);

    // Get session counts for each counsellor
    const counsellorsWithStats = await Promise.all(
      counsellors.map(async (counsellor) => {
        const totalSessions = await Booking.countDocuments({ 
          counsellor: counsellor._id,
          status: { $in: ['completed', 'confirmed'] }
        });
        
        const completedSessions = await Booking.countDocuments({ 
          counsellor: counsellor._id,
          status: 'completed'
        });

        return {
          id: counsellor._id,
          name: counsellor.name,
          email: counsellor.email,
          specialization: counsellor.specialization || 'General Counseling',
          sessions: totalSessions,
          completedSessions: completedSessions,
          // Rating would come from a ratings system if implemented
          rating: 4.5 // Placeholder until rating system is implemented
        };
      })
    );

    // Sort by session count and return top 5
    const topCounsellors = counsellorsWithStats
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: { counsellors: topCounsellors }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch top counsellors',
      error: error.message
    });
  }
};

// Get recent activity
export const getRecentActivity = async (req, res) => {
  try {
    const activities = [];

    // Recent user registrations (last 7 days)
    const recentUsers = await User.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
      .select('name role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    recentUsers.forEach(user => {
      activities.push({
        type: 'user_registration',
        message: `New ${user.role} registered: ${user.name}`,
        timestamp: user.createdAt,
        severity: 'info'
      });
    });

    // Recent completed sessions (last 7 days)
    const recentBookings = await Booking.find({
      status: 'completed',
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    })
      .populate('student', 'name')
      .populate('counsellor', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);

    recentBookings.forEach(booking => {
      activities.push({
        type: 'session_completed',
        message: `Session completed: ${booking.student.name} with ${booking.counsellor.name}`,
        timestamp: booking.updatedAt,
        severity: 'success'
      });
    });

    // Sort by timestamp and return most recent
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: { activities: activities.slice(0, 10) }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activity',
      error: error.message
    });
  }
};

// Get enhanced dashboard stats
export const getEnhancedStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const totalCounsellors = await User.countDocuments({ role: 'counsellor', isActive: true });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const completedBookings = await Booking.countDocuments({ status: 'completed' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    const totalResources = await Resource.countDocuments({ isPublished: true });
    const totalForumPosts = await ForumPost.countDocuments({ isApproved: true });

    // Calculate completion rate
    const completionRate = totalBookings > 0 
      ? Math.round((completedBookings / totalBookings) * 100) 
      : 0;

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalCounsellors,
          totalBookings,
          pendingBookings,
          confirmedBookings,
          completedBookings,
          cancelledBookings,
          totalResources,
          totalForumPosts,
          completionRate
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enhanced stats',
      error: error.message
    });
  }
};

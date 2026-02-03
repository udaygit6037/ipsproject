/**
 * Analytics Page Component
 * Shows detailed analytics and reports for admins
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';
import api from '../utils/api.js';

const Analytics = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCounsellors: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalResources: 0,
    totalForumPosts: 0
  });
  const [bookingsByStatus, setBookingsByStatus] = useState([]);
  const [bookingsByMonth, setBookingsByMonth] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch enhanced dashboard stats
      const statsResponse = await api.get('/admin/stats/enhanced');
      const statsData = statsResponse.data.data.stats;
      setStats({
        totalStudents: statsData.totalStudents,
        totalCounsellors: statsData.totalCounsellors,
        totalBookings: statsData.totalBookings,
        pendingBookings: statsData.pendingBookings,
        completedBookings: statsData.completedBookings,
        totalResources: statsData.totalResources,
        totalForumPosts: statsData.totalForumPosts
      });

      // Fetch all bookings for analytics
      const bookingsResponse = await api.get('/admin/bookings');
      const { bookings } = bookingsResponse.data.data;

      // Calculate bookings by status
      const statusCounts = {
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length
      };
      setBookingsByStatus([
        { status: 'Pending', count: statusCounts.pending, color: 'bg-yellow-500' },
        { status: 'Confirmed', count: statusCounts.confirmed, color: 'bg-blue-500' },
        { status: 'Completed', count: statusCounts.completed, color: 'bg-green-500' },
        { status: 'Cancelled', count: statusCounts.cancelled, color: 'bg-gray-500' }
      ]);

      // Calculate bookings by month (last 6 months)
      const monthlyBookings = {};
      bookings.forEach(booking => {
        const month = new Date(booking.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyBookings[month] = (monthlyBookings[month] || 0) + 1;
      });
      const sortedMonths = Object.entries(monthlyBookings)
        .sort((a, b) => new Date(a[0]) - new Date(b[0]))
        .slice(-6);
      setBookingsByMonth(sortedMonths.map(([month, count]) => ({ month, count })));

      // Fetch user growth data from database
      const growthResponse = await api.get('/admin/analytics/user-growth');
      const growthData = growthResponse.data.data.growth;
      setUserGrowth(growthData);

    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const maxCount = Math.max(...bookingsByStatus.map(item => item.count), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
              <p className="text-gray-600 mt-2">
                Comprehensive insights into platform usage and performance.
              </p>
            </div>
            <button className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalStudents + stats.totalCounsellors}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalBookings > 0
                          ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Bookings by Status */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Bookings by Status</h2>
                  <div className="space-y-4">
                    {bookingsByStatus.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{item.status}</span>
                          <span className="text-sm font-bold text-gray-900">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`${item.color} h-2 rounded-full transition-all`}
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Bookings */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Monthly Bookings</h2>
                  <div className="space-y-4">
                    {bookingsByMonth.map((item, index) => (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{item.month}</span>
                          <span className="text-sm font-bold text-gray-900">{item.count}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                (item.count / Math.max(...bookingsByMonth.map(b => b.count), 1)) *
                                100
                              }%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Growth Chart */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">User Growth</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPeriod('week')}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        selectedPeriod === 'week'
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setSelectedPeriod('month')}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        selectedPeriod === 'month'
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {userGrowth.map((data, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-12 text-sm text-gray-600">{data.month}</div>
                      <div className="flex-1 flex space-x-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Students</span>
                            <span className="text-xs font-medium">{data.students}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(data.students / 300) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Counsellors</span>
                            <span className="text-xs font-medium">{data.counsellors}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(data.counsellors / 25) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Resources</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalResources}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Forum Posts</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalForumPosts}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active Counsellors</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalCounsellors}</p>
                    </div>
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;


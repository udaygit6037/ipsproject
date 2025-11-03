/**
 * Admin Dashboard Component
 * Main dashboard for admin users with system overview and management tools
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Settings,
  Shield
} from 'lucide-react';
import api from '../utils/api.js';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeStudents: 0,
    activeCounsellors: 0,
    totalSessions: 0,
    completionRate: 0,
    avgRating: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [topCounsellors, setTopCounsellors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Load dashboard data on component mount
   */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats
        const statsResponse = await api.get('/admin/stats');
        const statsData = statsResponse.data.data.stats;
        
        setStats({
          totalUsers: statsData.totalStudents + statsData.totalCounsellors,
          activeStudents: statsData.totalStudents,
          activeCounsellors: statsData.totalCounsellors,
          totalSessions: statsData.totalBookings,
          completionRate: statsData.totalBookings > 0 ? 
            Math.round(((statsData.totalBookings - statsData.pendingBookings) / statsData.totalBookings) * 100) : 0,
          avgRating: 4.6 // This would need to be calculated from actual ratings
        });

        // Fetch all users for counsellor stats
        const usersResponse = await api.get('/admin/users');
        const users = usersResponse.data.data.users;
        const counsellors = users.filter(u => u.role === 'counsellor');
        
        // Mock top counsellors data (would need actual session/rating data)
        setTopCounsellors(counsellors.slice(0, 3).map(counsellor => ({
          id: counsellor._id,
          name: counsellor.name,
          avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150',
          sessions: Math.floor(Math.random() * 100) + 50, // Mock data
          rating: 4.5 + Math.random() * 0.5, // Mock data
          specialization: counsellor.specialization || 'General Counseling'
        })));

        // Mock recent activity (would need actual activity logs)
        setRecentActivity([
          {
            id: 1,
            type: 'user_registration',
            message: `New student registered: ${users.filter(u => u.role === 'student').length} total students`,
            timestamp: new Date().toISOString(),
            severity: 'info'
          },
          {
            id: 2,
            type: 'session_completed',
            message: `${statsData.totalBookings - statsData.pendingBookings} sessions completed today`,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            severity: 'success'
          },
          {
            id: 3,
            type: 'counsellor_joined',
            message: `${statsData.totalCounsellors} active counsellors`,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            severity: 'success'
          }
        ]);

        // Mock user growth data (would need historical data)
        setUserGrowth([
          { month: 'Jan', students: Math.floor(statsData.totalStudents * 0.1), counsellors: Math.floor(statsData.totalCounsellors * 0.2) },
          { month: 'Feb', students: Math.floor(statsData.totalStudents * 0.2), counsellors: Math.floor(statsData.totalCounsellors * 0.4) },
          { month: 'Mar', students: Math.floor(statsData.totalStudents * 0.3), counsellors: Math.floor(statsData.totalCounsellors * 0.6) },
          { month: 'Apr', students: Math.floor(statsData.totalStudents * 0.5), counsellors: Math.floor(statsData.totalCounsellors * 0.8) },
          { month: 'May', students: Math.floor(statsData.totalStudents * 0.7), counsellors: Math.floor(statsData.totalCounsellors * 0.9) },
          { month: 'Jun', students: statsData.totalStudents, counsellors: statsData.totalCounsellors }
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  /**
   * Get activity severity styling
   */
  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'info':
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  /**
   * Get activity icon
   */
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_registration':
        return Users;
      case 'session_completed':
        return CheckCircle;
      case 'urgent_case':
        return AlertTriangle;
      case 'counsellor_joined':
        return UserCheck;
      case 'system_alert':
        return Settings;
      default:
        return Clock;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              System Overview
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage the Digital Psychological Intervention platform.
            </p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="flex items-center">
                      <div className="p-3 bg-gray-200 rounded-full"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <UserCheck className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Counsellors</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeCounsellors}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-teal-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completion</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgRating}/5</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Charts and Analytics */}
            <div className="lg:col-span-2 space-y-8">
              {/* User Growth Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">User Growth</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedPeriod('week')}
                      className={`px-3 py-1 rounded-lg text-sm ${selectedPeriod === 'week'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setSelectedPeriod('month')}
                      className={`px-3 py-1 rounded-lg text-sm ${selectedPeriod === 'month'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      Month
                    </button>
                  </div>
                </div>

                {/* Simple Bar Chart Representation */}
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

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className={`border rounded-lg p-4 ${getSeverityStyles(activity.severity)}`}>
                        <div className="flex items-start space-x-3">
                          <Icon className="w-5 h-5 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.message}</p>
                            <p className="text-xs mt-1 opacity-75">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column - Top Performers and Quick Actions */}
            <div className="space-y-8">
              {/* Top Counsellors */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Top Counsellors</h2>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {topCounsellors.map((counsellor, index) => (
                    <div key={counsellor.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
                        <img
                          src={counsellor.avatar}
                          alt={counsellor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{counsellor.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{counsellor.specialization}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                          <span>{counsellor.sessions} sessions</span>
                          <span>•</span>
                          <span>⭐ {counsellor.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Server Status</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Database</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">API Response</span>
                    </div>
                    <span className="text-sm font-medium text-yellow-600">245ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Uptime</span>
                    </div>
                    <span className="text-sm font-medium text-green-600">99.9%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors">
                    <Users className="w-4 h-4" />
                    <span>Manage Users</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                    <UserCheck className="w-4 h-4" />
                    <span>Approve Counsellors</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                    <BarChart3 className="w-4 h-4" />
                    <span>View Analytics</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <Settings className="w-4 h-4" />
                    <span>System Settings</span>
                  </button>
                </div>
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

export default AdminDashboard;
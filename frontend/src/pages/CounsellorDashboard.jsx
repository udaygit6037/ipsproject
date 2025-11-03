/**
 * Counsellor Dashboard Component
 * Main dashboard for counsellor users with session management and student overview
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import {
  Calendar,
  Users,
  Clock,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  Video,
  Phone
} from 'lucide-react';
import api from '../utils/api.js';

const CounsellorDashboard = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [stats, setStats] = useState({
    todaySessions: 0,
    totalStudents: 0,
    completedSessions: 0,
    avgRating: 0
  });
  const [todaySessions, setTodaySessions] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
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

        // Fetch today's bookings
        const today = new Date().toISOString().split('T')[0];
        const bookingsResponse = await api.get(`/bookings/my-bookings?date=${today}`);
        const bookings = bookingsResponse.data.data.bookings;
        
        setTodaySessions(bookings);
        setStats(prev => ({
          ...prev,
          todaySessions: bookings.length,
          completedSessions: bookings.filter(b => b.status === 'completed').length
        }));

        // Fetch all students (unique students from bookings)
        const allBookingsResponse = await api.get('/bookings/my-bookings');
        const allBookings = allBookingsResponse.data.data.bookings;
        const uniqueStudents = [...new Set(allBookings.map(booking => booking.student._id))]
          .map(studentId => {
            const booking = allBookings.find(b => b.student._id === studentId);
            return booking.student;
          });
        
        setRecentStudents(uniqueStudents.slice(0, 4)); // Show only recent 4
        setStats(prev => ({
          ...prev,
          totalStudents: uniqueStudents.length
        }));

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
   * Get status styling for sessions
   */
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get risk level styling
   */
  const getRiskStyles = (level) => {
    switch (level) {
      case 'Low':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'High':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              Good morning, {user?.name}
            </h1>
            <p className="text-gray-600 mt-2">
              You have {todaySessions.filter(s => s.status === 'upcoming').length} sessions scheduled for today.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.todaySessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.avgRating}/5</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Sessions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm">
                      Today
                    </button>
                    <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
                      Week
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {todaySessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 font-medium text-sm">
                              {session.student.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{session.student}</h3>
                            <p className="text-sm text-gray-600">{session.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">{session.time}</span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyles(session.status)}`}>
                            {session.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Duration: {session.duration}</span>
                          {session.status === 'urgent' && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Urgent</span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {session.status === 'upcoming' && (
                            <>
                              <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors">
                                <Video className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-green-600 transition-colors">
                                <Phone className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <MessageSquare className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {session.notes && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">{session.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Students & Quick Actions */}
            <div className="space-y-8">
              {/* Recent Students */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Students</h2>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{student.name}</h3>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>Last: {new Date(student.lastSession).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{student.totalSessions} sessions</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskStyles(student.riskLevel)}`}>
                          {student.riskLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span>Schedule Session</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                    <Users className="w-4 h-4" />
                    <span>Add New Student</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>

              {/* Today's Summary */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed Sessions</span>
                    <span className="font-medium text-gray-900">
                      {todaySessions.filter(s => s.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Remaining Sessions</span>
                    <span className="font-medium text-gray-900">
                      {todaySessions.filter(s => s.status === 'upcoming').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Urgent Cases</span>
                    <span className="font-medium text-red-600">
                      {todaySessions.filter(s => s.status === 'urgent').length}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Hours Today</span>
                      <span className="font-medium text-gray-900">6.5 hrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounsellorDashboard;
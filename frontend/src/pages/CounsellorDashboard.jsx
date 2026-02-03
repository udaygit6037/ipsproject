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
  Phone,
  Loader2, // Added for loading state
  WifiOff // Added for error state
} from 'lucide-react';
import api from '../utils/api.js';

const CounsellorDashboard = () => {
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [stats, setStats] = useState({
    todaySessions: 0,
    totalStudents: 0,
    completedSessions: 0,
    avgRating: 4.5 // Initialized to a default value until real data is fetched
  });
  const [todaySessions, setTodaySessions] = useState([]);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

      /**
       * Load dashboard data on component mount
       */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch bookings for this counsellor
        const bookingsResponse = await api.get('/bookings/my-bookings');
        const { bookings } = bookingsResponse.data.data;
        
        // Helper function to enrich student data with real booking statistics
        const enrichStudentData = (student) => {
          const studentBookings = bookings.filter(b => 
            (typeof b.student === 'object' && b.student._id === student._id) ||
            (typeof b.student === 'string' && b.student === student._id)
          );
          const lastBooking = studentBookings.length > 0
            ? studentBookings.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
            : null;
          
          // Determine risk level based on session frequency
          const recentBookings = studentBookings.filter(b => {
            const bookingDate = new Date(b.date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return bookingDate >= thirtyDaysAgo;
          });
          
          let riskLevel = 'Low';
          if (recentBookings.length > 5) {
            riskLevel = 'High';
          } else if (recentBookings.length > 2) {
            riskLevel = 'Medium';
          }
          
          return {
            ...student,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`,
            lastSession: lastBooking ? lastBooking.date : null,
            totalSessions: studentBookings.length,
            riskLevel: riskLevel
          };
        };

        // Filter "today" on the frontend since the API doesn't support a date query
        const todayDateOnly = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter(booking => {
          const bookingDateOnly = new Date(booking.date).toISOString().split('T')[0];
          return bookingDateOnly === todayDateOnly;
        });

        // Normalise bookings into the shape the UI expects
        const enrichedTodaySessions = todayBookings.map(booking => ({
          ...booking,
          time:
            booking.timeSlot?.startTime ||
            new Date(booking.date).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }),
          type: booking.sessionType || 'Counseling Session',
          duration: booking.duration || '60 mins',
          status: booking.status || 'pending'
        }));

        setTodaySessions(enrichedTodaySessions);
        setStats(prev => ({
          ...prev,
          todaySessions: todayBookings.length,
          completedSessions: todayBookings.filter(b => b.status === 'completed').length
        }));

        // 2. Build unique students list from *all* bookings
        const allBookings = bookings;

        const uniqueStudentsMap = new Map();
        allBookings.forEach(booking => {
          const studentId = typeof booking.student === 'object' ? booking.student._id : booking.student;
          const studentData = typeof booking.student === 'object' ? booking.student : { _id: booking.student, name: 'Student' };
          if (!uniqueStudentsMap.has(studentId)) {
            uniqueStudentsMap.set(studentId, studentData);
          }
        });
        
        const uniqueStudents = Array.from(uniqueStudentsMap.values());
        
        // Enrich student data with real booking statistics
        const enrichedRecentStudents = uniqueStudents
          .slice(0, 4) // Show only recent 4
          .map(student => enrichStudentData(student));
        
        setRecentStudents(enrichedRecentStudents);
        setStats(prev => ({
          ...prev,
          totalStudents: uniqueStudents.length,
          avgRating: 4.5 // Placeholder until dedicated rating API is implemented
        }));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please ensure the API is running.');
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
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
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

  /**
   * Handle updating booking status
   */
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingStatus(bookingId);
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      
      // Refresh dashboard data
      const bookingsResponse = await api.get('/bookings/my-bookings');
      const { bookings } = bookingsResponse.data.data;

      const todayDateOnly = new Date().toISOString().split('T')[0];
      const todayBookings = bookings.filter(booking => {
        const bookingDateOnly = new Date(booking.date).toISOString().split('T')[0];
        return bookingDateOnly === todayDateOnly;
      });

      const enrichedTodaySessions = todayBookings.map(booking => ({
        ...booking,
        time:
          booking.timeSlot?.startTime ||
          new Date(booking.date).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
        type: booking.sessionType || 'Counseling Session',
        duration: booking.duration || '60 mins',
        status: booking.status || 'upcoming'
      }));

      setTodaySessions(enrichedTodaySessions);
      setStats(prev => ({
        ...prev,
        todaySessions: todayBookings.length,
        completedSessions: todayBookings.filter(b => b.status === 'completed').length
      }));
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert(error.response?.data?.message || 'Failed to update booking status');
    } finally {
      setUpdatingStatus(null);
    }
  };
  
  // NOTE: The previous console.log statements that referenced 'session' were removed as they caused errors.

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
        <p className="ml-3 text-lg font-medium text-gray-700">Loading Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-8">
        <WifiOff className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-800">Error Loading Data</h2>
        <p className="text-red-700 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        {/* Adjusted ml-64 to match standard sidebar layout assuming Sidebar is fixed width */}
        <Sidebar /> 
        
        {/* Main Content */}
        <div className="flex-1 ml-64 p-8"> 
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Good morning, {user?.name || 'Counsellor'}
            </h1>
            <p className="text-gray-600 mt-2">
              You have{' '}
              <span className="font-semibold">
                {todaySessions.filter(s => ['pending', 'confirmed'].includes(s.status)).length}
              </span>{' '}
              sessions scheduled for today.
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
                  {todaySessions.length === 0 ? (
                    <p className="text-gray-500 italic">No sessions scheduled for today. Enjoy your day!</p>
                  ) : (
                    todaySessions.map((session) => (
                      <div key={session._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 font-medium text-sm">
                                {(() => {
                                  const student = session.student;
                                  const fullName =
                                    typeof student === 'string'
                                      ? student
                                      : student?.name || 'Student';
                                  return fullName
                                    .split(' ')
                                    .filter(Boolean)
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase();
                                })()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {typeof session.student === 'string'
                                  ? session.student
                                  : session.student?.name || 'Student'}
                              </h3>
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
                            {session.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(session._id, 'confirmed')}
                                disabled={updatingStatus === session._id}
                                className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                title="Confirm Session"
                              >
                                {updatingStatus === session._id ? 'Updating...' : 'Confirm'}
                              </button>
                            )}
                            {(session.status === 'pending' || session.status === 'confirmed') && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(session._id, 'completed')}
                                  disabled={updatingStatus === session._id}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                  title="Mark as Completed"
                                >
                                  {updatingStatus === session._id ? 'Updating...' : 'Complete'}
                                </button>
                                <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Start Video Call">
                                  <Video className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Start Audio Call">
                                  <Phone className="w-4 h-4" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Send Chat Message">
                                  <MessageSquare className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {session.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">**Note:** {session.notes}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Students & Quick Actions */}
            <div className="space-y-8">
              {/* Recent Students */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Recent Students</h2>
                  <button 
                    onClick={() => navigate('/students')}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentStudents.length === 0 ? (
                    <p className="text-gray-500 italic">No students seen yet.</p>
                  ) : (
                    recentStudents.map((student) => (
                      <div key={student._id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <img
                          // Using student.avatar now works due to the fix in useEffect
                          src={student.avatar}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{student.name}</h3>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>Last: {student.lastSession ? new Date(student.lastSession).toLocaleDateString() : 'N/A'}</span>
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
                    ))
                  )}
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
                      {todaySessions.filter(s => s.status === 'confirmed').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Urgent Cases</span>
                    <span className="font-medium text-red-600">
                      {todaySessions.filter(s => s.status === 'pending').length}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Hours Today</span>
                    <span className="font-medium text-gray-900">
                      {(() => {
                        // Calculate total hours from today's sessions (assuming 1 hour per session)
                        const totalHours = todaySessions.length;
                        return `${totalHours} ${totalHours === 1 ? 'hr' : 'hrs'}`;
                      })()}
                    </span>
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
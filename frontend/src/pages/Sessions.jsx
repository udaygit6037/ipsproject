/**
 * Sessions Page Component
 * Shows all sessions for counsellors with filtering and management options
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import {
  Calendar,
  Clock,
  User,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search
} from 'lucide-react';
import api from '../utils/api.js';

const Sessions = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, statusFilter, dateFilter, searchTerm]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/bookings/my-bookings');
      const { bookings: fetchedBookings } = response.data.data;
      setBookings(fetchedBookings);
      setFilteredBookings(fetchedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load sessions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by date
    if (dateFilter === 'today') {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        return bookingDate === today;
      });
    } else if (dateFilter === 'upcoming') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(booking => new Date(booking.date) >= today);
    } else if (dateFilter === 'past') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(booking => new Date(booking.date) < today);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(booking => {
        const studentName = booking.student?.name || '';
        const concern = booking.concern || '';
        return (
          studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          concern.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredBookings(filtered);
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      setUpdatingStatus(bookingId);
      await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      await fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert(error.response?.data?.message || 'Failed to update booking status');
    } finally {
      setUpdatingStatus(null);
    }
  };

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'confirmed':
        return CheckCircle;
      case 'pending':
        return AlertCircle;
      case 'cancelled':
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Sessions</h1>
            <p className="text-gray-600 mt-2">
              Manage and view all your counseling sessions.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by student name or concern..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="upcoming">Upcoming</option>
                <option value="past">Past</option>
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const StatusIcon = getStatusIcon(booking.status);
                return (
                  <div
                    key={booking._id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-primary-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.student?.name || 'Student'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {booking.student?.email || ''}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(booking.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>
                              {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">Concern:</p>
                          <p className="text-sm text-gray-600">{booking.concern}</p>
                        </div>

                        {booking.notes && (
                          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                            <p className="text-sm text-gray-600">{booking.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusStyles(
                              booking.status
                            )}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span className="capitalize">{booking.status}</span>
                          </span>
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium capitalize">
                            {booking.sessionType}
                          </span>
                        </div>
                      </div>

                      <div className="ml-4 flex flex-col space-y-2">
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(booking._id, 'confirmed')}
                            disabled={updatingStatus === booking._id}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                          >
                            {updatingStatus === booking._id ? 'Updating...' : 'Confirm'}
                          </button>
                        )}
                        {(booking.status === 'pending' || booking.status === 'confirmed') && (
                          <button
                            onClick={() => handleUpdateStatus(booking._id, 'completed')}
                            disabled={updatingStatus === booking._id}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                          >
                            {updatingStatus === booking._id ? 'Updating...' : 'Mark Complete'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your filters to see more sessions.'
                  : "You don't have any sessions yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;


/**
 * Students Page Component
 * Shows all students that a counsellor has worked with
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import {
  Users,
  User,
  Calendar,
  Mail,
  Phone,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import api from '../utils/api.js';

const Students = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentBookings, setStudentBookings] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all bookings for this counsellor
      const bookingsResponse = await api.get('/bookings/my-bookings');
      const { bookings } = bookingsResponse.data.data;

      // Extract unique students
      const uniqueStudentsMap = new Map();
      bookings.forEach(booking => {
        if (booking.student && !uniqueStudentsMap.has(booking.student._id)) {
          uniqueStudentsMap.set(booking.student._id, {
            ...booking.student,
            totalSessions: 0,
            completedSessions: 0,
            pendingSessions: 0,
            lastSession: null
          });
        }
      });

      // Calculate session stats for each student
      bookings.forEach(booking => {
        const student = uniqueStudentsMap.get(booking.student._id);
        if (student) {
          student.totalSessions++;
          if (booking.status === 'completed') student.completedSessions++;
          if (booking.status === 'pending') student.pendingSessions++;
          if (!student.lastSession || new Date(booking.date) > new Date(student.lastSession)) {
            student.lastSession = booking.date;
          }
        }
      });

      const studentsList = Array.from(uniqueStudentsMap.values());
      setStudents(studentsList);
      setFilteredStudents(studentsList);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  };

  const fetchStudentBookings = async (studentId) => {
    try {
      const response = await api.get('/bookings/my-bookings');
      const { bookings } = response.data.data;
      const studentBookingsList = bookings.filter(
        booking => booking.student._id === studentId
      );
      setStudentBookings(studentBookingsList);
      setSelectedStudent(studentId);
    } catch (error) {
      console.error('Error fetching student bookings:', error);
    }
  };

  const getRiskLevel = (student) => {
    // Simple risk assessment based on pending sessions and total sessions
    if (student.pendingSessions > 2) return 'High';
    if (student.pendingSessions > 0 || student.totalSessions === 0) return 'Medium';
    return 'Low';
  };

  const getRiskStyles = (level) => {
    switch (level) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
            <p className="text-gray-600 mt-2">
              View and manage all students you're working with.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.filter(s => s.pendingSessions > 0 || s.totalSessions > 0).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {students.reduce((sum, s) => sum + s.pendingSessions, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search students by name, email, or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-full w-16 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => {
                const riskLevel = getRiskLevel(student);
                return (
                  <div
                    key={student._id}
                    className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => fetchStudentBookings(student._id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-600">{student.studentId || 'No ID'}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskStyles(
                          riskLevel
                        )}`}
                      >
                        {riskLevel}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      {student.phoneNumber && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{student.phoneNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Total Sessions</p>
                          <p className="font-semibold text-gray-900">{student.totalSessions}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Completed</p>
                          <p className="font-semibold text-green-600">
                            {student.completedSessions}
                          </p>
                        </div>
                      </div>
                      {student.lastSession && (
                        <div className="mt-3 flex items-center space-x-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Last session:{' '}
                            {new Date(student.lastSession).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
              <p className="text-gray-600">
                {searchTerm
                  ? 'Try adjusting your search terms.'
                  : "You don't have any students yet. Students will appear here once they book sessions with you."}
              </p>
            </div>
          )}

          {/* Student Details Modal */}
          {selectedStudent && studentBookings.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Student Sessions</h2>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentBookings([]);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3">
                  {studentBookings.map((booking) => (
                    <div key={booking._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(booking.date).toLocaleDateString()}
                          </span>
                          <Clock className="w-4 h-4 text-gray-400 ml-3" />
                          <span className="text-sm text-gray-600">
                            {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRiskStyles(
                            booking.status === 'pending' ? 'Medium' : 'Low'
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{booking.concern}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Students;


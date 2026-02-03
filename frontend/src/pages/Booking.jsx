/**
 * Booking Page Component
 * Allows students to book counseling sessions with available counsellors
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import BookingCard from '../components/BookingCard.jsx';
import { Search, Filter, Calendar, Clock, MapPin, Star } from 'lucide-react';
import api from '../utils/api.js';

const Booking = () => {
  const { user } = useAuth();
  const [counsellors, setCounsellors] = useState([]);
  const [filteredCounsellors, setFilteredCounsellors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    sessionType: 'individual',
    concern: ''
  });
  const [bookingError, setBookingError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const specializations = [
    { value: 'all', label: 'All Specializations' },
    { value: 'anxiety', label: 'Anxiety & Depression' },
    { value: 'academic', label: 'Academic Stress' },
    { value: 'relationships', label: 'Relationship Issues' },
    { value: 'trauma', label: 'Trauma & Crisis' },
    { value: 'wellness', label: 'Mindfulness & Wellness' },
    { value: 'addiction', label: 'Substance Abuse' }
  ];

  const availabilityOptions = [
    { value: 'all', label: 'All Counsellors' },
    { value: 'available', label: 'Available Today' },
    { value: 'tomorrow', label: 'Available Tomorrow' }
  ];

  const sortOptions = [
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'experience', label: 'Most Experienced' }
  ];

  /**
   * Load counsellors on component mount
   */
  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/bookings/counsellors');
        const fetchedCounsellors = response.data.data.counsellors;

        // Enrich counsellors with UI-friendly fields based on backend data
        const enriched = fetchedCounsellors.map(c => {
          const availability = Array.isArray(c.availability) ? c.availability : [];
          const availableTimes = availability.map(slot => {
            const day = slot.day || '';
            const start = slot.startTime || '';
            const end = slot.endTime || '';
            return `${day} ${start}-${end}`.trim();
          });

          return {
            ...c,
            id: c._id,
            avatar:
              c.avatar ||
              `https://via.placeholder.com/150/4f46e5/ffffff?text=${encodeURIComponent(
                (c.name || 'C')[0]
              )}`,
            specialization: c.specialization || 'General Counseling',
            specialties: c.specialties || [c.specialization || 'General Counseling'],
            location: c.department || 'Campus counselling center',
            experience: c.experience || Math.floor(Math.random() * 6) + 3, // 3–8 yrs mock
            rating: c.rating || 4.5,
            reviews: c.reviews || 24,
            price: c.price || 0,
            availability,
            availableTimes,
            isAvailable: availability.length > 0
          };
        });

        setCounsellors(enriched);
        setFilteredCounsellors(enriched);
      } catch (error) {
        console.error('Error fetching counsellors:', error);
        setError('Failed to load counsellors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCounsellors();
  }, []);

  /**
   * Filter and sort counsellors
   */
  useEffect(() => {
    let filtered = counsellors;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(counsellor =>
        counsellor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counsellor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        counsellor.specialties.some(specialty => 
          specialty.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filter by specialization
    if (selectedSpecialization !== 'all') {
      filtered = filtered.filter(counsellor =>
        counsellor.specialization.toLowerCase().includes(selectedSpecialization) ||
        counsellor.specialties.some(specialty =>
          specialty.toLowerCase().includes(selectedSpecialization)
        )
      );
    }

    // Filter by availability
    if (selectedAvailability === 'available') {
      filtered = filtered.filter(counsellor => counsellor.isAvailable);
    } else if (selectedAvailability === 'tomorrow') {
      filtered = filtered.filter(counsellor =>
        counsellor.availableTimes.some(time => time.includes('Tomorrow'))
      );
    }

    // Sort counsellors
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'experience':
        filtered.sort((a, b) => b.experience - a.experience);
        break;
      case 'rating':
      default:
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredCounsellors(filtered);
  }, [counsellors, searchTerm, selectedSpecialization, selectedAvailability, sortBy]);

  /**
   * Handle booking a session
   */
  const handleBooking = (counsellor) => {
    setSelectedCounsellor(counsellor);
    setBookingForm({
      date: '',
      startTime: counsellor.availability?.[0]?.startTime || '',
      endTime: counsellor.availability?.[0]?.endTime || '',
      sessionType: 'individual',
      concern: ''
    });
    setBookingError(null);
    setShowBookingModal(true);
  };

  /**
   * Handle booking form changes
   */
  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
    if (bookingError) setBookingError(null);
  };

  /**
   * Submit booking to backend
   */
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    if (!selectedCounsellor) return;

    if (!bookingForm.date || !bookingForm.startTime || !bookingForm.endTime || !bookingForm.concern.trim()) {
      setBookingError('Please select a date, time slot, and describe your concern.');
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError(null);

      await api.post('/bookings', {
        counsellorId: selectedCounsellor._id || selectedCounsellor.id,
        date: bookingForm.date,
        timeSlot: {
          startTime: bookingForm.startTime,
          endTime: bookingForm.endTime
        },
        concern: bookingForm.concern.trim(),
        sessionType: bookingForm.sessionType
      });

      setShowBookingModal(false);
      setSelectedCounsellor(null);
      setBookingForm({
        date: '',
        startTime: '',
        endTime: '',
        sessionType: 'individual',
        concern: ''
      });
      
      // Show success message
      alert('Session booked successfully! You can view it in your dashboard under Bookings.');
      
      // Optionally refresh the page or navigate to dashboard
      // window.location.reload(); // Uncomment if you want to refresh the page
    } catch (err) {
      console.error('Error creating booking:', err);
      setBookingError(
        err.response?.data?.message || 'Failed to create booking. Please try a different time slot.'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialization('all');
    setSelectedAvailability('all');
    setSortBy('rating');
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
            <h1 className="text-3xl font-bold text-gray-900">Book a Session</h1>
            <p className="text-gray-600 mt-2">
              Find and book sessions with qualified counsellors who can support your mental health journey.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {counsellors.filter(c => c.isAvailable).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-gray-900">2 days</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Locations</p>
                  <p className="text-2xl font-bold text-gray-900">5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search counsellors by name or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {specializations.map(spec => (
                      <option key={spec.value} value={spec.value}>
                        {spec.label}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {availabilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {/* Clear Filters */}
                {(searchTerm || selectedSpecialization !== 'all' || selectedAvailability !== 'all' || sortBy !== 'rating') && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              {loading ? 'Loading counsellors...' : `Showing ${filteredCounsellors.length} of ${counsellors.length} counsellors`}
              {searchTerm && ` for "${searchTerm}"`}
              {selectedSpecialization !== 'all' && ` specializing in ${specializations.find(s => s.value === selectedSpecialization)?.label}`}
            </p>
          </div>

          {/* Counsellors Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-10 bg-gray-200 rounded flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredCounsellors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCounsellors.map(counsellor => (
                <BookingCard
                  key={counsellor._id || counsellor.id}
                  counsellor={counsellor}
                  onBook={handleBooking}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No counsellors found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search terms or filters to find available counsellors.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedCounsellor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Book Session with {selectedCounsellor.name}</h3>
            
            <div className="mb-4">
              <img
                src={selectedCounsellor.avatar}
                alt={selectedCounsellor.name}
                className="w-16 h-16 rounded-full mx-auto mb-2"
              />
              <p className="text-center text-gray-600">{selectedCounsellor.specialization}</p>
              {selectedCounsellor.price > 0 && (
                <p className="text-center text-lg font-bold text-primary-600">
                  ${selectedCounsellor.price}/session
                </p>
              )}
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={bookingForm.date}
                  onChange={handleBookingFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={bookingForm.startTime}
                    onChange={handleBookingFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={bookingForm.endTime}
                    onChange={handleBookingFormChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Type
                </label>
                <select
                  name="sessionType"
                  value={bookingForm.sessionType}
                  onChange={handleBookingFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="individual">Individual Therapy</option>
                  <option value="group">Group Session</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary concern
                </label>
                <textarea
                  name="concern"
                  rows="3"
                  value={bookingForm.concern}
                  onChange={handleBookingFormChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Briefly describe what you'd like to talk about..."
                  required
                />
              </div>

              {bookingError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {bookingError}
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={bookingLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {bookingLoading ? 'Booking...' : 'Book Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
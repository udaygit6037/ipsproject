/**
 * Booking Card Component
 * Displays counsellor information and booking options
 */

import React from 'react';
import { Calendar, Clock, Star, MapPin } from 'lucide-react';

const BookingCard = ({ counsellor, onBook }) => {
  /**
   * Handle booking button click
   */
  const handleBooking = () => {
    onBook(counsellor);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Counsellor Header */}
      <div className="flex items-start space-x-4 mb-4">
        <img
          src={counsellor.avatar}
          alt={counsellor.name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{counsellor.name}</h3>
          <p className="text-sm text-gray-600">{counsellor.specialization}</p>
          <div className="flex items-center mt-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">
              {counsellor.rating} ({counsellor.reviews} reviews)
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary-600">${counsellor.price}</p>
          <p className="text-sm text-gray-500">per session</p>
        </div>
      </div>

      {/* Counsellor Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{counsellor.location}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>Experience: {counsellor.experience} years</span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-sm text-gray-700 mb-4 line-clamp-3">
        {counsellor.bio}
      </p>

      {/* Specialties */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Specialties:</h4>
        <div className="flex flex-wrap gap-2">
          {counsellor.specialties.map((specialty, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Available Times */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Available Times:</h4>
        <div className="grid grid-cols-2 gap-2">
          {counsellor.availableTimes.slice(0, 4).map((time, index) => (
            <div
              key={index}
              className="flex items-center text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded"
            >
              <Calendar className="w-3 h-3 mr-1" />
              <span>{time}</span>
            </div>
          ))}
        </div>
        {counsellor.availableTimes.length > 4 && (
          <p className="text-xs text-gray-500 mt-1">
            +{counsellor.availableTimes.length - 4} more times available
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleBooking}
          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          Book Session
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          View Profile
        </button>
      </div>

      {/* Availability Status */}
      <div className="mt-3 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            counsellor.isAvailable ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-xs text-gray-600">
            {counsellor.isAvailable ? 'Available Today' : 'Next Available: Tomorrow'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
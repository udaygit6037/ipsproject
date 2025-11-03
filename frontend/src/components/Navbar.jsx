/**
 * Navigation Bar Component
 * Displays top navigation with user info and logout functionality
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogOut, User, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * Get dashboard route based on user role
   */
  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'student':
        return '/student-dashboard';
      case 'counsellor':
        return '/counsellor-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to={getDashboardRoute()} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DPI</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Digital Psychological Intervention
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/resources"
              className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Resources
            </Link>
            <Link
              to="/forum"
              className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Forum
            </Link>
            {user?.role === 'student' && (
              <Link
                to="/booking"
                className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Book Session
              </Link>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden bg-gray-50 border-t border-gray-200">
        <div className="px-4 py-3 space-y-1">
          <Link
            to="/resources"
            className="block px-3 py-2 text-gray-600 hover:text-primary-600 text-sm font-medium"
          >
            Resources
          </Link>
          <Link
            to="/forum"
            className="block px-3 py-2 text-gray-600 hover:text-primary-600 text-sm font-medium"
          >
            Forum
          </Link>
          {user?.role === 'student' && (
            <Link
              to="/booking"
              className="block px-3 py-2 text-gray-600 hover:text-primary-600 text-sm font-medium"
            >
              Book Session
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
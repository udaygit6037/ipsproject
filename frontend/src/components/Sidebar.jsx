/**
 * Sidebar Component
 * Displays navigation sidebar with role-based menu items
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home,
  BookOpen,
  MessageSquare,
  Calendar,
  Users,
  BarChart3,
  Settings,
  MessageCircle
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  /**
   * Get menu items based on user role
   */
  const getMenuItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        icon: Home,
        path: getDashboardPath(),
      },
      {
        name: 'Resources',
        icon: BookOpen,
        path: '/resources',
      },
      {
        name: 'Forum',
        icon: MessageSquare,
        path: '/forum',
      },
    ];

    // Role-specific menu items
    switch (user?.role) {
      case 'student':
        return [
          ...baseItems,
          {
            name: 'Book Session',
            icon: Calendar,
            path: '/booking',
          },
          {
            name: 'AI Chat',
            icon: MessageCircle,
            path: '/chat',
          },
        ];

      case 'counsellor':
        return [
          ...baseItems,
          {
            name: 'My Sessions',
            icon: Calendar,
            path: '/sessions',
          },
          {
            name: 'Students',
            icon: Users,
            path: '/students',
          },
        ];

      case 'admin':
        return [
          ...baseItems,
          {
            name: 'Analytics',
            icon: BarChart3,
            path: '/analytics',
          },
          {
            name: 'Users',
            icon: Users,
            path: '/users',
          },
          {
            name: 'Settings',
            icon: Settings,
            path: '/settings',
          },
        ];

      default:
        return baseItems;
    }
  };

  /**
   * Get dashboard path based on user role
   */
  const getDashboardPath = () => {
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

  /**
   * Check if menu item is active
   */
  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = getMenuItems();

  return (
    <div className="bg-white shadow-lg h-full w-64 fixed left-0 top-16 overflow-y-auto">
      <div className="p-4">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-700 border-r-4 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Role Badge */}
      <div className="absolute bottom-4 left-4 right-4">
        <div className="bg-gray-100 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">
              Logged in as <span className="font-medium capitalize">{user?.role}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
/**
 * Student Dashboard Component
 * Main dashboard for student users with overview and quick actions
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatBox from '../components/ChatBox.jsx';
import {
  Calendar,
  BookOpen,
  MessageSquare,
  Heart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import api from '../utils/api.js';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    upcomingSessions: 0,
    completedSessions: 0,
    resourcesRead: 0,
    forumPosts: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [moodData, setMoodData] = useState([]);
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

        // Fetch bookings
        const bookingsResponse = await api.get('/bookings/my-bookings');
        const bookings = bookingsResponse.data.data.bookings;
        
        const upcoming = bookings.filter(booking => 
          new Date(booking.date) >= new Date() && 
          ['pending', 'confirmed'].includes(booking.status)
        );
        const completed = bookings.filter(booking => booking.status === 'completed');
        
        setUpcomingSessions(upcoming.slice(0, 2)); // Show only next 2 sessions
        setStats(prev => ({
          ...prev,
          upcomingSessions: upcoming.length,
          completedSessions: completed.length
        }));

        // Fetch resources
        const resourcesResponse = await api.get('/resources');
        const resources = resourcesResponse.data.data.resources;
        setRecentResources(resources.slice(0, 3)); // Show only recent 3
        setStats(prev => ({
          ...prev,
          resourcesRead: resources.length
        }));

        // Fetch forum posts (if user has any)
        const forumResponse = await api.get('/forum/posts');
        const posts = forumResponse.data.data.posts;
        const userPosts = posts.filter(post => post.author._id === user.id);
        setStats(prev => ({
          ...prev,
          forumPosts: userPosts.length
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
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's your mental health journey overview for today.
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
                  <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resources Read</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.resourcesRead}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <MessageSquare className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Forum Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.forumPosts}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Upcoming Sessions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Sessions</h2>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {upcomingSessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{session.counsellor}</h3>
                          <p className="text-sm text-gray-600">{session.type}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{session.date}</span>
                            <Clock className="w-4 h-4 ml-3 mr-1" />
                            <span>{session.time}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'confirmed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {session.status}
                          </span>
                          <div className="mt-2">
                            <button className="text-primary-600 hover:text-primary-700 text-sm">
                              Join Session
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Resources */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Continue Learning</h2>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Browse All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentResources.map((resource) => (
                    <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{resource.title}</h3>
                        <span className="text-xs text-gray-500 capitalize">{resource.type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{resource.readTime}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${resource.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{resource.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Mood Tracker */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mood Tracker</h2>
                <div className="space-y-3">
                  {moodData.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <div className="flex items-center space-x-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i < entry.mood ? 'bg-primary-600' : 'bg-gray-200'
                              }`}
                          ></div>
                        ))}
                        <span className="text-sm font-medium text-gray-900 ml-2">
                          {entry.mood}/10
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors">
                  Log Today's Mood
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span>Book Session</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors">
                    <Heart className="w-4 h-4" />
                    <span>Emergency Support</span>
                  </button>
                  <button className="w-full flex items-center justify-center space-x-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors">
                    <MessageSquare className="w-4 h-4" />
                    <span>Join Forum</span>
                  </button>
                </div>
              </div>

              {/* AI Chat Widget */}
              <div>
                <ChatBox />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
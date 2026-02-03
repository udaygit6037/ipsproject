/**
 * Authentication Context
 * Manages authentication state and provides auth-related functions
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api.js';

// Simple UUID generator for anonymous sessions
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [anonymousId, setAnonymousId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    // Ensure we are using .getItem() and not assigning to sessionStorage
    const token = sessionStorage.getItem('token');
    const userData = sessionStorage.getItem('user');
    let currentAnonymousId = sessionStorage.getItem('anonymousId');

    if (!currentAnonymousId) {
      currentAnonymousId = generateUUID();
      window.sessionStorage.setItem('anonymousId', currentAnonymousId);
    }
    setAnonymousId(currentAnonymousId);

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        window.sessionStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data.data;

      // Use .setItem() - never use sessionStorage = ...
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));

      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // Signup
  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user: newUser } = response.data.data;

      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(newUser));

      setUser(newUser);
      return { success: true, user: newUser };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  // Logout
  const logout = () => {
    window.sessionStorage.clear();

    const newAnonymousId = generateUUID();
    sessionStorage.setItem('anonymousId', newAnonymousId);
    setAnonymousId(newAnonymousId);

    setUser(null);
  };

  const hasRole = (requiredRole) => {
    if (!user) return false;
    return Array.isArray(requiredRole)
      ? requiredRole.includes(user.role)
      : user.role === requiredRole;
  };

  const value = {
    user,
    anonymousId,
    login,
    signup,
    logout,
    hasRole,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-4">Loading session...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
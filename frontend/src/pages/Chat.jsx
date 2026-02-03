/**
 * Chat Page Component
 * Full-page AI chat interface for students
 */

import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatBox from '../components/ChatBox.jsx';

const Chat = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              AI Psychological First Aid
            </h1>
            <p className="text-gray-600 mt-2">
              Get 24/7 emotional support and guidance from our AI assistant.
            </p>
          </div>

          {/* Chat Container */}
          <div className="max-w-4xl mx-auto">
            <ChatBox />
          </div>

          {/* Additional Resources */}
          <div className="max-w-4xl mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Important Information
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong className="text-gray-900">Note:</strong> This AI assistant provides
                psychological first aid and emotional support. It is not a replacement for
                professional mental health care.
              </p>
              <p>
                <strong className="text-gray-900">For Emergencies:</strong> If you're in
                immediate danger or experiencing a mental health crisis, please contact:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Emergency Services: 911</li>
                <li>Crisis Text Line: Text HOME to 741741</li>
                <li>National Suicide Prevention Lifeline: 988</li>
              </ul>
              <p>
                <strong className="text-gray-900">For Professional Help:</strong> Consider
                booking a session with one of our qualified counsellors through the booking page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;


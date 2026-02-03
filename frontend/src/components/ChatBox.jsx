/**
 * AI-Guided First Aid ChatBox Component
 * Provides psychological first aid through AI-powered chat interface using Wit.ai
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Heart, Calendar, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';

const ChatBox = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm here to provide psychological first aid and support. How are you feeling today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handle sending a message to Wit.ai via backend API
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);
    setError(null);

    try {
      // Call backend API which integrates with Wit.ai
      const response = await api.post('/chat/message', {
        message: messageToSend
      });

      const botResponse = {
        id: Date.now() + 1,
        text: response.data.data.message,
        sender: 'bot',
        timestamp: new Date(),
        suggestBooking: response.data.data.suggestBooking,
        isEmergency: response.data.data.isEmergency || false
      };

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat API error:', error);
      setError('Failed to get response. Please try again.');
      
      // Fallback response on error
      const fallbackResponse = {
        id: Date.now() + 1,
        text: "I'm having trouble connecting right now. Please try again, or consider booking a session with one of our counsellors for immediate support.",
        sender: 'bot',
        timestamp: new Date(),
        suggestBooking: true
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg h-96 flex flex-col">
      {/* Chat Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5" />
          <h3 className="font-semibold">AI Psychological First Aid</h3>
        </div>
        <p className="text-primary-100 text-sm mt-1">
          24/7 emotional support and guidance
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${
                message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.isEmergency
                    ? 'bg-red-200 text-red-600'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : message.isEmergency ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.isEmergency
                    ? 'bg-red-50 text-red-900 border border-red-200'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                
                {/* Booking suggestion button */}
                {message.suggestBooking && message.sender === 'bot' && (
                  <button
                    onClick={() => navigate('/booking')}
                    className="mt-2 flex items-center space-x-1 text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
                  >
                    <Calendar className="w-3 h-3" />
                    <span>Book a Session</span>
                  </button>
                )}
                
                <p
                  className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-primary-200' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <Bot className="w-4 h-4 text-gray-600" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Share what's on your mind..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            rows="2"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {error && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}
        <p className="text-xs text-gray-500 mt-2">
          This is an AI assistant for emotional support. For emergencies, please contact professional help.
        </p>
      </div>
    </div>
  );
};

export default ChatBox;
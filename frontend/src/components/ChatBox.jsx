/**
 * AI-Guided First Aid ChatBox Component
 * Provides psychological first aid through AI-powered chat interface
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Heart } from 'lucide-react';

const ChatBox = () => {
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
  const messagesEndRef = useRef(null);

  // Mock AI responses for psychological first aid
  const mockResponses = [
    "I understand you're going through a difficult time. It's completely normal to feel this way, and I'm here to help.",
    "Thank you for sharing that with me. Your feelings are valid, and it takes courage to reach out for support.",
    "Let's take a moment to focus on your breathing. Try taking slow, deep breaths - in for 4 counts, hold for 4, out for 4.",
    "It sounds like you're dealing with a lot right now. Remember that it's okay to take things one step at a time.",
    "I hear that you're feeling overwhelmed. Would it help to talk about what's been weighing on your mind the most?",
    "You're showing great strength by seeking help. That's an important first step in taking care of your mental health.",
    "Sometimes when we're stressed, it helps to ground ourselves. Can you name 5 things you can see around you right now?",
    "I want you to know that what you're experiencing is temporary, even though it might not feel that way right now.",
    "It's important to be gentle with yourself during difficult times. What's one small thing you could do today to show yourself kindness?",
    "Remember that seeking help is a sign of strength, not weakness. You're taking positive steps by being here."
  ];

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
   * Generate mock AI response
   */
  const generateResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Keyword-based responses for more relevant replies
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
      return "I understand you're feeling anxious. Anxiety is very common and treatable. Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.";
    }
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
      return "I'm sorry you're feeling this way. Depression can make everything feel overwhelming, but you're not alone. Small steps like getting sunlight, gentle movement, or connecting with someone can help.";
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed')) {
      return "Stress can feel overwhelming, but there are ways to manage it. Try breaking tasks into smaller pieces, practice deep breathing, and remember it's okay to ask for help.";
    }
    
    if (lowerMessage.includes('panic') || lowerMessage.includes('panic attack')) {
      return "If you're experiencing panic, remember: you are safe, this will pass, and you can get through this. Focus on slow, deep breathing and try to ground yourself in the present moment.";
    }
    
    // Default to random supportive response
    return mockResponses[Math.floor(Math.random() * mockResponses.length)];
  };

  /**
   * Handle sending a message
   */
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: generateResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
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
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {message.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.text}</p>
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
        <p className="text-xs text-gray-500 mt-2">
          This is an AI assistant for emotional support. For emergencies, please contact professional help.
        </p>
      </div>
    </div>
  );
};

export default ChatBox;
/**
 * Chat Controller
 * Handles AI chatbot interactions using Wit.ai
 */

import { analyzeMessage, generateResponse } from '../utils/witaiService.js';

/**
 * Process chat message and return AI response
 * POST /api/chat/message
 */
export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.userId; // From auth middleware

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    // Get Wit.ai token from environment
    const witAiToken = process.env.WIT_AI_ACCESS_TOKEN;

    if (!witAiToken) {
      // Fallback to mock responses if Wit.ai is not configured
      console.warn('Wit.ai token not configured, using fallback responses');
      const fallbackResponse = generateResponse({
        text: message,
        intents: [],
        entities: {},
        traits: {},
      });

      return res.status(200).json({
        success: true,
        data: {
          message: fallbackResponse.message,
          suggestBooking: fallbackResponse.suggestBooking,
          isEmergency: fallbackResponse.isEmergency || false,
        },
      });
    }

    // Analyze message with Wit.ai
    const witResponse = await analyzeMessage(message, witAiToken);

    // Generate contextual response
    const response = generateResponse(witResponse);

    // Log interaction (optional - for analytics)
    // You could save chat history to database here if needed

    res.status(200).json({
      success: true,
      data: {
        message: response.message,
        suggestBooking: response.suggestBooking,
        isEmergency: response.isEmergency || false,
        intent: response.intent,
        confidence: response.confidence,
      },
    });
  } catch (error) {
    console.error('Chat controller error:', error);

    // Fallback response on error
    const fallbackResponse = generateResponse({
      text: req.body.message || '',
      intents: [],
      entities: {},
      traits: {},
    });

    res.status(200).json({
      success: true,
      data: {
        message: fallbackResponse.message,
        suggestBooking: fallbackResponse.suggestBooking,
        isEmergency: false,
      },
    });
  }
};

/**
 * Health check for chat service
 * GET /api/chat/health
 */
export const healthCheck = async (req, res) => {
  const witAiToken = process.env.WIT_AI_ACCESS_TOKEN;
  
  res.status(200).json({
    success: true,
    data: {
      service: 'chat',
      witAiConfigured: !!witAiToken,
      status: 'operational',
    },
  });
};


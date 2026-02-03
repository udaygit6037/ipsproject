/**
 * Wit.ai Service
 * Handles integration with Wit.ai NLP API for mental health chatbot
 */

/**
 * Send message to Wit.ai and get intent/entity analysis
 * @param {string} message - User's message
 * @param {string} accessToken - Wit.ai server access token
 * @returns {Promise<Object>} - Wit.ai response with intents and entities
 */
export const analyzeMessage = async (message, accessToken) => {
  try {
    const response = await fetch(
      `https://api.wit.ai/message?v=20240101&q=${encodeURIComponent(message)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Wit.ai API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Wit.ai API error:', error);
    throw error;
  }
};

/**
 * Generate contextual response based on Wit.ai intents and entities
 * @param {Object} witResponse - Response from Wit.ai API
 * @returns {string} - Generated response message
 */
export const generateResponse = (witResponse) => {
  const intents = witResponse.intents || [];
  const entities = witResponse.entities || {};
  const traits = witResponse.traits || {};

  // Get primary intent
  const primaryIntent = intents.length > 0 ? intents[0].name : null;
  const confidence = intents.length > 0 ? intents[0].confidence : 0;

  // Mental health response mapping
  const responseMap = {
    // Anxiety-related intents
    anxiety_help: {
      response: "I understand you're feeling anxious. Anxiety is very common and treatable. Try the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste. Would you like to book a session with a counsellor?",
      suggestBooking: true,
    },
    stress_support: {
      response: "Stress can feel overwhelming, but there are ways to manage it. Try breaking tasks into smaller pieces, practice deep breathing exercises, and remember it's okay to ask for help. I can help you book a session with a professional counsellor.",
      suggestBooking: true,
    },
    depression_support: {
      response: "I'm sorry you're feeling this way. Depression can make everything feel overwhelming, but you're not alone. Small steps like getting sunlight, gentle movement, or connecting with someone can help. Consider booking a session with one of our counsellors.",
      suggestBooking: true,
    },
    panic_attack: {
      response: "If you're experiencing panic, remember: you are safe, this will pass, and you can get through this. Focus on slow, deep breathing (inhale for 4 counts, hold for 4, exhale for 4). Try to ground yourself in the present moment. For ongoing support, I recommend booking a session.",
      suggestBooking: true,
    },
    book_session: {
      response: "I'd be happy to help you book a session! You can visit the booking page to schedule an appointment with one of our qualified counsellors. They're here to provide professional support tailored to your needs.",
      suggestBooking: true,
    },
    greeting: {
      response: "Hello! I'm here to provide psychological first aid and emotional support. How are you feeling today? Feel free to share what's on your mind, or ask me about booking a session with a counsellor.",
      suggestBooking: false,
    },
    goodbye: {
      response: "Take care of yourself. Remember, seeking help is a sign of strength. If you need to talk again, I'm here 24/7. For professional support, don't hesitate to book a session with our counsellors.",
      suggestBooking: false,
    },
    emergency: {
      response: "If you're in immediate danger or experiencing a mental health crisis, please contact emergency services (911) or a crisis hotline (988). For professional support, you can book an urgent session with our counsellors.",
      suggestBooking: true,
    },
  };

  // Check for emergency keywords
  const messageText = witResponse.text || '';
  const emergencyKeywords = ['suicide', 'kill myself', 'end my life', 'hurt myself', 'emergency'];
  const hasEmergency = emergencyKeywords.some(keyword => 
    messageText.toLowerCase().includes(keyword)
  );

  if (hasEmergency) {
    return {
      message: "I'm concerned about what you've shared. If you're in immediate danger, please contact emergency services (911) or the National Suicide Prevention Lifeline (988) right away. For ongoing support, please book a session with one of our professional counsellors. You're not alone, and help is available.",
      suggestBooking: true,
      isEmergency: true,
    };
  }

  // Generate response based on intent
  if (primaryIntent && confidence > 0.5 && responseMap[primaryIntent]) {
    const mappedResponse = responseMap[primaryIntent];
    return {
      message: mappedResponse.response,
      suggestBooking: mappedResponse.suggestBooking,
      intent: primaryIntent,
      confidence: confidence,
    };
  }

  // Fallback responses for low confidence or unknown intents
  const fallbackResponses = [
    "I understand you're going through a difficult time. It's completely normal to feel this way, and I'm here to help.",
    "Thank you for sharing that with me. Your feelings are valid, and it takes courage to reach out for support.",
    "Let's take a moment to focus on your breathing. Try taking slow, deep breaths - in for 4 counts, hold for 4, out for 4.",
    "It sounds like you're dealing with a lot right now. Remember that it's okay to take things one step at a time.",
    "I hear that you're feeling overwhelmed. Would it help to talk about what's been weighing on your mind the most?",
    "You're showing great strength by seeking help. That's an important first step in taking care of your mental health.",
    "Sometimes when we're stressed, it helps to ground ourselves. Can you name 5 things you can see around you right now?",
    "I want you to know that what you're experiencing is temporary, even though it might not feel that way right now.",
    "It's important to be gentle with yourself during difficult times. What's one small thing you could do today to show yourself kindness?",
    "Remember that seeking help is a sign of strength, not weakness. You're taking positive steps by being here. Would you like to book a session with a professional counsellor?",
  ];

  const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  
  return {
    message: randomFallback,
    suggestBooking: Math.random() > 0.5, // Randomly suggest booking in fallback
    intent: 'general_support',
    confidence: 0,
  };
};


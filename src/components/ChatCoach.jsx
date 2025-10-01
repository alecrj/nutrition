import { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, Pizza, Store, Frown, PartyPopper, Dumbbell } from 'lucide-react';
import { chatWithCoach, handleLifeEvent } from '../utils/claudeAPI';
import { loadChatHistory, addChatMessage } from '../utils/storage';

const ChatCoach = ({ userProfile, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    const history = loadChatHistory();
    if (history.length === 0) {
      // Welcome message if first time
      setMessages([{
        role: 'assistant',
        content: `Hey ${userProfile.name}! 👋 I'm your AI nutrition coach. I'm here to help you stay on track, answer questions, and adjust your plan whenever life happens. What's on your mind?`,
        timestamp: Date.now()
      }]);
    } else {
      setMessages(history);
    }
  }, [userProfile.name]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (customMessage = null) => {
    const messageText = customMessage || inputValue.trim();
    if (!messageText || isLoading) return;

    // Add user message
    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    addChatMessage('user', messageText);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get AI response
      const response = await chatWithCoach(messageText, conversationHistory, userProfile);

      // Add assistant message
      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      addChatMessage('assistant', response);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (actionType) => {
    setIsLoading(true);

    try {
      let context = {};
      let response;

      switch (actionType) {
        case 'off_plan':
          response = await handleLifeEvent('ate_off_plan', {
            description: 'User ate off-plan and needs help adjusting'
          }, userProfile);
          break;
        case 'restaurant':
          response = await handleLifeEvent('restaurant', {
            description: 'User is at a restaurant and needs suggestions'
          }, userProfile);
          break;
        case 'not_hungry':
          response = await handleLifeEvent('not_hungry', {
            description: 'User is not hungry and considering skipping a meal'
          }, userProfile);
          break;
        case 'event':
          const eventMessage = "I have a special event tonight. How should I adjust my meals?";
          handleSendMessage(eventMessage);
          return; // Exit early since handleSendMessage will handle loading state
        case 'workout':
          const workoutMessage = "I did an extra workout today. Can I eat more?";
          handleSendMessage(workoutMessage);
          return;
        default:
          return;
      }

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      addChatMessage('assistant', response);
    } catch (error) {
      console.error('Quick action error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { id: 'off_plan', label: 'Ate off-plan', icon: Pizza },
    { id: 'restaurant', label: 'At restaurant', icon: Store },
    { id: 'not_hungry', label: 'Not hungry', icon: Frown },
    { id: 'event', label: 'Special event', icon: PartyPopper },
    { id: 'workout', label: 'Extra workout', icon: Dumbbell }
  ];

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-600 text-white p-6 safe-top shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">Coach Chat</h2>
            <p className="text-primary-100 text-sm">Ask me anything!</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {quickActions.map(action => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action.id)}
                disabled={isLoading}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-primary-700 hover:bg-primary-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-primary text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-900 rounded-bl-sm'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🤖</span>
                  <span className="text-xs font-semibold text-gray-600">Coach</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-primary-100' : 'text-gray-500'}`}>
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-sm text-gray-600">Coach is typing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4 bg-white safe-bottom">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type a message..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
              inputValue.trim() && !isLoading
                ? 'bg-primary text-white hover:bg-primary-600 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-2">
          💡 Tip: Be honest and specific. I'm here to help, not judge!
        </p>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default ChatCoach;

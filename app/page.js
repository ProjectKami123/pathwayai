'use client';

import { useState, useRef, useEffect } from 'react';

// Extended list of engaging questions for young adults
const SUGGESTION_QUESTIONS = [
  "What jobs are on the MLTSSL?",
  "Software engineer visa eligibility",
  "Highest paying occupations in IT",
  "Jobs available in Queensland",
  "Which trades are in demand?",
  "Best paying jobs for graduates",
  "Creative industry opportunities",
  "Healthcare jobs with good prospects",
  "Remote work friendly occupations",
  "Jobs that don't require uni degrees",
  "What's hot in cybersecurity?",
  "Teaching jobs across Australia",
  "Finance sector career paths",
  "Environmental jobs and salaries",
  "Digital marketing opportunities",
  "Gaming industry careers",
  "Social media related jobs",
  "Data science career options",
  "UX/UI designer prospects",
  "Renewable energy job market",
  "Food industry opportunities",
  "Tourism and hospitality careers",
  "Sport and fitness jobs",
  "Mental health career paths",
  "AI and machine learning jobs"
];

// Random occupation queries for "Surprise Me" feature
const SURPRISE_QUERIES = [
  "Tell me about being a UX Designer",
  "What's it like working as a Data Scientist?",
  "Show me Software Engineer opportunities",
  "What about Cybersecurity Specialist roles?",
  "Tell me about Digital Marketing careers",
  "What's the deal with being a Nurse?",
  "Show me Teacher opportunities",
  "What about Chef and cooking careers?",
  "Tell me about Psychologist roles",
  "What's it like being a Physiotherapist?",
  "Show me Mechanical Engineer jobs",
  "What about Social Worker positions?",
  "Tell me about being a Graphic Designer",
  "What's the scoop on Marketing roles?",
  "Show me Environmental Scientist jobs"
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hey there! 👋 I\'m your AI career buddy for all things Australian jobs and visas. Whether you\'re wondering about visa pathways, salary expectations, or what skills you need - I\'ve got you covered! What\'s on your mind?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  // Generate 4 random suggestions on component mount and when refreshed
  useEffect(() => {
    const getRandomSuggestions = () => {
      const shuffled = [...SUGGESTION_QUESTIONS].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 4);
    };
    setCurrentSuggestions(getRandomSuggestions());
  }, []);

  const refreshSuggestions = () => {
    const shuffled = [...SUGGESTION_QUESTIONS].sort(() => 0.5 - Math.random());
    setCurrentSuggestions(shuffled.slice(0, 4));
  };

  const handleSurpriseMe = () => {
    const randomQuery = SURPRISE_QUERIES[Math.floor(Math.random() * SURPRISE_QUERIES.length)];
    setInput(randomQuery);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      // Add assistant response to chat
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          metadata: {
            matches: data.matches,
            relevantData: data.relevantData
          }
        }
      ]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          error: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            🇦🇺 Aussie Career Hub
          </h1>
          <p className="text-blue-100 mt-2 text-lg">Your AI-powered guide to Australian careers & visas ✨</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-6 h-[calc(100vh-200px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'bg-gradient-to-r from-green-400 to-blue-500 text-white'
                }`}>
                  {message.role === 'user' ? '👤' : '🤖'}
                </div>
                
                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : message.error
                      ? 'bg-red-50 text-red-800 border-2 border-red-200'
                      : 'bg-white/80 text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  
                  {/* Show metadata for assistant responses */}
                  {message.role === 'assistant' && message.metadata && (
                    <div className="mt-4 pt-3 border-t border-gray-200/50">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          📊 {message.metadata.matches} matches
                        </span>
                        {message.metadata.relevantData?.length > 0 && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            ✨ {message.metadata.relevantData.length} relevant jobs
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3 max-w-3xl">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-lg text-white">
                  🤖
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-gray-600 text-sm font-medium">Searching my brain... 🧠</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about Aussie careers, visas, or salaries... 💬"
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleSurpriseMe}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              title="Surprise Me!"
            >
              🎲
            </button>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {isLoading ? '⏳ Thinking...' : '🚀 Send'}
            </button>
          </div>
          
          {/* Quick suggestions */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">💡 Try asking:</span>
              <button
                type="button"
                onClick={refreshSuggestions}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                🔄 More ideas
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {currentSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setInput(suggestion)}
                  disabled={isLoading}
                  className="text-sm bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-indigo-100 text-gray-700 hover:text-blue-800 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 border border-gray-200 hover:border-blue-300 transform hover:-translate-y-0.5 hover:shadow-md"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
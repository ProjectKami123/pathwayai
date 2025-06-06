'use client';

import { useState, useRef, useEffect } from 'react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I provide information about Australian occupations, job skills, and career pathways. While I don\'t offer legal migration advice, I can share helpful insights based on ANZSCO job classifications. How can I assist you?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">Career Pathways</h1>
          <p className="text-blue-100 mt-1">Discover occupations and skills aligned with Australian career pathways.</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto p-4 h-[calc(100vh-180px)] flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.error
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-white text-gray-800 shadow-md border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                
                {/* Show metadata for assistant responses */}
                {message.role === 'assistant' && message.metadata && (
                  <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">📊 Data:</span>
                      <span>{message.metadata.matches} matches found</span>
                      {message.metadata.relevantData?.length > 0 && (
                        <span>• {message.metadata.relevantData.length} relevant occupations</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 max-w-3xl">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-600 text-sm">Searching database and generating response...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about occupations, visa eligibility, salaries, or career advice..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
          
          {/* Quick suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Try asking:</span>
            {[
              "What jobs are on the MLTSSL?",
              "Software engineer visa eligibility",
              "Highest paying occupations in IT",
              "Jobs available in Queensland"
            ].map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setInput(suggestion)}
                disabled={isLoading}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
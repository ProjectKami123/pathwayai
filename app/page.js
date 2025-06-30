'use client';

import { useState, useRef, useEffect } from 'react';
import SidePanel from '@/components/sidepanel';
import { auth } from '../lib/firebase'; // Import shared auth instance

// Updated example questions
const EXAMPLE_QUESTIONS = [
  "What are the best visa pathways for software engineers to Australia?",
  "How can I break into cybersecurity with my current tech background?", 
  "Which healthcare roles have the strongest migration prospects?",
  "What's the fastest path to permanent residency as an engineer?",
  "Tell me about high-demand skills for Data Scientists in Australia",
  "How much can I earn as a UX Designer in Sydney or Melbourne?",
  "What certifications boost my chances for skilled migration?",
  "Show me career progression paths for Civil Engineers",
  "Which tech skills are most valued by Australian employers?",
  "How do I optimize my profile for Australian job applications?"
];



export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '🚀 Welcome to PathwayAI! I\'m your intelligent career strategist. Ask me anything about Australian jobs, visa pathways, skill requirements, or career optimization strategies.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [exampleQuestion, setExampleQuestion] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Set a random example question on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * EXAMPLE_QUESTIONS.length);
    setExampleQuestion(EXAMPLE_QUESTIONS[randomIndex]); // ← show suggestion only
  }, []);

  // Make auth available in browser console for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.auth = auth;
      console.log('Firebase auth object is now available in the console as `window.auth`');
    }
  }, []); // Runs once on component mount

  // Set a random example question
  const setRandomExample = () => {
    const randomIndex = Math.floor(Math.random() * EXAMPLE_QUESTIONS.length);
    setExampleQuestion(EXAMPLE_QUESTIONS[randomIndex]);
  };

  // Handle tab key to autofill example
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (input === '') {
        setInput(exampleQuestion);
      }
    }
  };

  // Handle dice button click
  const handleDiceClick = () => {
    const randomIndex = Math.floor(Math.random() * EXAMPLE_QUESTIONS.length);
    setInput(EXAMPLE_QUESTIONS[randomIndex]);
    inputRef.current.focus();
  };

  // Scroll to bottom when messages change
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
      setRandomExample(); // Get a new example question after submission
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* SidePanel */}
      <div className="hidden md:block w-64 border-gray-200 focus:outline-none">
        <SidePanel />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto focus:outline-none">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 p-4 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-100 text-blue-900 ml-auto max-w-3xl' 
                  : 'bg-white shadow-md max-w-3xl'
              }`}
            >
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-sm border-t border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-4 w-full">
            <form 
              onSubmit={handleSubmit} 
              className="relative flex flex-col rounded-xl border-2 border-gray-200 bg-white shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 max-w-3xl w-full mx-auto"
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`${exampleQuestion} (Tab)`}
                  className="w-full border-0 focus:ring-0 rounded-t-xl py-3 pl-4 pr-16 focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => input.trim() && handleSubmit({ preventDefault: () => {} })}
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-180 p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Send (Enter)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              
              {/* Buttons row */}
              <div className="flex items-center px-3 py-2 bg-white rounded-b-xl">
                <button
                  type="button"
                  onClick={handleDiceClick}
                  className="flex items-center text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  title="Get career inspiration"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Inspire Me
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
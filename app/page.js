'use client';

import { useState, useRef, useEffect } from 'react';
import SidePanel from '@/components/sidepanel';
import { auth } from '../lib/firebase'; // Import shared auth instance

// Updated example questions
const EXAMPLE_QUESTIONS = [
  "What are the visa options for software engineers in Australia?",
  "Tell me about healthcare jobs with good growth potential",
  "How do I become a cybersecurity specialist in Australia?",
  "What are the highest paying jobs in the IT sector?",
  "Can you explain the skilled migration process for nurses?",
  "Tell me about being a Data Scientist in Australia?",
  "What's the job market like for Electricians?",
  "Show me career paths for Civil Engineers",
  "What skills do I need to be a UX Designer?",
  "Tell me about salary expectations for Teachers"
];



export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi there! I\'m your AI career advisor. Ask me anything about jobs, careers, or working in Australia.'
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
                  title="Random occupation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M11.17 6.764l.528-1.554h.161c.532 0 .954.227 1.141.563.145.266.195.466.195.756 0 .453-.268.792-.81.792h-1.214v-1.559z" />
                    <path d="M4.5 3h11c.563 0 1.017.476 1.017 1.063 0 .586-.454 1.062-1.017 1.062h-11c-.563 0-1.017-.476-1.017-1.062 0-.587.454-1.063 1.017-1.063z" />
                    <path d="M6.5 5a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M5.5 10.5a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M17.5 14.5a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M14.5 18.5a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M8.5 16.5a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M3.5 12.5a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M11.5 8.5a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M15.5 12.5a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M12.5 16.5a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M6.5 18.5a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M2.5 14.5a1 1 0 100-2 1 1 0 000 2z" />
                    <path d="M8.5 8.5a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                  Random Job
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
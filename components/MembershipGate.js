'use client';

import { useState, useEffect } from 'react';

export default function MembershipGate({ onClose }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [membershipStats, setMembershipStats] = useState(null);

  useEffect(() => {
    fetchMembershipStats();
  }, []);

  const fetchMembershipStats = async () => {
    try {
      const response = await fetch('/api/check-membership');
      const data = await response.json();
      setMembershipStats(data);
    } catch (error) {
      console.error('Failed to fetch membership stats:', error);
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/check-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Failed to join waitlist. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
          
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              You&apos;re In!
            </h2>
            <p className="text-gray-600">
              You&apos;ll be the first to know when we open more spots. Keep an eye on your inbox for exclusive early access.
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
        >
          ✕
        </button>
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">
            🚀 FOUNDING MEMBERS PROGRAM
          </h1>
          <div className="text-xl font-semibold opacity-90">
            EXCLUSIVE ACCESS FULL
          </div>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center bg-red-50 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              {membershipStats ? 
                `${membershipStats.totalUsers}/${membershipStats.maxUsers} Members` : 
                'Capacity Reached'
              }
            </div>
            
            <p className="text-gray-700 leading-relaxed mb-6">
              We&apos;ve reached our exclusive limit of <strong>100 founding members</strong> who get lifetime access to our premium AI-powered career optimization platform.
            </p>
            
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3">What Our Founding Members Get:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Unlimited ATS Resume Optimization
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Priority AI Career Coaching
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Advanced Analytics Dashboard
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Lifetime Access - No Monthly Fees
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Direct Access to New Features
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-center mb-4">
              🎯 Join the Priority Waitlist
            </h3>
            <p className="text-gray-600 text-center mb-4">
              Be first to know when we expand access. 
              {membershipStats?.waitlistCount > 0 && (
                <span className="font-semibold"> {membershipStats.waitlistCount} people waiting.</span>
              )}
            </p>
            
            <form onSubmit={handleWaitlistSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? 'Joining Waitlist...' : 'Get Priority Access'}
              </button>
            </form>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              When we&apos;re full, we&apos;re full. No exceptions. Join the waitlist for priority access when spots open.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
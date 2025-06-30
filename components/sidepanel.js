'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import SignOutButton from './SignOutButton';
import AuthModal from './AuthModal';
import AuthForm from './AuthForm';
import MembershipGate from './MembershipGate';

export default function SidePanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [membershipStats, setMembershipStats] = useState(null);
  const [showMembershipGate, setShowMembershipGate] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsAuthModalOpen(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetchMembershipStats();
  }, []);

  const fetchMembershipStats = async () => {
    try {
      const response = await fetch('/api/check-membership');
      if (response.ok) {
        const data = await response.json();
        setMembershipStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch membership stats:', error);
    }
  };

  const handleOpenAuthModal = (mode) => {
    if (membershipStats && !membershipStats.available) {
      setShowMembershipGate(true);
      return;
    }
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-white flex flex-col p-4 items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full h-full bg-white flex flex-col p-4 focus:outline-none">
        <div className="mb-6">
          <h2 
            className="text-2xl font-bold text-gray-800 mb-3 cursor-pointer hover:text-blue-600 transition-colors duration-200"
            onClick={() => router.push('/')}
          >
            PathwayAI
          </h2>
          <p className="text-xs text-gray-500 mb-3">AI-Powered Career Optimization</p>
          
          {membershipStats && (
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3 mb-3">
                <div className="text-xs font-semibold text-blue-900 mb-1">
                  🚀 FOUNDING MEMBERS
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {membershipStats.totalUsers}/{membershipStats.maxUsers}
                </div>
                <div className="text-xs text-blue-600">
                  {membershipStats.remaining > 0 ? 
                    `${membershipStats.remaining} spots left` : 
                    'Access Full'
                  }
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 w-full mb-6"></div>
        <nav className="flex-grow">
          <ul className="space-y-3">
            {user ? (
              <>
                <li>
                  <button
                    onClick={() => router.push('/')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 flex items-center"
                  >
                    <span className="mr-3">💬</span>
                    AI Career Chat
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/createprofile')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 flex items-center"
                  >
                    <span className="mr-3">👤</span>
                    My Profile
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/optimize-resume')}
                    className="w-full text-left px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-lg transition-opacity duration-200 focus:outline-none focus:ring-0 flex items-center font-medium"
                  >
                    <span className="mr-3">🎯</span>
                    ATS Optimizer
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button
                    onClick={() => handleOpenAuthModal('login')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 flex items-center"
                  >
                    <span className="mr-3">🔑</span>
                    Sign In
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleOpenAuthModal('signup')}
                    className="w-full text-left px-4 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 rounded-lg transition-opacity duration-200 focus:outline-none focus:ring-0 flex items-center font-medium"
                  >
                    <span className="mr-3">🚀</span>
                    {membershipStats && membershipStats.remaining > 0 ? 
                      `Join (${membershipStats.remaining} left)` : 
                      'Join Waitlist'
                    }
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
        {user && (
          <div className="mt-auto pt-4 border-t border-gray-200">
            <SignOutButton />
          </div>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal}>
        <AuthForm initialMode={authModalMode} onClose={handleCloseAuthModal} />
      </AuthModal>

      {showMembershipGate && (
        <MembershipGate onClose={() => setShowMembershipGate(false)} />
      )}
    </>
  );
}

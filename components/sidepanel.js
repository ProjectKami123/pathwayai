'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import SignOutButton from './SignOutButton';
import AuthModal from './AuthModal';
import AuthForm from './AuthForm';

export default function SidePanel() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' or 'signup'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsAuthModalOpen(false); // Close modal if user logs in/signs up successfully
      }
    });
    return () => unsubscribe();
  }, []);

  const handleOpenAuthModal = (mode) => {
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
        <h2 className="text-2xl font-bold text-gray-800 mb-6">PathwayAI</h2>
        <div className="border-t border-gray-200 w-full mb-6"></div>
        <nav className="flex-grow">
          <ul className="space-y-3">
            {user ? (
              // Authenticated user links
              <>
                <li>
                  <button
                    onClick={() => router.push('/createprofile')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                  >
                    My Profile
                  </button>
                </li>
              </>
            ) : (
              // Unauthenticated user links
              <>
                <li>
                  <button
                    onClick={() => handleOpenAuthModal('login')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                  >
                    Log In
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleOpenAuthModal('signup')}
                    className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0"
                  >
                    Sign Up
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
    </>
  );
}

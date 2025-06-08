'use client';

import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase'; // Using the shared auth instance
import ProfileForm from '../../components/ProfileForm';
import SidePanel from '../../components/sidepanel';
import { onAuthStateChanged } from 'firebase/auth';
import AuthModal from '../../components/AuthModal';
import AuthForm from '../../components/AuthForm';

export default function CreateProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // Default to 'login'

  // Function to fetch profile data from your API
  async function fetchUserProfile(currentUser) {
    if (!currentUser) {
      console.log('CreateProfilePage: No user signed in, cannot fetch profile.');
      return;
    }

    try {
      const idToken = await currentUser.getIdToken();
      console.log('CreateProfilePage: Retrieved ID token for API call.');
      // For debugging, you can log the token, but be careful in production
      // console.log('CreateProfilePage: Token:', idToken);
      console.log('ID Token:', idToken);

      const res = await fetch('/api/getProfile', {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`CreateProfilePage: API request failed with status ${res.status}: ${errorText}`);
        // Potentially set an error state here to show in UI
        return;
      }

      const data = await res.json();
      console.log('CreateProfilePage: Profile API response:', data);
      // Here you would typically set the fetched profile data to a state variable
      // e.g., setProfileData(data);
      // For now, we're just logging it as per the example.

    } catch (error) {
      console.error('CreateProfilePage: Error fetching user profile:', error);
      // Potentially set an error state here
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setIsAuthModalOpen(false); // Close modal if user is authenticated
        fetchUserProfile(currentUser); // Fetch profile when user is available
      }
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []); // Empty dependency array, so it runs once on mount

  const handleOpenAuthModal = (mode) => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 h-full bg-white border-r border-gray-200"> 
        <SidePanel />
      </div>
      <main className="flex-1 p-8 bg-gray-100 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Create Your Profile</h1>
        {user ? (
          <ProfileForm user={user} />
        ) : (
          <div className="text-center bg-white p-8 rounded-xl shadow-md max-w-lg mx-auto">
            <p className="mb-6 text-lg text-gray-700">
              Please log in or sign up to create or edit your profile.
            </p>
            <button
              onClick={() => handleOpenAuthModal('login')} // Default to login, AuthForm can switch
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Log In / Sign Up
            </button>
          </div>
        )}
      </main>
      {isAuthModalOpen && (
        <AuthModal onClose={handleCloseAuthModal}>
          <AuthForm
            mode={authModalMode}
            onSuccess={() => {
              handleCloseAuthModal();
              // User state will be updated by onAuthStateChanged, triggering profile fetch
            }}
            setMode={setAuthModalMode} // Allow AuthForm to switch between login/signup
          />
        </AuthModal>
      )}
    </div>
  );
}

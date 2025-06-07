'use client'; // Added this directive to mark as a Client Component

import { useEffect, useState } from 'react';
import { auth } from '../../lib/firebase'; // Import auth from your firebase.js
import ProfileForm from '../../components/ProfileForm'; // Import your ProfileForm component
import { onAuthStateChanged } from 'firebase/auth';

export default function CreateProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup the subscription on unmount
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-gray-700">Loading user data...</p>
      </div>
    );
  }

  // If no user is logged in, you might redirect them or show a login message
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl text-red-600">Please log in to create or edit your profile.</p>
        {/* You could add a link to a login page here */}
      </div>
    );
  }

  // Once user data is loaded, render the ProfileForm
  return (
    <div className="min-h-screen bg-gray-50">
      {/* You could add a navigation header here if needed */}
      <ProfileForm user={user} />
    </div>
  );
}

'use client'; // This component uses client-side hooks like useRouter

import { useRouter } from 'next/navigation'; // For App Router navigation

export default function SidePanel() {
  const router = useRouter();

  // Handle the click event for the Create Profile button
  const handleCreateProfileClick = () => {
    // Navigate to the /createprofile page
    router.push('/createprofile');
  };

  return (
    <div className="w-full h-full bg-white flex flex-col p-4 focus:outline-none">
      {/* Title at the top left */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">PathwayAI</h2>
      
      {/* Divider */}
      <div className="border-t border-gray-200 w-full mb-6"></div>
      
      {/* Navigation */}
      <nav>
        <ul className="space-y-4">
          <li>
            <button
              onClick={handleCreateProfileClick}
              className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-0 focus:ring-offset-0"
            >
              Create Profile
            </button>
          </li>
          {/* Additional navigation items can be added here */}
        </ul>
      </nav>
    </div>
  );
}

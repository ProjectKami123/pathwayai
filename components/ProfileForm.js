import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- Firebase Configuration ---
// IMPORTANT: Replace these with your actual Firebase project configuration details.
// You can find these in your Firebase project settings. It's best practice 
// to store these in environment variables (.env.local) in a real Next.js app.
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

// --- Initialize Firebase ---
// This initialization can be moved to a separate file (e.g., 'lib/firebase.js') 
// in a larger application to avoid re-initialization.
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- React Component ---
export default function ProfileForm() {
  // State for form inputs
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    location: '',
    visaStatus: 'Australian Citizen', // Default value
    professionalSummary: '',
    keySkills: '',
    mostRecentRole: {
      title: '',
      company: '',
      summary: '',
    },
  });

  // State for submission status (e.g., 'idle', 'loading', 'success', 'error')
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  // --- Input Change Handler ---
  // Handles changes for all top-level and nested form fields.
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('Saving your profile...');

    try {
      // Step 1: Ensure user is authenticated (anonymously for this example)
      // In a real app, you would have a proper login flow (e.g., with email/password, Google)
      await signInAnonymously(auth);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Could not authenticate user. Please try again.");
      }
      
      const userId = user.uid;

      // Step 2: Structure the data for Firestore
      const profileData = {
        // Personal Details
        fullName: formData.fullName,
        email: formData.email,
        location: formData.location,
        visaStatus: formData.visaStatus,
        
        // Professional Summary
        professionalSummary: formData.professionalSummary,
        keySkills: formData.keySkills.split(',').map(skill => skill.trim()).filter(skill => skill), // Converts comma-separated string to array
        
        // Work Experience (starting with the most recent role)
        workExperience: [
          {
            title: formData.mostRecentRole.title,
            company: formData.mostRecentRole.company,
            summary: formData.mostRecentRole.summary,
            startDate: null, // Can be added later
            endDate: null,   // Can be added later
          }
        ],

        // Initialize other fields as null/empty for future completion
        jobTargeting: {},
        education: [],
        certifications: [],
        optionalExtras: {},
        
        // Metadata
        profileLastUpdated: serverTimestamp(),
        profileCompleteness: 0.4 // Initial arbitrary score
      };

      // Step 3: Save the document to Firestore
      // We use the authenticated user's ID as the document ID.
      const profileRef = doc(db, 'userProfiles', userId);
      await setDoc(profileRef, profileData);

      setStatus('success');
      setMessage('✅ Profile saved successfully! You can now use the EasyApply extension.');

    } catch (error) {
      console.error("Error saving profile to Firestore:", error);
      setStatus('error');
      setMessage(`❌ An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Your PathwayAI Profile</h1>
        <p className="text-gray-600 mb-8">This "Quick Start" profile captures the essentials for generating tailored cover letters.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: The Essentials */}
          <div className="p-6 border border-gray-200 rounded-xl">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">The Essentials</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} required />
              <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} required />
              <InputField label="Location (e.g., Sydney, NSW)" name="location" value={formData.location} onChange={handleChange} required />
              <SelectField label="Citizenship / Visa Status" name="visaStatus" value={formData.visaStatus} onChange={handleChange} options={[
                'Australian Citizen', 'Permanent Resident', 'Student Visa (Subclass 500)', 'Temporary Skill Shortage Visa (Subclass 482)', 'Other'
              ]} />
            </div>
          </div>

          {/* Section 2: Your Core Story */}
          <div className="p-6 border border-gray-200 rounded-xl">
             <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Core Story</h2>
             <TextareaField label="Professional Summary" name="professionalSummary" value={formData.professionalSummary} onChange={handleChange} placeholder="A 3-5 sentence summary of your experience, goals, and strengths." required />
             <InputField label="Key Skills (comma-separated)" name="keySkills" value={formData.keySkills} onChange={handleChange} placeholder="e.g., React, Node.js, Project Management" required />
             
             <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-medium text-gray-600 mb-2">Your Most Recent Role</h3>
                 <div className="space-y-4">
                    <InputField label="Job Title" name="mostRecentRole.title" value={formData.mostRecentRole.title} onChange={handleChange} required />
                    <InputField label="Company" name="mostRecentRole.company" value={formData.mostRecentRole.company} onChange={handleChange} required />
                    <TextareaField label="Key Responsibilities / Achievements" name="mostRecentRole.summary" value={formData.mostRecentRole.summary} onChange={handleChange} rows={4} placeholder="Use bullet points or a short paragraph." required />
                 </div>
             </div>
          </div>

          {/* Submission Button & Status Message */}
          <div>
            <button type="submit" disabled={status === 'loading'} className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 transition-colors">
              {status === 'loading' ? 'Saving...' : 'Save Profile'}
            </button>
            {message && (
              <p className={`mt-4 text-center text-sm ${
                status === 'success' ? 'text-green-600' :
                status === 'error' ? 'text-red-600' : 'text-gray-500'
              }`}>
                {message}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Reusable Form Field Components ---
// These make the main form component cleaner and easier to read.
const InputField = ({ label, name, type = 'text', value, onChange, placeholder, required = false }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const TextareaField = ({ label, name, value, onChange, placeholder, rows = 3, required = false }) => (
  <div className="mt-4">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      required={required}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
    >
      {options.map(option => <option key={option} value={option}>{option}</option>)}
    </select>
  </div>
);

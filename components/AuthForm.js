'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AuthForm({ initialMode = 'login', onClose }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [phoneVerification, setPhoneVerification] = useState({
    showVerification: false,
    verificationId: '',
    verificationCode: ''
  });
  const router = useRouter();

  // Initialize reCAPTCHA for phone auth
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  }, []);

  const handleAuthAction = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/createprofile');
      onClose();
    } catch (err) {
      setError(err.message);
      console.error(mode + ' error:', err);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/createprofile');
      onClose();
    } catch (err) {
      setError(err.message);
      console.error('Google sign-in error:', err);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const provider = new FacebookAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/createprofile');
      onClose();
    } catch (err) {
      setError(err.message);
      console.error('Facebook sign-in error:', err);
    }
  };

  const handlePhoneSignIn = async () => {
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, `+${phone}`, appVerifier);
      setPhoneVerification({
        showVerification: true,
        verificationId: confirmationResult.verificationId,
        verificationCode: ''
      });
    } catch (err) {
      setError(err.message);
      console.error('Phone sign-in error:', err);
    }
  };

  const verifyPhoneCode = async () => {
    try {
      const credential = window.firebase.auth.PhoneAuthProvider.credential(
        phoneVerification.verificationId,
        phoneVerification.verificationCode
      );
      await signInWithCredential(auth, credential);
      router.push('/createprofile');
      onClose();
    } catch (err) {
      setError(err.message);
      console.error('Phone verification error:', err);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        {mode === 'login' ? 'Log In' : 'Create Account'}
      </h2>
      
      {/* Email/Password Form */}
      <form onSubmit={handleAuthAction}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="you@example.com"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'signup' ? 6 : undefined}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Processing...' : (mode === 'login' ? 'Log In' : 'Sign Up')}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button onClick={toggleMode} className="text-sm text-indigo-600 hover:text-indigo-500">
          {mode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Log In'}
        </button>
      </div>

      {/* Divider for Social Logins */}
      <div className="my-6 flex items-center">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="px-3 text-sm text-gray-500">OR</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      {/* Social Logins */}
      <div className="space-y-3">
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>
        <button
          onClick={handleFacebookSignIn}
          className="w-full flex items-center justify-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fill="#1877F2"/>
          </svg>
          Continue with Facebook
        </button>
        {!phoneVerification.showVerification ? (
          <div className="flex space-x-2">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="1234567890"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handlePhoneSignIn}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Send Code
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={phoneVerification.verificationCode}
              onChange={(e) => setPhoneVerification({ ...phoneVerification, verificationCode: e.target.value })}
              placeholder="Enter verification code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={verifyPhoneCode}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Verify Code
            </button>
          </div>
        )}
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}
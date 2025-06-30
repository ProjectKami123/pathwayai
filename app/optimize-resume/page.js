'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import SidePanel from '../../components/sidepanel';
import AuthModal from '../../components/AuthModal';
import AuthForm from '../../components/AuthForm';

export default function OptimizeResumePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
  // Form state
  const [jobDescription, setJobDescription] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState(null);
  const [usage, setUsage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOptimizeResume = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description to optimize your resume.');
      return;
    }

    if (jobDescription.length < 50) {
      setError('Job description must be at least 50 characters long.');
      return;
    }

    setIsOptimizing(true);
    setError('');

    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ jobDescription })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError(`Daily limit reached. You have ${data.remaining || 0} optimizations remaining today.`);
        } else {
          setError(data.message || data.error || 'Optimization failed');
        }
        return;
      }

      setOptimization(data.optimization);
      setUsage(data.usage);
      
    } catch (error) {
      console.error('Optimization error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClearResults = () => {
    setOptimization(null);
    setJobDescription('');
    setError('');
  };

  const handleCopySection = (content) => {
    navigator.clipboard.writeText(content);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 h-full bg-white border-r border-gray-200">
        <SidePanel />
      </div>
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎯 ATS Resume Optimizer
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Paste any job description and we'll intelligently optimize your resume to beat Applicant Tracking Systems (ATS) and land more interviews.
            </p>
            
            {usage && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-blue-800 font-medium">
                    Daily Usage: {3 - usage.remaining}/3 optimizations used
                  </span>
                  <span className="text-blue-600 text-sm">
                    Resets at midnight
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((3 - usage.remaining) / 3) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div className="space-y-8">
              {!optimization ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Step 1: Paste the Job Description
                  </h2>
                  
                  <div className="space-y-4">
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the full job description here...

Example: 'We are looking for a Senior Software Engineer with 5+ years of experience in React, Node.js, and AWS. The ideal candidate will have experience with...'

The more detailed the job description, the better we can optimize your resume!"
                      className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      disabled={isOptimizing}
                    />
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{jobDescription.length}/10,000 characters</span>
                      <span>Minimum 50 characters required</span>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-800">{error}</p>
                    </div>
                  )}

                  <div className="mt-8 flex gap-4">
                    <button
                      onClick={handleOptimizeResume}
                      disabled={isOptimizing || !jobDescription.trim()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isOptimizing ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          Optimizing Your Resume...
                        </div>
                      ) : (
                        'Optimize My Resume'
                      )}
                    </button>
                  </div>

                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Extracts key requirements and skills from the job description</li>
                      <li>• Rewrites your experience to match ATS keywords naturally</li>
                      <li>• Suggests relevant skills to add based on your background</li>
                      <li>• Maintains authenticity while maximizing keyword relevance</li>
                      <li>• Provides clean, ATS-friendly formatting suggestions</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        ✨ Optimized Resume Content
                      </h2>
                      <button
                        onClick={handleClearResults}
                        className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
                      >
                        Start New Optimization
                      </button>
                    </div>

                    {optimization.optimizationNotes && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">Optimization Summary:</h3>
                        <p className="text-blue-800">{optimization.optimizationNotes}</p>
                      </div>
                    )}

                    <div className="space-y-8">
                      {/* Optimized Summary */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3>
                          <button
                            onClick={() => handleCopySection(optimization.optimizedSummary)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Copy
                          </button>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-gray-800 leading-relaxed">{optimization.optimizedSummary}</p>
                        </div>
                      </div>

                      {/* Optimized Experience */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Work Experience</h3>
                        <div className="space-y-4">
                          {optimization.optimizedExperience.map((exp, index) => (
                            <div key={index} className="bg-gray-50 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                                  <p className="text-gray-600">{exp.company} • {exp.duration}</p>
                                </div>
                                <button
                                  onClick={() => handleCopySection(`${exp.title}\n${exp.company} • ${exp.duration}\n\n${exp.description}`)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                >
                                  Copy
                                </button>
                              </div>
                              <div className="mt-3 text-gray-800 whitespace-pre-line">
                                {exp.description}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Suggested Skills */}
                      {optimization.suggestedSkills && optimization.suggestedSkills.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">Suggested Additional Skills</h3>
                            <button
                              onClick={() => handleCopySection(optimization.suggestedSkills.join(', '))}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Copy All
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {optimization.suggestedSkills.map((skill, index) => (
                              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Keyword Matches */}
                      {optimization.keywordMatches && optimization.keywordMatches.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Key ATS Keywords Integrated</h3>
                          <div className="flex flex-wrap gap-2">
                            {optimization.keywordMatches.map((keyword, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <h3 className="font-semibold text-yellow-900 mb-2">Next Steps:</h3>
                      <ul className="text-yellow-800 text-sm space-y-1">
                        <li>• Copy the optimized content to your resume document</li>
                        <li>• Review and adjust the content to match your authentic experience</li>
                        <li>• Save your resume as a PDF with a clear filename</li>
                        <li>• Test your resume through free ATS scanners online</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-gray-200">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sign In to Optimize Your Resume
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Join thousands of professionals who've already optimized their resumes for ATS success. Create your account to get started.
              </p>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
              >
                Sign In / Create Account
              </button>
            </div>
          )}
        </div>

        {isAuthModalOpen && (
          <AuthModal onClose={() => setIsAuthModalOpen(false)}>
            <AuthForm
              mode="login"
              onSuccess={() => setIsAuthModalOpen(false)}
              setMode={() => {}}
            />
          </AuthModal>
        )}
      </main>
    </div>
  );
}
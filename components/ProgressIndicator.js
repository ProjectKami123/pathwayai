'use client';

import React from 'react';

const ProgressIndicator = ({ currentStep, totalSteps, formData, formSteps }) => {
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);
  
  // Motivational messages based on completion percentage
  const getMotivationalMessage = () => {
    if (progress < 25) return "Great start! You're on your way to an amazing resume.";
    if (progress < 50) return "Making great progress! Keep it up!";
    if (progress < 75) return "Halfway there! Your resume is taking shape.";
    if (progress < 100) return "Almost done! Just a few more sections to go.";
    return "All set! Your resume is ready to impress!";
  };

  // Check if a step is completed based on form data
  const isStepCompleted = (stepId) => {
    switch (stepId) {
      case 'personal-details':
        return formData.fullName && formData.email && formData.phoneNumber;
      case 'core-story':
        return formData.professionalSummary && formData.keySkills;
      case 'job-preferences':
        return formData.preferredJobTitles && formData.desiredIndustry;
      case 'work-experience':
        return formData.workExperience?.length > 0;
      case 'education':
        return formData.education?.length > 0;
      case 'certifications':
        return formData.certifications?.length > 0;
      case 'customization':
        return formData.keyStrengths && formData.culturalFitNotes;
      case 'optional-extras':
        return true; // Optional step is always considered complete
      default:
        return false;
    }
  };

  return (
    <div className="mb-8">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Progress Text */}
      <div className="flex justify-between text-sm text-gray-600 mb-2">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{progress}% Complete</span>
      </div>
      
      {/* Motivational Message */}
      <p className="text-sm text-gray-700 italic mb-4">
        {getMotivationalMessage()}
      </p>
      
      {/* Step Indicators */}
      <div className="flex flex-wrap gap-2 mt-4">
        {formSteps.map((step, index) => {
          const isCompleted = isStepCompleted(step.id);
          const isCurrent = index === currentStep;
          
          return (
            <div 
              key={step.id}
              className={`flex-1 min-w-[100px] text-center p-2 rounded-md transition-colors ${
                isCurrent 
                  ? 'bg-blue-100 border border-blue-300 font-medium' 
                  : isCompleted 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-gray-50 border border-gray-200 text-gray-400'
              }`}
              title={step.title}
            >
              <div className="flex items-center justify-center gap-2">
                {isCompleted ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-sm">{index + 1}</span>
                )}
                <span className="text-xs truncate">{step.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;

// Form navigation logic will be implemented here
import { useCallback } from 'react';
import { useProfileForm } from '../form-context/ProfileFormContext';

export const useFormNavigation = () => {
  const {
    currentStep,
    totalSteps,
    nextStep,
    prevStep,
    isFirstStep,
    isLastStep,
    currentStepData,
  } = useProfileForm();

  // Go to a specific step
  const goToStep = useCallback((stepIndex) => {
    // TODO: Implement step validation if needed
    // For now, we'll just update the step
    // In a real implementation, you might want to validate the current step
    // before allowing navigation to another step
    return stepIndex;
  }, []);

  // Go to next step with optional step data
  const goToNextStep = useCallback((stepData = {}) => {
    // TODO: Add step validation here if needed
    nextStep();
  }, [nextStep]);

  // Go to previous step
  const goToPrevStep = useCallback(() => {
    // No validation needed when going back
    prevStep();
  }, [prevStep]);

  // Check if a step is complete
  const isStepComplete = useCallback((stepIndex) => {
    // TODO: Implement step completion logic
    // This could check if required fields for the step are filled
    return false;
  }, []);

  // Get progress percentage
  const getProgress = useCallback(() => {
    return totalSteps > 0 ? Math.round(((currentStep + 1) / totalSteps) * 100) : 0;
  }, [currentStep, totalSteps]);

  return {
    currentStep,
    totalSteps,
    isFirstStep,
    isLastStep,
    currentStepData,
    goToNextStep,
    goToPrevStep,
    goToStep,
    isStepComplete,
    getProgress,
  };
};

export default useFormNavigation;

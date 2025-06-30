// Form state management logic will be implemented here
import { useCallback } from 'react';
import { useProfileForm } from '../form-context/ProfileFormContext';

export const useFormState = () => {
  const {
    formData,
    updateFormData,
    isSubmitting,
    setSubmitting,
    setComplete,
    isComplete,
  } = useProfileForm();

  // Handle form field changes
  const handleChange = useCallback((field) => (value) => {
    updateFormData({ [field]: value });
  }, [updateFormData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    setSubmitting(true);
    
    try {
      // TODO: Implement actual form submission logic
      console.log('Form submitted:', formData);
      setComplete();
      return { success: true };
    } catch (error) {
      console.error('Form submission error:', error);
      return { success: false, error };
    } finally {
      setSubmitting(false);
    }
  }, [formData, setSubmitting, setComplete]);

  // Handle array field updates (for dynamic fields like work experience, education, etc.)
  const handleArrayFieldChange = useCallback((field, index) => (value) => {
    const updatedArray = [...(formData[field] || [])];
    updatedArray[index] = { ...updatedArray[index], ...value };
    updateFormData({ [field]: updatedArray });
  }, [formData, updateFormData]);

  // Add new item to array field
  const addArrayFieldItem = useCallback((field, initialValue = {}) => {
    const updatedArray = [...(formData[field] || []), initialValue];
    updateFormData({ [field]: updatedArray });
    return updatedArray.length - 1; // Return the index of the new item
  }, [formData, updateFormData]);

  // Remove item from array field
  const removeArrayFieldItem = useCallback((field, index) => {
    const updatedArray = [...(formData[field] || [])];
    updatedArray.splice(index, 1);
    updateFormData({ [field]: updatedArray });
  }, [formData, updateFormData]);

  return {
    formData,
    isSubmitting,
    isComplete,
    handleChange,
    handleSubmit,
    handleArrayFieldChange,
    addArrayFieldItem,
    removeArrayFieldItem,
  };
};

export default useFormState;

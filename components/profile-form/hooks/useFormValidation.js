// hooks/useFormValidation.js
import { useCallback } from 'react';
import { useProfileForm } from '../form-context/ProfileFormContext';
import * as validators from '../utils/validators';

/**
 * Custom hook for form validation
 * Provides methods to validate individual fields, sections, and the entire form
 */
export const useFormValidation = () => {
  const { formData, setErrors, errors: formErrors } = useProfileForm();

  // Field-specific validation rules
  const fieldValidators = {
    // Personal Details
    firstName: [validators.required],
    lastName: [validators.required],
    email: [validators.required, validators.email],
    phone: [validators.phone],
    dateOfBirth: [validators.notInFuture],
    bio: [validators.required],
    
    // Work Experience
    'workExperience.*.company': [validators.required],
    'workExperience.*.position': [validators.required],
    'workExperience.*.startDate': [validators.required, validators.notInFuture],
    'workExperience.*.endDate': (value, allValues, fieldPath) => {
      const match = fieldPath.match(/workExperience\[(\d+)\]/);
      if (!match) return undefined;
      const index = match[1];
      const isCurrent = allValues.workExperience?.[index]?.isCurrent;
      if (isCurrent) return undefined;
      return validators.required(value);
    },
    
    // Education
    'education.*.institution': [validators.required],
    'education.*.degree': [validators.required],
    'education.*.fieldOfStudy': [validators.required],
    'education.*.startDate': [validators.required, validators.notInFuture],
    'education.*.endDate': (value, allValues, fieldPath) => {
      const match = fieldPath.match(/education\[(\d+)\]/);
      if (!match) return undefined;
      const index = match[1];
      const isCurrent = allValues.education?.[index]?.isCurrent;
      if (isCurrent) return undefined;
      const startDate = allValues.education?.[index]?.startDate;
      const endDateError = validators.required(value) || validators.notInFuture(value);
      if (endDateError) return endDateError;
      return validators.dateRange(startDate, value);
    },
    
    // Certifications
    'certifications.*.name': [validators.required],
    'certifications.*.issuingOrganization': [validators.required],
    'certifications.*.issueDate': [validators.required, validators.notInFuture],
  };

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field to validate
   * @param {any} value - Current value of the field
   * @param {string} [fieldPath] - Full path to the field (for nested objects/arrays)
   * @returns {string|undefined} Error message if invalid, undefined if valid
   */
  const validateField = useCallback((fieldName, value, fieldPath = '') => {
    const validator = fieldValidators[fieldName];
    if (!validator) return undefined;
    
    // Handle function validators
    if (typeof validator === 'function') {
      return validator(value, formData, fieldPath);
    }
    
    // Handle array of validators
    return validators.composeValidators(...validator)(value, formData, fieldPath);
  }, [formData]);

  /**
   * Validate all fields in the form
   * @returns {{isValid: boolean, errors: Object}}
   */
  const validateForm = useCallback(() => {
    const errors = {};
    let hasErrors = false;

    /**
     * Recursively validate an object
     * @param {Object} obj - Object to validate
     * @param {string} [path] - Current path for nested objects
     */
    const validateObject = (obj, path = '') => {
      if (!obj || typeof obj !== 'object') return;

      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Handle nested objects
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          validateObject(value, currentPath);
          return;
        }

        // Handle array of objects
        if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'object') {
          value.forEach((item, index) => {
            validateObject(item, `${currentPath}[${index}]`);
          });
          return;
        }

        // Validate the field
        const error = validateField(key, value, currentPath);
        if (error) {
          errors[currentPath] = error;
          hasErrors = true;
        }
      });
    };

    validateObject(formData);
    setErrors(errors);
    return { 
      isValid: !hasErrors, 
      errors 
    };
  }, [formData, validateField, setErrors]);

  /**
   * Validate a section of the form
   * @param {string[]} fields - Array of field names to validate
   * @returns {{isValid: boolean, errors: Object}}
   */
  const validateSection = useCallback((fields) => {
    const errors = {};
    let hasErrors = false;

    fields.forEach(field => {
      const value = field.split('.').reduce((obj, key) => obj?.[key], formData);
      const error = validateField(field, value, field);
      
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    setErrors(prevErrors => ({
      ...prevErrors,
      ...errors
    }));

    return {
      isValid: !hasErrors,
      errors
    };
  }, [formData, validateField, setErrors]);

  return {
    validateField,
    validateForm,
    validateSection,
    errors: formErrors,
  };
};

export default useFormValidation;
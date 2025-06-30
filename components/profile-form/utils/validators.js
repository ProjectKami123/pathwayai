// utils/validators.js

// Type checking helpers
const isString = (value) => typeof value === 'string';
const isNumber = (value) => !isNaN(parseInt(value)) && isFinite(value);
const isDate = (value) => !isNaN(Date.parse(value));
const currentYear = new Date().getFullYear();

// Field-level validation functions
export const required = (value) => {
  if (value === undefined || value === null) return 'This field is required';
  if (isString(value) && value.trim() === '') return 'This field is required';
  if (Array.isArray(value) && value.length === 0) return 'At least one item is required';
  return undefined;
};

export const email = (value) => {
  if (!value) return undefined;
  const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return emailRegex.test(value) ? undefined : 'Please enter a valid email address';
};

export const phone = (value) => {
  if (!value) return undefined;
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{4,10}$/;
  return phoneRegex.test(value) ? undefined : 'Please enter a valid phone number';
};

export const url = (value) => {
  if (!value) return undefined;
  try {
    new URL(value.startsWith('http') ? value : `https://${value}`);
    return undefined;
  } catch {
    return 'Please enter a valid URL';
  }
};

export const minLength = (min) => (value) => {
  if (!value) return undefined;
  return value.length >= min ? undefined : `Must be at least ${min} characters`;
};

export const maxLength = (max) => (value) => {
  if (!value) return undefined;
  return value.length <= max ? undefined : `Must be at most ${max} characters`;
};

export const minValue = (min) => (value) => {
  if (!value) return undefined;
  return Number(value) >= min ? undefined : `Must be at least ${min}`;
};

export const maxValue = (max) => (value) => {
  if (!value) return undefined;
  return Number(value) <= max ? undefined : `Must be at most ${max}`;
};

export const validYear = (value) => {
  if (!value) return undefined;
  const year = Number(value);
  if (isNaN(year)) return 'Please enter a valid year';
  return year >= 1900 && year <= currentYear + 5 
    ? undefined 
    : `Year must be between 1900 and ${currentYear + 5}`;
};

export const notInFuture = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today ? undefined : 'Date cannot be in the future';
};

export const dateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return undefined;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end ? undefined : 'End date must be after start date';
};

// Section validators
export const validatePersonalDetails = (data) => {
  const errors = {};
  
  // First name
  const firstNameError = required(data.firstName);
  if (firstNameError) errors.firstName = firstNameError;
  
  // Last name
  const lastNameError = required(data.lastName);
  if (lastNameError) errors.lastName = lastNameError;
  
  // Email
  const emailError = email(data.email) || required(data.email);
  if (emailError) errors.email = emailError;
  
  // Phone (if provided)
  if (data.phone) {
    const phoneError = phone(data.phone);
    if (phoneError) errors.phone = phoneError;
  }
  
  // Date of birth (if provided)
  if (data.dateOfBirth) {
    const dobError = notInFuture(data.dateOfBirth);
    if (dobError) errors.dateOfBirth = dobError;
  }
  
  return errors;
};

export const validateWorkExperience = (workExperiences = []) => {
  const errors = [];
  
  workExperiences.forEach((exp, index) => {
    const expErrors = {};
    
    // Company
    const companyError = required(exp.company);
    if (companyError) expErrors.company = companyError;
    
    // Position
    const positionError = required(exp.position);
    if (positionError) expErrors.position = positionError;
    
    // Start date
    const startDateError = required(exp.startDate) || notInFuture(exp.startDate);
    if (startDateError) expErrors.startDate = startDateError;
    
    // End date (if not current)
    if (!exp.isCurrent) {
      const endDateError = required(exp.endDate) || notInFuture(exp.endDate);
      if (endDateError) expErrors.endDate = endDateError;
      
      // Validate date range
      if (!startDateError && !endDateError && exp.startDate && exp.endDate) {
        const rangeError = dateRange(exp.startDate, exp.endDate);
        if (rangeError) expErrors.endDate = rangeError;
      }
    }
    
    if (Object.keys(expErrors).length > 0) {
      errors[index] = expErrors;
    }
  });
  
  return errors.length > 0 ? errors : undefined;
};

// Form-level validation
export const validateProfileForm = (formData) => {
  const errors = {};
  
  // Validate personal details
  const personalErrors = validatePersonalDetails(formData);
  if (Object.keys(personalErrors).length > 0) {
    errors.personalDetails = personalErrors;
  }
  
  // Validate work experience
  if (formData.workExperience?.length > 0) {
    const workExpErrors = validateWorkExperience(formData.workExperience);
    if (workExpErrors) {
      errors.workExperience = workExpErrors;
    }
  }
  
  // Add validation for other sections as needed
  
  return Object.keys(errors).length > 0 ? errors : undefined;
};

// Validation composer (for combining multiple validators)
export const composeValidators = (...validators) => (value) => {
  return validators.reduce((error, validator) => {
    return error || (typeof validator === 'function' ? validator(value) : undefined);
  }, undefined);
};

// Example usage with form field:
// <Field
//   name="email"
//   validate={composeValidators(required, email)}
//   component={InputField}
// />
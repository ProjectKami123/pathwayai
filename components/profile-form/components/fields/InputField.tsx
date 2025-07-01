import React, { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * Label text for the input field
   */
  label: string;
  /**
   * Error message to display below the input
   */
  error?: FieldError | undefined;
  /**
   * Additional description or helper text
   */
  description?: string;
  /**
   * Whether the field is required (adds '*' to label)
   */
  required?: boolean;
  /**
   * Custom class name for the wrapper div
   */
  wrapperClassName?: string;
  /**
   * Custom class name for the label
   */
  labelClassName?: string;
  /**
   * Custom class name for the input
   */
  inputClassName?: string;
  /**
   * Custom class name for the error message
   */
  errorClassName?: string;
  /**
   * Custom class name for the description
   */
  descriptionClassName?: string;
  /**
   * Whether the input is in a read-only state
   */
  readOnly?: boolean;
  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
}

/**
 * A reusable input field component with label, error handling, and accessibility features.
 * Built with Tailwind CSS and designed to work with react-hook-form.
 */
const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  error,
  description,
  required = false,
  wrapperClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  descriptionClassName = '',
  id,
  className = '',
  readOnly = false,
  disabled = false,
  type = 'text',
  ...props
}, ref) => {
  // Generate a unique ID if none is provided
  const generatedId = React.useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;

  // Base classes
  const baseInputClasses = 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6';
  
  // State-based classes
  const stateClasses = error
    ? 'ring-red-500 focus:ring-red-500 text-red-900 placeholder-red-300'
    : 'ring-gray-300 focus:ring-blue-500 placeholder:text-gray-400';
  
  // Read-only and disabled states
  const readOnlyClasses = readOnly ? 'bg-gray-50 text-gray-500' : 'bg-white';

  // Combine all input classes
  const inputClasses = [
    baseInputClasses,
    stateClasses,
    readOnlyClasses,
    disabled ? 'bg-gray-50' : '',
    inputClassName,
    className
  ].filter(Boolean).join(' ');

  // Label classes
  const labelClasses = [
    'block text-sm font-medium leading-6 text-gray-900',
    required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : '',
    labelClassName
  ].filter(Boolean).join(' ');

  // Error message classes
  const errorClasses = [
    'mt-2 text-sm text-red-600',
    errorClassName
  ].filter(Boolean).join(' ');

  // Description classes
  const descClasses = [
    'mt-1 text-sm text-gray-500',
    descriptionClassName
  ].filter(Boolean).join(' ');

  return (
    <div className={`space-y-2 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={labelClasses}
        >
          {label}
        </label>
      )}

      <div className="relative rounded-md shadow-sm">
        <input
          id={inputId}
          ref={ref}
          type={type}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${error ? errorId : ''} ${description ? descriptionId : ''}`}
          readOnly={readOnly}
          disabled={disabled}
          {...props}
        />
      </div>

      {description && !error && (
        <p 
          id={descriptionId}
          className={descClasses}
        >
          {description}
        </p>
      )}

      {error && (
        <p 
          id={errorId}
          className={errorClasses}
          role="alert"
        >
          {error.message}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
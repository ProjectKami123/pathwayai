import React, { TextareaHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Label text for the textarea field
   */
  label: string;
  /**
   * Error message to display below the textarea
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
   * Number of visible text lines (default: 3)
   */
  rows?: number;
  /**
   * Custom class name for the wrapper div
   */
  wrapperClassName?: string;
  /**
   * Custom class name for the label
   */
  labelClassName?: string;
  /**
   * Custom class name for the textarea
   */
  textareaClassName?: string;
  /**
   * Custom class name for the error message
   */
  errorClassName?: string;
  /**
   * Custom class name for the description
   */
  descriptionClassName?: string;
  /**
   * Whether the textarea is in a read-only state
   */
  readOnly?: boolean;
  /**
   * Whether the textarea is disabled
   */
  disabled?: boolean;
}

/**
 * A reusable textarea field component with label, error handling, and accessibility features.
 * Built with Tailwind CSS and designed to work with react-hook-form.
 */
const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(({
  label,
  error,
  description,
  required = false,
  rows = 3,
  wrapperClassName = '',
  labelClassName = '',
  textareaClassName = '',
  errorClassName = '',
  descriptionClassName = '',
  id,
  className = '',
  readOnly = false,
  disabled = false,
  ...props
}, ref) => {
  // Generate a unique ID if none is provided
  const generatedId = React.useId();
  const textareaId = id || generatedId;
  const errorId = `${textareaId}-error`;
  const descriptionId = `${textareaId}-description`;

  // Base classes
  const baseTextareaClasses = 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6';
  
  // State-based classes
  const stateClasses = error
    ? 'ring-red-500 focus:ring-red-500 text-red-900 placeholder-red-300'
    : 'ring-gray-300 focus:ring-blue-500 placeholder:text-gray-400';
  
  // Read-only and disabled states
  const readOnlyClasses = readOnly ? 'bg-gray-50 text-gray-500' : 'bg-white';

  // Combine all textarea classes
  const textareaClasses = [
    baseTextareaClasses,
    stateClasses,
    readOnlyClasses,
    disabled ? 'bg-gray-50' : '',
    'resize-y min-h-[theme(spacing.10)]',
    textareaClassName,
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

  // Handle read-only display
  if (readOnly) {
    return (
      <div className={`space-y-2 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={textareaId}
            className={labelClasses}
          >
            {label}
          </label>
        )}
        <div 
          id={textareaId}
          className={`${textareaClasses} whitespace-pre-wrap`}
        >
          {props.value || ''}
        </div>
        {description && (
          <p className={descClasses}>
            {description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${wrapperClassName}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className={labelClasses}
        >
          {label}
        </label>
      )}

      <div className="relative rounded-md shadow-sm">
        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          className={textareaClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${error ? errorId : ''} ${description ? descriptionId : ''}`}
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

TextareaField.displayName = 'TextareaField';

export default TextareaField;

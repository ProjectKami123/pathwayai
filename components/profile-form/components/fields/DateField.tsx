

import React, { InputHTMLAttributes, forwardRef, useMemo, useState } from 'react';
import { FieldError } from 'react-hook-form';
import { formatDate, formatDateForInput } from '../../utils/formatters';

export interface DateFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  /**
   * Label text for the date field
   */
  label: string;
  /**
   * Error message to display below the field
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
   * Toggle option that can be selected instead of a date (e.g., 'Present', 'Expected')
   */
  toggleOption?: string;
  /**
   * Whether to allow future dates
   * @default false
   */
  allowFutureDates?: boolean;
  /**
   * Callback when the value changes
   */
  onChange?: (value: string, event: React.ChangeEvent<HTMLInputElement>) => void;
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
   * Custom class name for the toggle button
   */
  toggleButtonClassName?: string;
  /**
   * Whether the field is in a read-only state
   */
  readOnly?: boolean;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Current value (date string or toggle option)
   */
  value?: string;
}

/**
 * A reusable date input field with optional toggle button for "Present"/"Expected" values.
 * Built with Tailwind CSS and designed to work with react-hook-form.
 */
const DateField = forwardRef<HTMLInputElement, DateFieldProps>(({
  label,
  error,
  description,
  required = false,
  toggleOption,
  allowFutureDates = false,
  wrapperClassName = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  descriptionClassName = '',
  toggleButtonClassName = '',
  id,
  className = '',
  readOnly = false,
  disabled = false,
  value = '',
  onChange,
  ...props
}, ref) => {
  // Generate a unique ID if none is provided
  const fieldId = id || React.useId();
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;
  const isToggled = !!(toggleOption && value === toggleOption);

  // Format the date for display in read-only mode
  const formattedDate = useMemo(() => {
    if (isToggled) return toggleOption;
    if (!value) return '';
    return formatDate(value);
  }, [value, isToggled, toggleOption]);

  // Format the date for the input element
  const inputDate = useMemo(() => {
    if (isToggled || !value) return '';
    return formatDateForInput(value);
  }, [value, isToggled]);

  // Handle date input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  // Handle toggle button click
  const handleToggle = () => {
    if (onChange && toggleOption) {
      const newValue = isToggled ? '' : toggleOption;
      onChange(newValue, {
        target: { value: newValue }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Base classes
  const baseInputClasses = 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6';
  
  // State-based classes
  const stateClasses = error
    ? 'ring-red-500 focus:ring-red-500 text-red-900 placeholder-red-300'
    : 'ring-gray-300 focus:ring-blue-500 placeholder:text-gray-400';
  
  // Disabled and read-only states
  const readOnlyClasses = readOnly ? 'bg-gray-50 cursor-default' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  // Input classes
  const inputClasses = [
    baseInputClasses,
    stateClasses,
    readOnlyClasses,
    disabled ? 'bg-gray-50' : '',
    'pr-10', // Make room for the calendar icon
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

  // Toggle button classes
  const toggleBtnClasses = [
    'ml-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium',
    isToggled 
      ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700' 
      : 'bg-white text-gray-700 hover:bg-gray-50',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
    toggleButtonClassName
  ].filter(Boolean).join(' ');

  // Handle read-only display
  if (readOnly) {
    return (
      <div className={`space-y-2 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={fieldId}
            className={labelClasses}
          >
            {label}
          </label>
        )}
        <div 
          id={fieldId}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 sm:text-sm sm:leading-6"
        >
          {formattedDate || <span className="text-gray-400">—</span>}
        </div>
        {description && (
          <p className={descClasses}>
            {description}
          </p>
        )}
      </div>
    );
  }

  // Calculate max date (today if future dates are not allowed)
  const maxDate = !allowFutureDates 
    ? new Date().toISOString().split('T')[0]
    : undefined;

  return (
    <div className={`space-y-2 ${wrapperClassName}`}>
      <div className="flex justify-between items-center">
        {label && (
          <label
            htmlFor={fieldId}
            className={labelClasses}
          >
            {label}
          </label>
        )}
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id={fieldId}
            ref={ref}
            type="date"
            value={inputDate}
            onChange={handleDateChange}
            className={inputClasses}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={`${error ? errorId : ''} ${description ? descriptionId : ''}`}
            disabled={disabled || isToggled}
            max={maxDate}
            {...props}
          />
          {!isToggled && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {toggleOption && (
          <button
            type="button"
            className={toggleBtnClasses}
            onClick={handleToggle}
            disabled={disabled}
          >
            {toggleOption}
          </button>
        )}
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

DateField.displayName = 'DateField';

export default DateField;
import React, { SelectHTMLAttributes, forwardRef, useMemo } from 'react';
import { FieldError } from 'react-hook-form';

// Define the option type that can be either a string or an object with value/label
interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

type SelectOptions = Array<string | number | SelectOption>;

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  /**
   * Label text for the select field
   */
  label: string;
  /**
   * Error message to display below the select
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
   * Array of options for the select
   * Can be an array of strings/numbers or objects with {value, label} format
   */
  options: SelectOptions;
  /**
   * Placeholder text when no option is selected
   */
  placeholder?: string;
  /**
   * Whether to show the placeholder as a disabled option
   */
  showPlaceholder?: boolean;
  /**
   * Custom class name for the wrapper div
   */
  wrapperClassName?: string;
  /**
   * Custom class name for the label
   */
  labelClassName?: string;
  /**
   * Custom class name for the select element
   */
  selectClassName?: string;
  /**
   * Custom class name for the error message
   */
  errorClassName?: string;
  /**
   * Custom class name for the description
   */
  descriptionClassName?: string;
  /**
   * Whether the select is in a read-only state
   */
  readOnly?: boolean;
  /**
   * Whether the select is disabled
   */
  disabled?: boolean;
  /**
   * Custom onChange handler
   */
  onChange?: (value: string, event: React.ChangeEvent<HTMLSelectElement>) => void;
}

/**
 * A reusable select dropdown component with label, error handling, and accessibility features.
 * Built with Tailwind CSS and designed to work with react-hook-form.
 */
const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(({
  label,
  error,
  description,
  required = false,
  options = [],
  placeholder = 'Select an option',
  showPlaceholder = true,
  wrapperClassName = '',
  labelClassName = '',
  selectClassName = '',
  errorClassName = '',
  descriptionClassName = '',
  id,
  className = '',
  readOnly = false,
  disabled = false,
  value = '',
  onChange,
  ...props
}, ref) => {
  // Generate a unique ID if none is provided
  const generatedId = React.useId();
  const selectId = id || generatedId;
  const errorId = `${selectId}-error`;
  const descriptionId = `${selectId}-description`;

  // Normalize options to always be in {value, label} format
  const normalizedOptions = useMemo(() => {
    return options.map(option => {
      if (typeof option === 'string' || typeof option === 'number') {
        return { value: option, label: String(option) };
      }
      return option;
    });
  }, [options]);

  // Handle change event
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value, e);
    }
  };

  // Find the selected option's label for read-only display
  const selectedLabel = useMemo(() => {
    if (!value && value !== 0) return '';
    const option = normalizedOptions.find(opt => String(opt.value) === String(value));
    return option ? option.label : '';
  }, [value, normalizedOptions]);

  // Base classes
  const baseSelectClasses = 'block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6';
  
  // State-based classes
  const stateClasses = error
    ? 'ring-red-500 focus:ring-red-500 text-red-900'
    : 'ring-gray-300 focus:ring-blue-500';
  
  // Read-only and disabled states
  const readOnlyClasses = readOnly ? 'bg-gray-50 text-gray-500' : 'bg-white';

  // Combine all select classes
  const selectClasses = [
    baseSelectClasses,
    stateClasses,
    readOnlyClasses,
    disabled ? 'bg-gray-50' : '',
    'appearance-none',
    selectClassName,
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
            htmlFor={selectId}
            className={labelClasses}
          >
            {label}
          </label>
        )}
        <div 
          id={selectId}
          className={`block w-full rounded-md border-0 py-1.5 text-gray-900 sm:text-sm sm:leading-6 ${readOnlyClasses} ${className}`}
        >
          {selectedLabel || <span className="text-gray-400">—</span>}
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
          htmlFor={selectId}
          className={labelClasses}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          ref={ref}
          className={selectClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={`${error ? errorId : ''} ${description ? descriptionId : ''}`}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          {...props}
        >
          {showPlaceholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {normalizedOptions.map((option, index) => (
            <option
              key={`${option.value}-${index}`}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
          </svg>
        </div>
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

SelectField.displayName = 'SelectField';

export default SelectField;
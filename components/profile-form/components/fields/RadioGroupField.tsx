import React, { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

export interface RadioOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  /**
   * Label text for the radio group
   */
  label: string;
  /**
   * Error message to display below the radio group
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
   * Array of radio button options
   * Can be an array of strings/numbers or objects with {value, label} format
   */
  options: Array<string | number | RadioOption>;
  /**
   * Current selected value
   */
  value?: string | number;
  /**
   * Callback when selection changes
   */
  onChange?: (value: string | number, event: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Custom class name for the wrapper div
   */
  wrapperClassName?: string;
  /**
   * Custom class name for the label
   */
  labelClassName?: string;
  /**
   * Custom class name for the radio buttons container
   */
  containerClassName?: string;
  /**
   * Custom class name for each radio option
   */
  optionClassName?: string;
  /**
   * Custom class name for the error message
   */
  errorClassName?: string;
  /**
   * Custom class name for the description
   */
  descriptionClassName?: string;
  /**
   * Whether the radio group is in a read-only state
   */
  readOnly?: boolean;
  /**
   * Whether the radio group is disabled
   */
  disabled?: boolean;
  /**
   * Layout direction for the radio buttons
   * @default 'vertical'
   */
  layout?: 'vertical' | 'horizontal';
}

/**
 * A reusable radio group component with label, error handling, and accessibility features.
 * Built with Tailwind CSS and designed to work with react-hook-form.
 */
const RadioGroupField = forwardRef<HTMLInputElement, RadioGroupFieldProps>(({
  label,
  error,
  description,
  required = false,
  options = [],
  value,
  onChange,
  wrapperClassName = '',
  labelClassName = '',
  containerClassName = '',
  optionClassName = '',
  errorClassName = '',
  descriptionClassName = '',
  id,
  readOnly = false,
  disabled = false,
  layout = 'vertical',
  ...props
}, ref) => {
  // Generate a unique ID if none is provided
  const generatedId = React.useId();
  const groupId = id || generatedId;
  const errorId = `${groupId}-error`;
  const descriptionId = `${groupId}-description`;

  // Normalize options to always be in {value, label} format
  const normalizedOptions = React.useMemo(() => {
    return options.map(option => {
      if (typeof option === 'string' || typeof option === 'number') {
        return { value: option, label: String(option) };
      }
      return option;
    });
  }, [options]);

  // Handle change event
  const handleChange = (optionValue: string | number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(optionValue, e);
    }
  };

  // Base classes
  const baseRadioClasses = 'h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500';
  
  // State-based classes
  const stateClasses = error
    ? 'text-red-500'
    : 'text-blue-600';
  
  // Disabled state
  const disabledClasses = disabled || readOnly ? 'opacity-50 cursor-not-allowed' : '';

  // Label classes
  const labelClasses = [
    'block text-sm font-medium leading-6 text-gray-900 mb-2',
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

  // Container classes
  const containerClasses = [
    'space-y-2',
    layout === 'horizontal' ? 'flex flex-wrap gap-4' : 'space-y-2',
    containerClassName
  ].filter(Boolean).join(' ');

  // Option container classes
  const optionContainerClasses = [
    'flex items-center',
    optionClassName
  ].filter(Boolean).join(' ');

  // Handle read-only display
  if (readOnly) {
    const selectedOption = normalizedOptions.find(opt => String(opt.value) === String(value));
    return (
      <div className={`space-y-2 ${wrapperClassName}`}>
        {label && (
          <label
            htmlFor={groupId}
            className={labelClasses}
          >
            {label}
          </label>
        )}
        <div 
          id={groupId}
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 sm:text-sm sm:leading-6"
        >
          {selectedOption ? selectedOption.label : <span className="text-gray-400">—</span>}
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
          htmlFor={groupId}
          className={labelClasses}
        >
          {label}
        </label>
      )}

      <div 
        className={containerClasses}
        role="radiogroup"
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={`${error ? errorId : ''} ${description ? descriptionId : ''}`}
      >
        {normalizedOptions.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          const isChecked = String(value) === String(option.value);
          
          return (
            <div key={option.value} className={optionContainerClasses}>
              <input
                id={optionId}
                ref={ref}
                type="radio"
                name={groupId}
                value={option.value}
                checked={isChecked}
                onChange={handleChange(option.value)}
                disabled={disabled || option.disabled}
                className={`${baseRadioClasses} ${stateClasses} ${disabledClasses}`}
                aria-describedby={error ? errorId : description ? descriptionId : undefined}
                {...props}
              />
              <label
                htmlFor={optionId}
                className={`ml-2 block text-sm text-gray-900 ${disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option.label}
              </label>
            </div>
          );
        })}
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

RadioGroupField.displayName = 'RadioGroupField';

export default RadioGroupField;
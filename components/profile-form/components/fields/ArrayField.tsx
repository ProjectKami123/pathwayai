import React, { ReactNode } from 'react';
import { FieldError } from 'react-hook-form';
import { PlusIcon, TrashIcon } from '@heroicons/react/20/solid';

export interface ArrayFieldItemProps<T> {
  item: T;
  index: number;
  onRemove?: (index: number) => void;
  readOnly?: boolean;
  error?: FieldError;
}

export interface ArrayFieldProps<T> {
  /**
   * Label for the array field section
   */
  label: string;
  /**
   * Description or helper text
   */
  description?: string;
  /**
   * Array of items to render
   */
  items: T[];
  /**
   * Error message for the array field
   */
  error?: FieldError | undefined;
  /**
   * Whether the field is required (adds '*' to label)
   */
  required?: boolean;
  /**
   * Whether the field is in read-only mode
   */
  readOnly?: boolean;
  /**
   * Whether the field is disabled
   */
  disabled?: boolean;
  /**
   * Minimum number of items required
   */
  minItems?: number;
  /**
   * Maximum number of items allowed
   */
  maxItems?: number;
  /**
   * Text for the "Add" button
   * @default "Add Item"
   */
  addButtonText?: string;
  /**
   * Text for the "Remove" button
   * @default "Remove"
   */
  removeButtonText?: string;
  /**
   * Function to render each item in the array
   */
  renderItem: (props: {
    item: T;
    index: number;
    onRemove: () => void;
    readOnly?: boolean;
    error?: FieldError;
  }) => ReactNode;
  /**
   * Callback when an item is added
   * @param newItem The new item to add
   */
  onAddItem: (newItem: T) => void;
  /**
   * Callback when an item is removed
   * @param index Index of the item to remove
   */
  onRemoveItem: (index: number) => void;
  /**
   * Function to create a new empty item
   */
  createNewItem: () => T;
  /**
   * Custom class name for the wrapper
   */
  wrapperClassName?: string;
  /**
   * Custom class name for the label
   */
  labelClassName?: string;
  /**
   * Custom class name for the error message
   */
  errorClassName?: string;
  /**
   * Custom class name for the description
   */
  descriptionClassName?: string;
  /**
   * Custom class name for the add button
   */
  addButtonClassName?: string;
  /**
   * Custom class name for each item container
   */
  itemContainerClassName?: string;
}

/**
 * A reusable array field component for managing lists of form fields.
 * Built with TypeScript and Tailwind CSS.
 */
function ArrayField<T>({
  label,
  description,
  items = [],
  error,
  required = false,
  readOnly = false,
  disabled = false,
  minItems = 0,
  maxItems,
  addButtonText = 'Add Item',
  removeButtonText = 'Remove',
  renderItem,
  onAddItem,
  onRemoveItem,
  createNewItem,
  wrapperClassName = '',
  labelClassName = '',
  errorClassName = '',
  descriptionClassName = '',
  addButtonClassName = '',
  itemContainerClassName = '',
}: ArrayFieldProps<T>) {
  const canAdd = maxItems === undefined || items.length < maxItems;
  const canRemove = items.length > minItems && !readOnly && !disabled;

  // Handle adding a new item
  const handleAddItem = () => {
    if (canAdd) {
      onAddItem(createNewItem());
    }
  };

  // Handle removing an item
  const handleRemoveItem = (index: number) => {
    if (canRemove) {
      onRemoveItem(index);
    }
  };

  // Base classes
  const baseButtonClasses = 'inline-flex items-center rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Label classes
  const labelClasses = [
    'block text-sm font-medium text-gray-700',
    required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : '',
    labelClassName,
  ].filter(Boolean).join(' ');

  // Error message classes
  const errorClasses = [
    'mt-1 text-sm text-red-600',
    errorClassName,
  ].filter(Boolean).join(' ');

  // Description classes
  const descClasses = [
    'mt-1 text-sm text-gray-500',
    descriptionClassName,
  ].filter(Boolean).join(' ');

  // Add button classes
  const addButtonClasses = [
    baseButtonClasses,
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    !canAdd ? 'opacity-50 cursor-not-allowed' : '',
    addButtonClassName,
  ].filter(Boolean).join(' ');

  // Item container classes
  const itemContainerClasses = [
    'space-y-4',
    itemContainerClassName,
  ].filter(Boolean).join(' ');

  // Individual item wrapper classes
  const itemWrapperClasses = [
    'relative p-4 border border-gray-200 rounded-lg bg-white',
    'transition-shadow duration-150 ease-in-out hover:shadow-sm',
  ].filter(Boolean).join(' ');

  return (
    <div className={`space-y-3 ${wrapperClassName}`}>
      <div className="flex justify-between items-center">
        {label && (
          <h3 className={labelClasses}>{label}</h3>
        )}
        {!readOnly && !disabled && canAdd && (
          <button
            type="button"
            onClick={handleAddItem}
            className={addButtonClasses}
            disabled={!canAdd}
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
            {addButtonText}
          </button>
        )}
      </div>

      {description && (
        <p className={descClasses}>{description}</p>
      )}

      {items.length === 0 ? (
        <div className="text-center py-4 text-gray-500 text-sm">
          No items added yet.
        </div>
      ) : (
        <div className={itemContainerClasses}>
          {items.map((item, index) => (
            <div key={index} className={itemWrapperClasses}>
              {renderItem({
                item,
                index,
                onRemove: () => handleRemoveItem(index),
                readOnly,
                error: (error as Record<number, FieldError>)?.[index],
              })}
              
              {!readOnly && !disabled && canRemove && (
                <button
                  type="button"
                  onClick={() => handleRemoveItem(index)}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 focus:outline-none"
                  title={removeButtonText}
                >
                  <TrashIcon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">{removeButtonText}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {error && !error?.message?.startsWith('_') && (
        <p className={errorClasses} role="alert">
          {error.message}
        </p>
      )}

      {!readOnly && !disabled && canAdd && items.length > 0 && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleAddItem}
            className={addButtonClasses}
            disabled={!canAdd}
          >
            <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" aria-hidden="true" />
            {addButtonText}
          </button>
        </div>
      )}
    </div>
  );
}

export default ArrayField;
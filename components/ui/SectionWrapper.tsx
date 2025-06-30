import React, { ReactNode } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';

export interface SectionWrapperProps {
  /**
   * Title of the section
   */
  title: string;
  /**
   * Optional subtitle or additional information
   */
  subtitle?: string;
  /**
   * Optional note or description shown below the title
   */
  note?: string;
  /**
   * Whether the section is in read-only mode
   * @default false
   */
  readOnly?: boolean;
  /**
   * Whether to show the edit button
   * @default true
   */
  showEditButton?: boolean;
  /**
   * Callback when the edit button is clicked
   */
  onEdit?: () => void;
  /**
   * Additional CSS class for the wrapper
   */
  className?: string;
  /**
   * The content to be wrapped by this section
   */
  children: ReactNode;
  /**
   * Optional header actions (e.g., additional buttons)
   */
  headerActions?: ReactNode;
  /**
   * Optional footer content
   */
  footer?: ReactNode;
}

/**
 * A reusable section wrapper component that provides consistent styling and layout for form sections.
 * Includes optional title, subtitle, note, and edit functionality.
 */
const SectionWrapper: React.FC<SectionWrapperProps> = ({
  title,
  subtitle,
  note,
  readOnly = false,
  showEditButton = true,
  onEdit,
  className = '',
  children,
  headerActions,
  footer,
}) => {
  const hasHeader = title || subtitle || (showEditButton && onEdit && !readOnly) || headerActions;
  
  return (
    <section 
      className={`bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md ${className}`}
      data-testid="section-wrapper"
    >
      {hasHeader && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                {title}
                {subtitle && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    {subtitle}
                  </span>
                )}
              </h2>
              {note && (
                <p className="mt-1 text-sm text-gray-500">
                  {note}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {headerActions}
              {showEditButton && onEdit && !readOnly && (
                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  aria-label={`Edit ${title}`}
                >
                  <PencilIcon className="h-4 w-4 mr-1.5" aria-hidden="true" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="px-6 py-5">
        {children}
      </div>
      
      {footer && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </section>
  );
};

export default SectionWrapper;

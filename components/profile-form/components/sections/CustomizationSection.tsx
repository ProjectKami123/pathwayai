import React from 'react';
import { useProfileForm } from '../../form-context/ProfileFormContext';
import { InputField } from '../fields/InputField';
import { TextareaField } from '../fields/TextareaField';

const CustomizationSection: React.FC = () => {
  const { 
    formData, 
    errors, 
    handleChange,
    isReadOnly,
    toggleEditMode
  } = useProfileForm();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Customization & Fit</h2>
        <p className="text-sm text-gray-500 mb-6">
          Help us match you with opportunities that align with your preferences and strengths.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Key Strengths</h3>
          <InputField
            label="Your Key Strengths"
            name="keyStrengths"
            value={formData.keyStrengths || ''}
            onChange={handleChange}
            error={errors.keyStrengths}
            placeholder="E.g., Leadership, Problem Solving, Team Collaboration, Technical Expertise"
            helperText="Separate multiple strengths with commas"
            readOnly={isReadOnly}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Work Environment Preferences</h3>
          <TextareaField
            label="Cultural Fit Notes"
            name="culturalFitNotes"
            value={formData.culturalFitNotes || ''}
            onChange={handleChange}
            error={errors.culturalFitNotes}
            placeholder="I thrive in collaborative, fast-paced environments where I can take ownership of my work. I enjoy being part of a team that values open communication and continuous learning."
            helperText="Optional: Briefly describe your ideal work environment. This helps in matching you with companies that are a good cultural fit."
            rows={4}
            readOnly={isReadOnly}
          />
        </div>
      </div>

      {isReadOnly && (
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={toggleEditMode}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Section
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomizationSection;
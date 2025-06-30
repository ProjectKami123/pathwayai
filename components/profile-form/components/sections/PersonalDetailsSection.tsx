import React from 'react';
import { InputField, SelectField } from '../fields';
import { useProfileForm } from '../../form-context/ProfileFormContext';
import { VISA_STATUS_OPTIONS } from '../../utils/constants';

const PersonalDetailsSection: React.FC = () => {
  const { 
    formData, 
    errors, 
    handleChange,
    isReadOnly,
    toggleEditMode
  } = useProfileForm();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InputField
          label="Full Name"
          name="displayName"
          value={formData.displayName || ''}
          onChange={handleChange}
          error={errors.displayName}
          placeholder="John Doe"
          required
          readOnly={isReadOnly}
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          error={errors.email}
          placeholder="john.doe@example.com"
          required
          readOnly={true} // Email is typically not editable
          disabled={true}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InputField
          label="Phone Number"
          name="phoneNumber"
          type="tel"
          value={formData.phoneNumber || ''}
          onChange={handleChange}
          error={errors.phoneNumber}
          placeholder="+61 400 000 000"
          readOnly={isReadOnly}
        />

        <InputField
          label="LinkedIn Profile"
          name="linkedinUrl"
          value={formData.linkedinUrl || ''}
          onChange={handleChange}
          error={errors.linkedinUrl}
          placeholder="https://linkedin.com/in/username"
          readOnly={isReadOnly}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <InputField
          label="Location"
          name="location"
          value={formData.location || ''}
          onChange={handleChange}
          error={errors.location}
          placeholder="City, State/Region, Country"
          readOnly={isReadOnly}
        />

        <SelectField
          label="Visa Status"
          name="visaStatus"
          value={formData.visaStatus || ''}
          onChange={handleChange}
          options={VISA_STATUS_OPTIONS.map(status => ({
            value: status,
            label: status
          }))}
          error={errors.visaStatus}
          placeholder="Select your visa status"
          required
          readOnly={isReadOnly}
        />
      </div>

      {!isReadOnly && (
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={toggleEditMode}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
};

export default PersonalDetailsSection;

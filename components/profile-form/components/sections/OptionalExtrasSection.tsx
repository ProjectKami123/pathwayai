import React, { useState, useMemo } from 'react';
import { useProfileForm } from '../../form-context/ProfileFormContext';
import { TextareaField } from '../fields/TextareaField';
import { X } from 'lucide-react';
import { Chip } from '@mui/material';

const OptionalExtrasSection: React.FC = () => {
  const { 
    formData, 
    errors, 
    handleChange,
    updateField,
    isReadOnly,
    toggleEditMode
  } = useProfileForm();

  const [languageInput, setLanguageInput] = useState('');
  const [proficiencyInput, setProficiencyInput] = useState('');

  // Ensure languages is always an array of {language: string, proficiency: string} objects
  const languages = useMemo(() => {
    if (!formData.languages) return [];
    if (Array.isArray(formData.languages)) return formData.languages;
    // Handle legacy string format if needed
    if (typeof formData.languages === 'string') {
      return formData.languages.split(',')
        .map(item => {
          const match = item.trim().match(/(.+?)\s*\((.+?)\)/);
          return match ? { language: match[1].trim(), proficiency: match[2].trim() } : null;
        })
        .filter(Boolean);
    }
    return [];
  }, [formData.languages]);

  const handleLanguageKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && languageInput.trim()) {
      e.preventDefault();
      addLanguage();
    }
  };

  const addLanguage = () => {
    const language = languageInput.trim();
    const proficiency = proficiencyInput.trim() || 'Fluent'; // Default to 'Fluent' if not specified
    
    if (language && !languages.some(lang => 
      lang.language.toLowerCase() === language.toLowerCase()
    )) {
      const updatedLanguages = [
        ...languages, 
        { language, proficiency }
      ];
      updateField('languages', updatedLanguages);
      setLanguageInput('');
      setProficiencyInput('');
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    const updatedLanguages = languages.filter(
      lang => lang.language.toLowerCase() !== languageToRemove.toLowerCase()
    );
    updateField('languages', updatedLanguages);
  };

  const proficiencyOptions = [
    'Native',
    'Fluent',
    'Advanced',
    'Intermediate',
    'Basic',
    'Beginner'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Optional Extras</h2>
        <p className="text-sm text-gray-500 mb-6">
          Additional information that can help us better understand your background and preferences.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Volunteer Experience</h3>
          <TextareaField
            label="Volunteer Work"
            name="volunteerExperience"
            value={formData.volunteerExperience || ''}
            onChange={handleChange}
            error={errors.volunteerExperience}
            placeholder="Describe any volunteer work or community service you've been involved in..."
            helperText="Highlight any volunteer roles, causes you're passionate about, or leadership in community organizations."
            rows={3}
            readOnly={isReadOnly}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {languages.map((lang, index) => (
                <Chip
                  key={index}
                  label={`${lang.language} (${lang.proficiency})`}
                  onDelete={() => removeLanguage(lang.language)}
                  className="bg-purple-100 text-purple-800"
                  deleteIcon={<X className="w-3 h-3" />}
                />
              ))}
            </div>
            
            {!isReadOnly && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      onKeyDown={handleLanguageKeyDown}
                      onBlur={addLanguage}
                      placeholder="Language (e.g., Spanish)"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                    />
                  </div>
                  <div className="w-40">
                    <select
                      value={proficiencyInput}
                      onChange={(e) => setProficiencyInput(e.target.value)}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm p-2 border"
                    >
                      <option value="">Select proficiency</option>
                      {proficiencyOptions.map(level => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  {languages.length} language{languages.length !== 1 ? 's' : ''} added. Press Enter or click outside to add.
                </p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Publications & Portfolios</h3>
          <TextareaField
            label="Links to Your Work"
            name="publicationsOrPortfolios"
            value={formData.publicationsOrPortfolios || ''}
            onChange={handleChange}
            error={errors.publicationsOrPortfolios}
            placeholder="https://github.com/yourusername\nhttps://yourportfolio.com\nhttps://medium.com/your-articles"
            helperText="Provide links to your portfolio, GitHub, published articles, or other relevant work. One URL per line."
            rows={3}
            readOnly={isReadOnly}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Relocation</h3>
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                name="willingToRelocate"
                checked={formData.willingToRelocate === 'Yes'}
                onChange={(e) => handleChange({
                  target: {
                    name: 'willingToRelocate',
                    value: e.target.checked ? 'Yes' : 'No'
                  }
                })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                disabled={isReadOnly}
              />
              <span className="ml-2 text-gray-700">Willing to relocate for work</span>
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Check this box if you&apos;re open to relocating for the right opportunity.
          </p>
          {errors.willingToRelocate && (
            <p className="mt-1 text-sm text-red-600">{errors.willingToRelocate}</p>
          )}
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

export default OptionalExtrasSection;
import React from 'react';
import { useProfileForm } from '../../form-context/ProfileFormContext';
import { InputField } from '../fields/InputField';
import { Button } from '../../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

type EducationEntry = {
  id: string;
  qualification: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  honors: string;
};

const EducationSection: React.FC = () => {
  const { 
    formData, 
    errors, 
    handleArrayChange,
    isReadOnly,
  } = useProfileForm();

  // Initialize education entries from formData or with one empty entry
  const educationEntries: EducationEntry[] = formData.education?.length 
    ? formData.education 
    : [{ 
        id: Date.now().toString(), 
        qualification: '', 
        institution: '', 
        location: '', 
        startDate: '', 
        endDate: 'Present',
        honors: '' 
      }];

  const handleAddEducation = () => {
    const newEntry: EducationEntry = {
      id: Date.now().toString(),
      qualification: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: 'Present',
      honors: ''
    };
    handleArrayChange('education', [...educationEntries, newEntry]);
  };

  const handleRemoveEducation = (id: string) => {
    if (educationEntries.length <= 1) return;
    handleArrayChange('education', educationEntries.filter(entry => entry.id !== id));
  };

  const handleEducationChange = (id: string, field: keyof EducationEntry, value: string) => {
    const updatedEntries = educationEntries.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    handleArrayChange('education', updatedEntries);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Education</h3>
        {!isReadOnly && educationEntries.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddEducation}
            className="text-sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Education
          </Button>
        )}
      </div>

      {educationEntries.map((entry, index) => (
        <div key={entry.id} className="border border-gray-200 rounded-lg p-6 relative">
          {educationEntries.length > 1 && !isReadOnly && (
            <button
              type="button"
              onClick={() => handleRemoveEducation(entry.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              aria-label="Remove education entry"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Qualification"
              name={`education[${index}].qualification`}
              value={entry.qualification}
              onChange={(e) => handleEducationChange(entry.id, 'qualification', e.target.value)}
              error={errors[`education[${index}].qualification`]}
              placeholder="E.g., Bachelor of Information Technology"
              required
              readOnly={isReadOnly}
            />
            <InputField
              label="Institution"
              name={`education[${index}].institution`}
              value={entry.institution}
              onChange={(e) => handleEducationChange(entry.id, 'institution', e.target.value)}
              error={errors[`education[${index}].institution`]}
              placeholder="E.g., University of Technology Sydney"
              required
              readOnly={isReadOnly}
            />
            <InputField
              label="Location"
              name={`education[${index}].location`}
              value={entry.location}
              onChange={(e) => handleEducationChange(entry.id, 'location', e.target.value)}
              error={errors[`education[${index}].location`]}
              placeholder="E.g., Sydney, NSW"
              readOnly={isReadOnly}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Start Date"
                type="date"
                name={`education[${index}].startDate`}
                value={entry.startDate}
                onChange={(e) => handleEducationChange(entry.id, 'startDate', e.target.value)}
                error={errors[`education[${index}].startDate`]}
                required
                readOnly={isReadOnly}
              />
              <InputField
                label="End Date"
                type={entry.endDate === 'Present' || entry.endDate === 'Expected' ? 'text' : 'date'}
                name={`education[${index}].endDate`}
                value={entry.endDate}
                onChange={(e) => handleEducationChange(entry.id, 'endDate', e.target.value)}
                error={errors[`education[${index}].endDate`]}
                placeholder="Present or Expected"
                readOnly={isReadOnly}
                onFocus={(e) => {
                  if (e.target.value === 'Present' || e.target.value === 'Expected') {
                    e.target.type = 'date';
                    handleEducationChange(entry.id, 'endDate', '');
                  }
                }}
              />
            </div>
            <div className="md:col-span-2">
              <InputField
                label="Honors/Distinctions (Optional)"
                name={`education[${index}].honors`}
                value={entry.honors}
                onChange={(e) => handleEducationChange(entry.id, 'honors', e.target.value)}
                error={errors[`education[${index}].honors`]}
                placeholder="E.g., Summa Cum Laude, Dean's List, etc."
                readOnly={isReadOnly}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EducationSection;

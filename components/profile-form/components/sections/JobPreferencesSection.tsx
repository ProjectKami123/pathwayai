import React, { useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, TextField, Chip } from '@mui/material';
import { X } from 'lucide-react';

type JobPreferencesData = {
  preferredJobTitles: string[] | string;
  desiredIndustry: string;
  availability: string;
  preferredWorkType: string;
};

type JobPreferencesSectionProps = {
  defaultValues?: Partial<JobPreferencesData>;
};

const availabilityOptions = [
  'Immediately Available',
  '1-2 Weeks Notice',
  '1 Month Notice',
  '2-3 Months Notice',
  'More than 3 Months',
];

const workTypeOptions = [
  'Full-time',
  'Part-time',
  'Contract',
  'Temporary',
  'Internship',
  'Remote',
  'Hybrid',
  'On-site',
];

export const JobPreferencesSection: React.FC<JobPreferencesSectionProps> = ({
  defaultValues = {},
}) => {
  const [jobTitleInput, setJobTitleInput] = useState('');
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<JobPreferencesData>();

  // Ensure preferredJobTitles is always an array
  const preferredJobTitles = useMemo(() => {
    const value = watch('preferredJobTitles') || defaultValues.preferredJobTitles;
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }, [watch('preferredJobTitles'), defaultValues.preferredJobTitles]);

  const handleJobTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && jobTitleInput.trim()) {
      e.preventDefault();
      addJobTitle();
    } else if (e.key === 'Backspace' && !jobTitleInput && preferredJobTitles.length > 0) {
      // Remove last job title on backspace when input is empty
      removeJobTitle(preferredJobTitles[preferredJobTitles.length - 1]);
    }
  };

  const addJobTitle = () => {
    const newTitle = jobTitleInput.trim();
    if (newTitle && !preferredJobTitles.includes(newTitle)) {
      const updatedTitles = [...preferredJobTitles, newTitle];
      setValue('preferredJobTitles', updatedTitles, { shouldValidate: true });
      setJobTitleInput('');
    }
  };

  const removeJobTitle = (titleToRemove: string) => {
    const updatedTitles = preferredJobTitles.filter(title => title !== titleToRemove);
    setValue('preferredJobTitles', updatedTitles, { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Job Preferences</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Preferred Job Titles
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Add your preferred job titles. Press Enter or comma to add each title.
        </p>
        
        <div className="flex flex-wrap gap-2 mb-2">
          {preferredJobTitles.map((title, index) => (
            <Chip
              key={index}
              label={title}
              onDelete={() => removeJobTitle(title)}
              className="bg-blue-100 text-blue-800"
              deleteIcon={<X className="w-3 h-3" />}
            />
          ))}
        </div>
        
        <input
          type="text"
          value={jobTitleInput}
          onChange={(e) => setJobTitleInput(e.target.value)}
          onKeyDown={handleJobTitleKeyDown}
          onBlur={addJobTitle}
          placeholder="e.g., Software Engineer, Product Manager, UX Designer"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
        />
        <p className="mt-1 text-xs text-gray-500">
          {preferredJobTitles.length} title{preferredJobTitles.length !== 1 ? 's' : ''} added
        </p>
      </div>

      <div>
        <FormHelperText className="mb-1">
          Be specific. This helps us and you target your search.
        </FormHelperText>
        <TextField
          fullWidth
          label="Desired Industry"
          placeholder="e.g., Fintech, Health and Aged Care, Software as a Service (SaaS), FMCG"
          {...register('desiredIndustry')}
          defaultValue={defaultValues.desiredIndustry || ''}
          error={!!errors.desiredIndustry}
        />
      </div>

      <FormControl fullWidth error={!!errors.availability}>
        <InputLabel>Availability</InputLabel>
        <Select
          label="Availability"
          {...register('availability')}
          defaultValue={defaultValues.availability || 'Immediately Available'}
        >
          {availabilityOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth error={!!errors.preferredWorkType}>
        <InputLabel>Preferred Work Type</InputLabel>
        <Select
          label="Preferred Work Type"
          {...register('preferredWorkType')}
          defaultValue={defaultValues.preferredWorkType || 'Full-time'}
        >
          {workTypeOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default JobPreferencesSection;
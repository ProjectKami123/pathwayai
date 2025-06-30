import React, { useState, useCallback } from 'react';
import { useProfileForm } from '../../form-context/ProfileFormContext';
import { InputField } from '../fields/InputField';
import { TextareaField } from '../fields/TextareaField';
import { Button } from '../../ui/Button';
import { Plus, Trash2, RefreshCw, Info } from 'lucide-react';
import { Tooltip } from '../../ui/Tooltip';

type WorkExperience = {
  id: string;
  title: string;
  company: string;
  summary: string;
  location: string;
  startDate: string;
  endDate: string;
};

const ACHIEVEMENT_SAMPLES = [
  "Delivered comprehensive patient care across acute and aged care settings, consistently achieving high patient satisfaction scores. Led a multidisciplinary team initiative that reduced medication errors by 20%, improving safety and care quality for over 100 patients annually.\n\nPress \"Tab\" to try another example",
  "Spearheaded the development of a customer portal that increased user engagement by 35% and reduced support queries by 25%. Streamlined deployment processes, cutting release times by 40% and enhancing team productivity.\n\nPress \"Tab\" to try another example",
  "Implemented advanced threat detection systems that reduced security incidents by 60% across enterprise networks. Led security awareness training for 200+ staff, resulting in a 50% decrease in phishing susceptibility.\n\nPress \"Tab\" to try another example",
  "Managed the successful delivery of a $15M commercial project, completing it two weeks ahead of schedule and 8% under budget. Oversaw a team of 50+ contractors, maintaining zero lost-time injuries throughout the project.\n\nPress \"Tab\" to try another example",
  "Developed and introduced an innovative early literacy program that improved language development milestones for 90% of children in the centre. Increased parent engagement by 30% through regular workshops and open communication.\n\nPress \"Tab\" to try another example",
  "Enhanced the quality of life for 30+ residents by implementing personalised care plans and social activities. Achieved a 25% improvement in resident satisfaction scores within six months of introducing new wellness initiatives.\n\nPress \"Tab\" to try another example",
  "Led the 'Store Refresh' project for 15 retail locations, resulting in a 10% uplift in foot traffic. Managed a cross-functional team of 8, improving project delivery times by 20% by implementing a new workflow in Asana. Reduced operational costs by $50,000 per quarter by optimising the staff rostering system.\n\nPress \"Tab\" to try another example"
];

const WorkExperienceSection: React.FC = () => {
  const { 
    formData, 
    errors, 
    handleChange: formHandleChange,
    handleArrayChange,
    isReadOnly,
    toggleEditMode
  } = useProfileForm();

  // Initialize work experiences from formData or with one empty experience
  const workExperiences: WorkExperience[] = formData.workExperience?.length 
    ? formData.workExperience 
    : [{ id: Date.now().toString(), title: '', company: '', summary: '', location: '', startDate: '', endDate: 'Present' }];

  const [sampleIndices, setSampleIndices] = useState<{[key: string]: number}>({});

  // Initialize sample indices for each work experience
  const getRandomSampleIndex = useCallback((id: string) => {
    if (sampleIndices[id] === undefined) {
      setSampleIndices(prev => ({
        ...prev,
        [id]: Math.floor(Math.random() * ACHIEVEMENT_SAMPLES.length)
      }));
      return Math.floor(Math.random() * ACHIEVEMENT_SAMPLES.length);
    }
    return sampleIndices[id];
  }, [sampleIndices]);

  const handleReloadSummary = (id: string) => {
    let newIndex;
    const currentIndex = sampleIndices[id] ?? getRandomSampleIndex(id);
    
    do {
      newIndex = Math.floor(Math.random() * ACHIEVEMENT_SAMPLES.length);
    } while (newIndex === currentIndex && ACHIEVEMENT_SAMPLES.length > 1);
    
    setSampleIndices(prev => ({
      ...prev,
      [id]: newIndex
    }));

    // Update the form data with the new summary
    const experienceIndex = workExperiences.findIndex(exp => exp.id === id);
    if (experienceIndex !== -1) {
      const updatedExperiences = [...workExperiences];
      updatedExperiences[experienceIndex] = {
        ...updatedExperiences[experienceIndex],
        summary: ACHIEVEMENT_SAMPLES[newIndex]
      };
      handleArrayChange('workExperience', updatedExperiences);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleReloadSummary(id);
    }
  };

  const handleAddExperience = () => {
    const newExperience: WorkExperience = {
      id: Date.now().toString(),
      title: '',
      company: '',
      summary: '',
      location: '',
      startDate: '',
      endDate: 'Present'
    };
    handleArrayChange('workExperience', [...workExperiences, newExperience]);
  };

  const handleRemoveExperience = (id: string) => {
    if (workExperiences.length <= 1) return;
    handleArrayChange('workExperience', workExperiences.filter(exp => exp.id !== id));
  };

  const handleExperienceChange = (id: string, field: keyof WorkExperience, value: string) => {
    const updatedExperiences = workExperiences.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    );
    handleArrayChange('workExperience', updatedExperiences);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
        {!isReadOnly && workExperiences.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddExperience}
            className="text-sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Experience
          </Button>
        )}
      </div>

      {workExperiences.map((exp, index) => (
        <div key={exp.id} className="border border-gray-200 rounded-lg p-6 relative">
          {workExperiences.length > 1 && !isReadOnly && (
            <button
              type="button"
              onClick={() => handleRemoveExperience(exp.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              aria-label="Remove experience"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <InputField
              label="Job Title"
              name={`workExperience[${index}].title`}
              value={exp.title}
              onChange={(e) => handleExperienceChange(exp.id, 'title', e.target.value)}
              error={errors[`workExperience[${index}].title`]}
              placeholder="E.g., Senior Developer"
              required
              readOnly={isReadOnly}
            />
            <InputField
              label="Company"
              name={`workExperience[${index}].company`}
              value={exp.company}
              onChange={(e) => handleExperienceChange(exp.id, 'company', e.target.value)}
              error={errors[`workExperience[${index}].company`]}
              placeholder="E.g., Tech Corp Australia"
              required
              readOnly={isReadOnly}
            />
            <InputField
              label="Location"
              name={`workExperience[${index}].location`}
              value={exp.location}
              onChange={(e) => handleExperienceChange(exp.id, 'location', e.target.value)}
              error={errors[`workExperience[${index}].location`]}
              placeholder="E.g., Sydney, NSW"
              readOnly={isReadOnly}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Start Date"
                type="date"
                name={`workExperience[${index}].startDate`}
                value={exp.startDate}
                onChange={(e) => handleExperienceChange(exp.id, 'startDate', e.target.value)}
                error={errors[`workExperience[${index}].startDate`]}
                required
                readOnly={isReadOnly}
              />
              <InputField
                label="End Date"
                type={exp.endDate === 'Present' ? 'text' : 'date'}
                name={`workExperience[${index}].endDate`}
                value={exp.endDate}
                onChange={(e) => handleExperienceChange(exp.id, 'endDate', e.target.value)}
                error={errors[`workExperience[${index}].endDate`]}
                placeholder="Present"
                readOnly={isReadOnly}
                onFocus={(e) => {
                  if (e.target.value === 'Present') {
                    e.target.type = 'date';
                    handleExperienceChange(exp.id, 'endDate', '');
                  }
                }}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.type = 'text';
                    handleExperienceChange(exp.id, 'endDate', 'Present');
                  }
                }}
              />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Key Achievements
                <Tooltip content="How to add metrics: Don't have exact numbers? Estimate! Use percentages (%), dollar amounts ($), or time saved. Quantifying your impact is the single best way to make your resume stand out to Australian hiring managers.">
                  <button type="button" className="ml-1 text-gray-400 hover:text-gray-500">
                    <Info className="w-4 h-4" />
                  </button>
                </Tooltip>
              </label>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={() => handleReloadSummary(exp.id)}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                  title="Generate sample achievements"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try sample
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Focus on your achievements, not just your tasks. Use 3-5 bullet points. Start each point with a strong action verb and include a metric or a specific outcome.
            </p>
            <TextareaField
              name={`workExperience[${index}].summary`}
              value={exp.summary}
              onChange={(e) => handleExperienceChange(exp.id, 'summary', e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, exp.id)}
              error={errors[`workExperience[${index}].summary`]}
              placeholder="Enter your key achievements..."
              rows={6}
              readOnly={isReadOnly}
              className="w-full"
            />
            <div className="mt-1 text-xs text-gray-400">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded">Tab</kbd> to auto-fill with sample achievements
            </div>
          </div>
        </div>
      ))}

      {isReadOnly && (
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={toggleEditMode}
          >
            Edit Section
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkExperienceSection;
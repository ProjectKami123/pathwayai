import React, { useState, useMemo } from 'react';
import { useProfileForm } from '../../form-context/ProfileFormContext';
import { InputField } from '../fields/InputField';
import { TextareaField } from '../fields/TextareaField';
import { RefreshCw, Info, X } from 'lucide-react';
import { Tooltip } from '../../ui/Tooltip';

const PROFESSIONAL_SUMMARY_SAMPLES = [
  "Compassionate and skilled Registered Nurse with 5+ years of experience in acute care and aged care within Australia. Proficient in patient assessment, treatment planning, and multidisciplinary teamwork. Recognised for delivering high-quality, person-centred care and achieving positive health outcomes. Seeking to join a dynamic healthcare team to provide exceptional patient support and advance best practices in nursing.",
  "Innovative Software Developer with 4 years of experience building scalable web applications for Australian fintech and e-commerce clients. Expertise in Python, JavaScript, and cloud-based solutions. Led the development of a customer portal that improved user engagement by 35%. Looking to contribute my technical skills and passion for problem-solving to a forward-thinking tech team.",
  "Certified Cybersecurity Specialist with 4+ years of experience protecting enterprise networks and sensitive data for leading Australian organisations. Skilled in threat analysis, risk mitigation, and incident response. Achieved a 99.9% uptime for critical systems. Seeking to leverage my expertise to safeguard digital assets and support business resilience.",
  "Results-driven Construction Project Manager with 6 years of experience overseeing commercial and residential projects across Australia. Proven ability to deliver projects on time and within budget, while maintaining strict safety and quality standards. Adept at leading cross-functional teams and liaising with stakeholders. Eager to bring my leadership and project management skills to a growing construction firm.",
  "Dedicated Early Childhood Educator with 4 years of experience in Australian childcare centres. Passionate about fostering a nurturing and stimulating environment for children's development. Skilled in curriculum planning, behaviour management, and parent engagement. Committed to supporting each child's growth and learning journey within a collaborative team.",
  "Results-driven Digital Marketer with over 6 years of experience specialising in SEO and SEM for the Australian e-commerce sector. Proven track record of increasing organic traffic by over 200% for a major retail brand and managing a $250K annual ad budget to achieve a 4:1 ROAS. Seeking to leverage my data analysis and campaign optimisation skills to drive growth in a dynamic and collaborative team."
];

const ProfessionalSummarySection: React.FC = () => {
  const { 
    formData, 
    errors, 
    handleChange,
    updateField,
    isReadOnly,
    toggleEditMode
  } = useProfileForm();

  const [currentSummaryIndex, setCurrentSummaryIndex] = useState(
    Math.floor(Math.random() * PROFESSIONAL_SUMMARY_SAMPLES.length)
  );
  const [skillInput, setSkillInput] = useState('');

  // Ensure keySkills is always an array
  const keySkills = useMemo(() => {
    if (!formData.keySkills) return [];
    if (Array.isArray(formData.keySkills)) return formData.keySkills;
    return formData.keySkills.split(',').map(s => s.trim()).filter(Boolean);
  }, [formData.keySkills]);

  const handleReloadSummary = () => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * PROFESSIONAL_SUMMARY_SAMPLES.length);
    } while (newIndex === currentSummaryIndex && PROFESSIONAL_SUMMARY_SAMPLES.length > 1);
    
    setCurrentSummaryIndex(newIndex);
    
    // Update the form data with the new summary
    if (handleChange) {
      const event = {
        target: {
          name: 'professionalSummary',
          value: PROFESSIONAL_SUMMARY_SAMPLES[newIndex]
        }
      };
      handleChange(event);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleReloadSummary();
    }
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const addSkill = () => {
    const newSkill = skillInput.trim();
    if (newSkill && !keySkills.includes(newSkill)) {
      const updatedSkills = [...keySkills, newSkill];
      updateField('keySkills', updatedSkills);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const updatedSkills = keySkills.filter(skill => skill !== skillToRemove);
    updateField('keySkills', updatedSkills);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Professional Summary
              <Tooltip content="Recruiters spend only seconds scanning a resume. This summary is your first and best chance to grab their attention. An ATS often ranks your profile based on keywords found here.">
                <button type="button" className="ml-1 text-gray-400 hover:text-gray-500">
                  <Info className="w-4 h-4" />
                </button>
              </Tooltip>
            </label>
            <button
              type="button"
              onClick={handleReloadSummary}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
              title="Generate a sample summary"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Try a sample
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-2">
            Think of this as your 30-second elevator pitch. In 3-4 sentences, introduce your professional role, years of experience, 2-3 key achievements, and career aspirations. Tailor this for the jobs you&apos;re applying for.
          </p>
          <TextareaField
            name="professionalSummary"
            value={formData.professionalSummary || ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            error={errors.professionalSummary}
            placeholder="Enter your professional summary..."
            rows={6}
            readOnly={isReadOnly}
            className="w-full"
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            Press <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded">Tab</kbd> to auto-fill
          </div>
        </div>

        <InputField
          label="Career Goal (Optional)"
          name="careerGoal"
          value={formData.careerGoal || ''}
          onChange={handleChange}
          error={errors.careerGoal}
          placeholder="E.g., Seeking a senior developer role in a fintech company"
          readOnly={isReadOnly}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Key Skills
            <Tooltip content="ATS Tip: Applicant Tracking Systems scan this section for keywords from the job description. The more you match, the higher your score. Use the exact wording from the job ad where possible.">
              <button type="button" className="ml-1 text-gray-400 hover:text-gray-500">
                <Info className="w-4 h-4" />
              </button>
            </Tooltip>
          </label>
          <p className="text-xs text-gray-500 mb-2">
            List 8-12 of your most relevant skills. Press Enter or comma to add each skill.
            Include a mix of technical (hard skills) and workplace (soft skills).
          </p>
          
          {!isReadOnly ? (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {keySkills.map((skill, index) => (
                  <div key={index} className="inline-flex items-center bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {skill}
                    <button 
                      type="button" 
                      onClick={() => removeSkill(skill)}
                      className="ml-1.5 text-blue-500 hover:text-blue-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  onBlur={addSkill}
                  placeholder="Type a skill and press Enter"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {keySkills.length} skill{keySkills.length !== 1 ? 's' : ''} added
              </p>
            </>
          ) : (
            <div className="flex flex-wrap gap-2">
              {keySkills.length > 0 ? (
                keySkills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">No skills added yet</p>
              )}
            </div>
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

export default ProfessionalSummarySection;

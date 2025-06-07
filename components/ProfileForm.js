'use client';

import { useState, useEffect } from 'react';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase'; // Assumes firebase.js is located in lib/firebase.js

export default function ProfileForm({ user }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phoneNumber: '',
    linkedinUrl: '',
    location: '',
    visaStatus: 'Australian Citizen',
    professionalSummary: '',
    careerGoal: '',
    keySkills: '',
    
    preferredJobTitles: '',
    desiredIndustry: '',
    availability: 'Immediately Available',
    preferredWorkType: 'Full-time',
    
    workExperience: [],
    education: [],
    certifications: [],
    
    keyStrengths: '',
    culturalFitNotes: '',
    
    volunteerExperience: '',
    languages: '',
    publicationsOrPortfolios: '',
    willingToRelocate: 'No',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Controls multi-step editing
  const [isReviewMode, setIsReviewMode] = useState(false); // Controls full read-only review
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // NEW STATE: Tracks which section is being edited individually
  const [currentEditSectionId, setCurrentEditSectionId] = useState(null); 

  // Define form sections as steps
  const formSteps = [
    { id: 'personal-details', title: 'Personal Details' },
    { id: 'core-story', title: 'Professional Summary & Skills' },
    { id: 'job-preferences', title: 'Job Preferences' },
    { id: 'work-experience', title: 'Work Experience' },
    { id: 'education', title: 'Education' },
    { id: 'certifications', title: 'Certifications & Training' },
    { id: 'customization', title: 'Customization & Fit' },
    { id: 'optional-extras', title: 'Optional Extras' },
  ];

  // Listen for auth state changes to get the current user ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Load existing profile data when the component mounts or user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!isAuthReady || !currentUserId) return;

      try {
        const profileRef = doc(db, 'userProfiles', currentUserId);
        const profileDoc = await getDoc(profileRef);
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          setFormData(prev => ({
            ...prev,
            ...profileData,
            keySkills: Array.isArray(profileData.keySkills)
              ? profileData.keySkills.join(', ')
              : profileData.keySkills || '',
            preferredJobTitles: Array.isArray(profileData.preferredJobTitles)
              ? profileData.preferredJobTitles.join(', ')
              : profileData.preferredJobTitles || '',
            keyStrengths: Array.isArray(profileData.keyStrengths)
              ? profileData.keyStrengths.join(', ')
              : profileData.keyStrengths || '',
            languages: Array.isArray(profileData.languages)
              ? profileData.languages.join(', ')
              : profileData.languages || '',
            publicationsOrPortfolios: Array.isArray(profileData.publicationsOrPortfolios)
              ? profileData.publicationsOrPortfolios.join('\n')
              : profileData.publicationsOrPortfolios || '',

            workExperience: profileData.workExperience || [],
            education: profileData.education || [],
            certifications: profileData.certifications || [],

            willingToRelocate: typeof profileData.willingToRelocate === 'boolean'
              ? (profileData.willingToRelocate ? 'Yes' : 'No')
              : profileData.willingToRelocate || 'No',
          }));
          // If profile exists and we are not in edit mode, go to review mode
          if (!isEditMode && !currentEditSectionId) { // Also check currentEditSectionId
              setIsReviewMode(true);
          }
        } else {
          setFormData({
            fullName: '', email: user?.email || '', phoneNumber: '', linkedinUrl: '', location: '',
            visaStatus: 'Australian Citizen', professionalSummary: '', careerGoal: '', keySkills: '',
            preferredJobTitles: '', desiredIndustry: '', availability: 'Immediately Available', preferredWorkType: 'Full-time',
            workExperience: [],
            education: [],
            certifications: [],
            keyStrengths: '', culturalFitNotes: '', volunteerExperience: '', languages: '', publicationsOrPortfolios: '',
            willingToRelocate: 'No',
          });
          // If no profile, ensure we start in edit mode to fill it out
          setIsEditMode(true);
          setIsReviewMode(false);
          setCurrentEditSectionId(null); // Ensure no single section is being edited
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setSubmitError('Failed to load profile data.');
      }
    };

    loadProfile();
  }, [isAuthReady, currentUserId, user?.email, isEditMode, currentEditSectionId]); // Depend on new state

  // Validation for the current step only (used for multi-step navigation and section save)
  const validateCurrentStep = () => {
    const newErrors = {};
    const stepId = formSteps[currentStep].id; // currentStep is set correctly before calling this function for section save
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (stepId) {
      case 'personal-details':
        if (!formData.fullName?.trim()) newErrors.fullName = 'Full name is required';
        if (!formData.email?.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData.phoneNumber?.trim()) newErrors.phoneNumber = 'Phone number is required';
        if (!formData.location?.trim()) newErrors.location = 'Location is required';
        break;
      case 'core-story':
        if (!formData.professionalSummary?.trim()) newErrors.professionalSummary = 'Professional summary is required';
        if (!formData.keySkills?.trim()) newErrors.keySkills = 'Key skills are required';
        break;
      case 'job-preferences':
        if (!formData.preferredJobTitles?.trim()) newErrors.preferredJobTitles = 'Preferred job titles are required';
        if (!formData.desiredIndustry?.trim()) newErrors.desiredIndustry = 'Desired industry is required';
        break;
      case 'work-experience':
        formData.workExperience.forEach((role, index) => {
          if (!role.title?.trim()) newErrors[`workExperience.${index}.title`] = 'Job title is required';
          if (!role.company?.trim()) newErrors[`workExperience.${index}.company`] = 'Company name is required';
          if (!role.summary?.trim()) newErrors[`workExperience.${index}.summary`] = 'Please provide role details';
          if (!role.location?.trim()) newErrors[`workExperience.${index}.location`] = 'Work location is required';
          
          if (!role.startDate?.trim()) {
            newErrors[`workExperience.${index}.startDate`] = 'Start Date is required';
          } else {
            const startDate = new Date(role.startDate);
            if (startDate > today) {
                newErrors[`workExperience.${index}.startDate`] = 'Start Date cannot be in the future';
            }
          }
          if (role.endDate !== 'Present') {
              if (!role.endDate?.trim()) {
                  newErrors[`workExperience.${index}.endDate`] = 'End Date is required or select Present';
              } else {
                  const endDate = new Date(role.endDate);
                  if (endDate > today) {
                      newErrors[`workExperience.${index}.endDate`] = 'End Date cannot be in the future';
                  }
                  if (role.startDate && new Date(role.startDate) > endDate) {
                      newErrors[`workExperience.${index}.endDate`] = 'End Date cannot be before Start Date';
                  }
              }
          }
        });
        if (formData.workExperience.length === 0) {
          newErrors['workExperience.minimum'] = 'At least one work experience entry is required.';
        }
        break;
      case 'education':
        formData.education.forEach((edu, index) => {
          if (!edu.qualification?.trim()) newErrors[`education.${index}.qualification`] = 'Qualification is required';
          if (!edu.institution?.trim()) newErrors[`education.${index}.institution`] = 'Institution name is required';
          
          if (!edu.startDate?.trim()) {
            newErrors[`education.${index}.startDate`] = 'Start Date is required';
          } else {
            const startDate = new Date(edu.startDate);
            if (startDate > today) {
                newErrors[`education.${index}.startDate`] = 'Start Date cannot be in the future';
            }
          }
          if (edu.endDate !== 'Present') { // Assuming 'Present' for education also
              if (!edu.endDate?.trim()) {
                  newErrors[`education.${index}.endDate`] = 'End Date is required or select Expected';
              } else {
                  const endDate = new Date(edu.endDate);
                  if (endDate > today) {
                      newErrors[`education.${index}.endDate`] = 'End Date cannot be in the future';
                  }
                  if (edu.startDate && new Date(edu.startDate) > endDate) {
                      newErrors[`education.${index}.endDate`] = 'End Date cannot be before Start Date';
                  }
              }
          }
        });
        break;
      case 'certifications':
        formData.certifications.forEach((cert, index) => {
          if (!cert.name?.trim()) newErrors[`certifications.${index}.name`] = 'Certification Name is required';
          if (!cert.issuer?.trim()) newErrors[`certifications.${index}.issuer`] = 'Issuer is required';
          if (!cert.year?.trim()) {
            newErrors[`certifications.${index}.year`] = 'Year is required';
          } else {
            const currentYear = new Date().getFullYear();
            const certYear = parseInt(cert.year);
            if (isNaN(certYear) || String(certYear).length !== 4) {
                newErrors[`certifications.${index}.year`] = 'Year must be a 4-digit number';
            } else if (certYear > currentYear) {
                newErrors[`certifications.${index}.year`] = 'Year cannot be in the future';
            }
          }
        });
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === 'radio') {
      newValue = checked ? value : formData[name];
    }

    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.includes('.')) {
      const parts = name.split('.');
      const parent = parts[0];
      const indexOrChild = parts[1];
      const child = parts[2];

      if (child !== undefined) {
        setFormData(prev => {
          const newArray = [...prev[parent]];
          newArray[parseInt(indexOrChild)] = {
            ...newArray[parseInt(indexOrChild)],
            [child]: newValue,
          };
          return {
            ...prev,
            [parent]: newArray,
          };
        });
      } else {
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [indexOrChild]: newValue,
          },
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
      }));
    }
  };

  const addWorkExperience = () => {
    setFormData(prev => ({
      ...prev,
      workExperience: [
        ...prev.workExperience,
        { title: '', company: '', summary: '', location: '', startDate: '', endDate: '' }
      ]
    }));
    if (errors['workExperience.minimum']) {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors['workExperience.minimum'];
            return newErrors;
        });
    }
  };

  const removeWorkExperience = (indexToRemove) => {
    setFormData(prev => {
      const updatedExperience = prev.workExperience.filter((_, index) => index !== indexToRemove);
      return {
        ...prev,
        workExperience: updatedExperience
      };
    });
    setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith(`workExperience.${indexToRemove}.`)) {
                delete newErrors[key];
            }
        });
        if (formData.workExperience.filter((_, index) => index !== indexToRemove).length === 0) {
            newErrors['workExperience.minimum'] = 'At least one work experience entry is required.';
        }
        return newErrors;
    });
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { qualification: '', institution: '', location: '', startDate: '', endDate: '', honors: '' }
      ]
    }));
  };

  const removeEducation = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, index) => index !== indexToRemove)
    }));
    setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith(`education.${indexToRemove}.`)) {
                delete newErrors[key];
            }
        });
        return newErrors;
    });
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: '', issuer: '', year: '' }
      ]
    }));
  };

  const removeCertification = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, index) => index !== indexToRemove)
    }));
    setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith(`certifications.${indexToRemove}.`)) {
                delete newErrors[key];
            }
        });
        return newErrors;
    });
  };


  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, formSteps.length - 1));
      setSubmitError('');
    } else {
        setSubmitError('Please correct the errors in this section before proceeding.');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    setSubmitError('');
    setErrors({});
  };

  // Modified handleSectionEdit to activate single-section editing
  const handleSectionEdit = (stepIndex) => {
    setIsReviewMode(false); // Exit review mode
    setIsEditMode(true);    // Enter general edit mode
    setCurrentStep(stepIndex); // Go to the specific step for display logic
    setCurrentEditSectionId(formSteps[stepIndex].id); // Set the specific section ID for editing
    setSubmitError(''); // Clear any previous submission errors
    setErrors({}); // Clear errors
  };

  // NEW FUNCTION: Handle saving a single section or the current multi-step section
  const handleSaveSection = async () => {
    // Determine which section to save/validate based on current state
    const sectionToValidateIndex = currentEditSectionId
        ? formSteps.findIndex(step => step.id === currentEditSectionId)
        : currentStep; // Use currentStep if in multi-step flow

    if (sectionToValidateIndex === -1) {
        setSubmitError('Error: Section not found for saving.');
        return;
    }

    // Temporarily set currentStep to the index of the section being saved
    // This allows validateCurrentStep to validate only the relevant section.
    const originalCurrentStep = currentStep;
    setCurrentStep(sectionToValidateIndex);

    if (!validateCurrentStep()) {
        setSubmitError('Please correct the errors in this section before saving.');
        setCurrentStep(originalCurrentStep); // Restore currentStep after validation attempt
        return;
    }
    setCurrentStep(originalCurrentStep); // Restore currentStep after successful validation

    if (!currentUserId) {
        setSubmitError('User is not authenticated. Cannot save.');
        return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const profileData = {
        ...formData,
        userId: currentUserId,
        email: formData.email,
        keySkills: formData.keySkills.split(',').map(skill => skill.trim()).filter(Boolean),
        preferredJobTitles: formData.preferredJobTitles.split(',').map(title => title.trim()).filter(Boolean),
        keyStrengths: formData.keyStrengths.split(',').map(strength => strength.trim()).filter(Boolean),
        languages: formData.languages.split(',').map(lang => lang.trim()).filter(Boolean),
        publicationsOrPortfolios: formData.publicationsOrPortfolios.split('\n').map(url => url.trim()).filter(Boolean),

        willingToRelocate: formData.willingToRelocate === 'Yes',
        profileLastUpdated: serverTimestamp(),
        profileCompleteness: 1
      };

      const cleanedProfileData = { ...profileData };
      if (cleanedProfileData.mostRecentRole) delete cleanedProfileData.mostRecentRole;
      if (cleanedProfileData.education_single) delete cleanedProfileData.education_single;
      if (cleanedProfileData.certification_single) delete cleanedProfileData.certification_single;


      const profileRef = doc(db, 'userProfiles', currentUserId);
      // setDoc with merge: true will update only the fields provided,
      // which effectively saves the current state of formData.
      await setDoc(profileRef, cleanedProfileData, { merge: true });

      setSubmitSuccess(true);
      // If it was a single section edit, go back to review mode
      if (currentEditSectionId) {
          setIsEditMode(false);
          setIsReviewMode(true);
          setCurrentEditSectionId(null); // Clear the specific section being edited
      }
      // If it was a save from multi-step, stay in multi-step mode (no state change)
      console.log("Section saved successfully.");

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving section:', error);
      setSubmitError(error.message || 'Failed to save section. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW FUNCTION: Handle cancelling section edit
  const handleCancelSectionEdit = () => {
    setIsEditMode(false);
    setIsReviewMode(true);
    setCurrentEditSectionId(null); // Clear the specific section being edited
    setCurrentStep(0); // Optionally reset current step to first section for review mode
    setErrors({}); // Clear any errors
    setSubmitError(''); // Clear any submit errors
    // Optionally, reload profile data here if changes were made but not saved, to revert.
    // However, for simplicity, we'll assume the form state is already correct from initial load.
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const allFormErrors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Full form validation loop
    formSteps.forEach((step, stepIdx) => {
      // Temporarily set currentStep for comprehensive validation
      const originalCurrentStep = currentStep;
      setCurrentStep(stepIdx); // Set to current step in the loop for validation
      const stepErrors = {};
      
      switch (step.id) {
          case 'personal-details':
            if (!formData.fullName?.trim()) stepErrors.fullName = 'Full name is required';
            if (!formData.email?.trim()) {
              stepErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
              stepErrors.email = 'Please enter a valid email address';
            }
            if (!formData.phoneNumber?.trim()) stepErrors.phoneNumber = 'Phone number is required';
            if (!formData.location?.trim()) stepErrors.location = 'Location is required';
            break;
          case 'core-story':
            if (!formData.professionalSummary?.trim()) stepErrors.professionalSummary = 'Professional summary is required';
            if (!formData.keySkills?.trim()) stepErrors.keySkills = 'Key skills are required';
            break;
          case 'job-preferences':
            if (!formData.preferredJobTitles?.trim()) stepErrors.preferredJobTitles = 'Preferred job titles are required';
            if (!formData.desiredIndustry?.trim()) stepErrors.desiredIndustry = 'Desired industry is required';
            break;
          case 'work-experience':
            formData.workExperience.forEach((role, index) => {
              if (!role.title?.trim()) stepErrors[`workExperience.${index}.title`] = 'Job title is required';
              if (!role.company?.trim()) stepErrors[`workExperience.${index}.company`] = 'Company name is required';
              if (!role.summary?.trim()) stepErrors[`workExperience.${index}.summary`] = 'Please provide role details';
              if (!role.location?.trim()) stepErrors[`workExperience.${index}.location`] = 'Work location is required';
              
              if (!role.startDate?.trim()) {
                stepErrors[`workExperience.${index}.startDate`] = 'Start Date is required';
              } else {
                const startDate = new Date(role.startDate);
                if (startDate > today) {
                    stepErrors[`workExperience.${index}.startDate`] = 'Start Date cannot be in the future';
                }
              }
              if (role.endDate !== 'Present') {
                  if (!role.endDate?.trim()) {
                      stepErrors[`workExperience.${index}.endDate`] = 'End Date is required or select Present';
                  } else {
                      const endDate = new Date(role.endDate);
                      if (endDate > today) {
                          stepErrors[`workExperience.${index}.endDate`] = 'End Date cannot be in the future';
                      }
                      if (role.startDate && new Date(role.startDate) > endDate) {
                          stepErrors[`workExperience.${index}.endDate`] = 'End Date cannot be before Start Date';
                      }
                  }
              }
            });
            if (formData.workExperience.length === 0) {
              stepErrors['workExperience.minimum'] = 'At least one work experience entry is required.';
            }
            break;
          case 'education':
            formData.education.forEach((edu, index) => {
              if (!edu.qualification?.trim()) stepErrors[`education.${index}.qualification`] = 'Qualification is required';
              if (!edu.institution?.trim()) stepErrors[`education.${index}.institution`] = 'Institution name is required';
              
              if (!edu.startDate?.trim()) {
                stepErrors[`education.${index}.startDate`] = 'Start Date is required';
              } else {
                const startDate = new Date(edu.startDate);
                if (startDate > today) {
                    stepErrors[`education.${index}.startDate`] = 'Start Date cannot be in the future';
                }
              }
              if (edu.endDate !== 'Present') {
                  if (!edu.endDate?.trim()) {
                      stepErrors[`education.${index}.endDate`] = 'End Date is required or select Expected';
                  } else {
                      const endDate = new Date(edu.endDate);
                      if (endDate > today) {
                          stepErrors[`education.${index}.endDate`] = 'End Date cannot be in the future';
                      }
                      if (edu.startDate && new Date(edu.startDate) > endDate) {
                          stepErrors[`education.${index}.endDate`] = 'End Date cannot be before Start Date';
                      }
                  }
              }
            });
            break;
          case 'certifications':
            formData.certifications.forEach((cert, index) => {
              if (!cert.name?.trim()) stepErrors[`certifications.${index}.name`] = 'Certification Name is required';
              if (!cert.issuer?.trim()) stepErrors[`certifications.${index}.issuer`] = 'Issuer is required';
              if (!cert.year?.trim()) {
                stepErrors[`certifications.${index}.year`] = 'Year is required';
              } else {
                const currentYear = new Date().getFullYear();
                const certYear = parseInt(cert.year);
                if (isNaN(certYear) || String(certYear).length !== 4) {
                    stepErrors[`certifications.${index}.year`] = 'Year must be a 4-digit number';
                } else if (certYear > currentYear) {
                    stepErrors[`certifications.${index}.year`] = 'Year cannot be in the future';
                }
              }
            });
            break;
      }
      Object.assign(allFormErrors, stepErrors);
      setCurrentStep(originalCurrentStep); // Restore currentStep after each section validation
    });

    setErrors(allFormErrors);
    if (Object.keys(allFormErrors).length > 0) {
        setSubmitError('Please correct all errors before submitting. You may need to revisit previous sections.');
        const firstStepWithError = formSteps.findIndex(step => 
            Object.keys(allFormErrors).some(errorKey => {
                const sectionIdCleaned = step.id.replace(/-/g, '');
                // Improved regex to handle cases where errorKey matches a top-level field for a step
                // or a nested field within a step (e.g., 'fullName' or 'workExperience.0.title')
                const regex = new RegExp(`^${sectionIdCleaned}(\\..*)?$`, 'i');
                return regex.test(errorKey) || (step.id === 'work-experience' && allFormErrors['workExperience.minimum']);
            })
        );
        if (firstStepWithError !== -1) {
            setCurrentStep(firstStepWithError);
        }
        return;
    }

    if (!currentUserId) {
      setSubmitError('User is not authenticated.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      const profileData = {
        ...formData,
        userId: currentUserId,
        email: formData.email,
        keySkills: formData.keySkills.split(',').map(skill => skill.trim()).filter(Boolean),
        preferredJobTitles: formData.preferredJobTitles.split(',').map(title => title.trim()).filter(Boolean),
        keyStrengths: formData.keyStrengths.split(',').map(strength => strength.trim()).filter(Boolean),
        languages: formData.languages.split(',').map(lang => lang.trim()).filter(Boolean),
        publicationsOrPortfolios: formData.publicationsOrPortfolios.split('\n').map(url => url.trim()).filter(Boolean),

        willingToRelocate: formData.willingToRelocate === 'Yes',
        profileLastUpdated: serverTimestamp(),
        profileCompleteness: 1
      };

      const cleanedProfileData = { ...profileData };
      if (cleanedProfileData.mostRecentRole) delete cleanedProfileData.mostRecentRole;
      if (cleanedProfileData.education_single) delete cleanedProfileData.education_single;
      if (cleanedProfileData.certification_single) delete cleanedProfileData.certification_single;


      const profileRef = doc(db, 'userProfiles', currentUserId);
      await setDoc(profileRef, cleanedProfileData, { merge: true });

      setSubmitSuccess(true);
      setIsEditMode(false); // Exit edit mode
      setIsReviewMode(true); // Enter review mode
      console.log("Profile saved successfully.");

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error saving profile:', error);
      setSubmitError(error.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSection = formSteps.find(step => step.id === currentEditSectionId);

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        {/* Header with Title and Edit Mode Toggle */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Your PathwayAI Profile</h1>
            <p className="text-gray-600">
              {isEditMode
                ? (currentEditSectionId ? `Editing: ${currentSection?.title}` : "Edit your profile information below.")
                : (isReviewMode ? "Review your profile information." : "View and manage your profile information.")}
            </p>
          </div>
        </div>

        {/* Progress Indicator (only visible in multi-step edit mode) */}
        {isEditMode && !currentEditSectionId && (
            <div className="mb-8">
                <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                    <span>Step {currentStep + 1} of {formSteps.length}</span>
                    <span>{formSteps[currentStep].title}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out"
                    style={{ width: `${((currentStep + 1) / formSteps.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        )}

        <form onSubmit={currentEditSectionId ? handleSaveSection : handleSubmit} className="space-y-6">
          {submitError && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {submitError}
            </div>
          )}

          {/* Conditional Rendering based on mode */}
          {isReviewMode ? (
            // Review Mode: All sections visible and locked
            <div className="space-y-6">
              {formSteps.map((step, index) => (
                <SectionWrapper
                  key={step.id}
                  title={step.title}
                  readOnly={true} // Always read-only in review mode
                  onEdit={() => handleSectionEdit(index)} // Pass handleSectionEdit
                  showEditButton={true} // Explicitly show edit button for each section
                >
                  {/* Render content of each section here, based on step.id */}
                  {step.id === 'personal-details' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Full Name" name="fullName" value={formData.fullName} readOnly={true} />
                      <InputField label="Email Address" name="email" type="email" value={formData.email} readOnly={true} />
                      <InputField label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} readOnly={true} />
                      <InputField label="LinkedIn Profile URL (Optional)" name="linkedinUrl" type="url" value={formData.linkedinUrl} readOnly={true} />
                      <InputField label="Current Location (e.g., Sydney, NSW)" name="location" value={formData.location} readOnly={true} />
                      <SelectField label="Citizenship / Visa Status" name="visaStatus" value={formData.visaStatus} options={['Australian Citizen', 'Permanent Resident', 'Student Visa (Subclass 500)', 'Temporary Skill Trade Visa (Subclass 482)', 'Other']} readOnly={true} />
                    </div>
                  )}

                  {step.id === 'core-story' && (
                    <>
                      <TextareaField label="Professional Summary" name="professionalSummary" value={formData.professionalSummary} readOnly={true} />
                      <InputField label="Career Goal (Optional)" name="careerGoal" value={formData.careerGoal} readOnly={true} className="mt-6" />
                      <InputField label="Key Skills (comma-separated)" name="keySkills" value={formData.keySkills} readOnly={true} className="mt-6" />
                    </>
                  )}

                  {step.id === 'job-preferences' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InputField label="Preferred Job Titles (comma-separated)" name="preferredJobTitles" value={formData.preferredJobTitles} readOnly={true} />
                      <InputField label="Desired Industry / Sector" name="desiredIndustry" value={formData.desiredIndustry} readOnly={true} />
                      <SelectField label="Availability" name="availability" value={formData.availability} options={['Immediately Available', '1-2 Weeks Notice', '3-4 Weeks Notice', 'Negotiable']} readOnly={true} />
                      <SelectField label="Preferred Work Type" name="preferredWorkType" value={formData.preferredWorkType} options={['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid']} readOnly={true} />
                    </div>
                  )}

                  {step.id === 'work-experience' && (
                    <>
                      {formData.workExperience.length === 0 && (
                          <p className="text-gray-500 italic mb-4">No work experience added yet.</p>
                      )}
                      {formData.workExperience.map((role, roleIndex) => (
                        <div key={roleIndex} className="space-y-4 border border-gray-200 p-4 rounded-md relative bg-gray-50">
                          <h3 className="text-lg font-medium text-gray-700 mb-3">Role {roleIndex + 1}</h3>
                          <InputField label="Job Title" name={`workExperience.${roleIndex}.title`} value={role.title} readOnly={true} />
                          <InputField label="Company" name={`workExperience.${roleIndex}.company`} value={role.company} readOnly={true} />
                          <InputField label="Location (City, State)" name={`workExperience.${roleIndex}.location`} value={role.location} readOnly={true} />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Start Date (YYYY-MM-DD)" name={`workExperience.${roleIndex}.startDate`} type="date" value={role.startDate} readOnly={true} />
                            <InputField label="End Date (YYYY-MM-DD) or 'Present'" name={`workExperience.${roleIndex}.endDate`} type="date" value={role.endDate} readOnly={true} dateFieldType="work" />
                          </div>
                          <TextareaField label="Key Responsibilities / Achievements" name={`workExperience.${roleIndex}.summary`} value={role.summary} rows={4} readOnly={true} />
                        </div>
                      ))}
                    </>
                  )}

                  {step.id === 'education' && (
                    <>
                      {formData.education.length === 0 && (
                          <p className="text-gray-500 italic mb-4">No education entries added yet.</p>
                      )}
                      {formData.education.map((edu, eduIndex) => (
                        <div key={eduIndex} className="space-y-4 border border-gray-200 p-4 rounded-md relative bg-gray-50">
                          <h3 className="text-lg font-medium text-gray-700 mb-3">Education {eduIndex + 1}</h3>
                          <InputField label="Qualification" name={`education.${eduIndex}.qualification`} value={edu.qualification} readOnly={true} />
                          <InputField label="Institution Name" name={`education.${eduIndex}.institution`} value={edu.institution} readOnly={true} />
                          <InputField label="Location (Optional)" name={`education.${eduIndex}.location`} value={edu.location} readOnly={true} />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Start Date (YYYY-MM-DD)" name={`education.${eduIndex}.startDate`} type="date" value={edu.startDate} readOnly={true} />
                            <InputField label="End Date (YYYY-MM-DD) or 'Expected'" name={`education.${eduIndex}.endDate`} type="date" value={edu.endDate} readOnly={true} dateFieldType="education" />
                          </div>
                          <InputField label="Honours / Distinctions (Optional)" name={`education.${eduIndex}.honors`} value={edu.honors} readOnly={true} />
                        </div>
                      ))}
                    </>
                  )}

                  {step.id === 'certifications' && (
                    <>
                      {formData.certifications.length === 0 && (
                          <p className="text-gray-500 italic mb-4">No certifications added yet.</p>
                      )}
                      {formData.certifications.map((cert, certIndex) => (
                        <div key={certIndex} className="space-y-4 border border-gray-200 p-4 rounded-md relative bg-gray-50">
                          <h3 className="text-lg font-medium text-gray-700 mb-3">Certification {certIndex + 1}</h3>
                          <InputField label="Certification Name" name={`certifications.${certIndex}.name`} value={cert.name} readOnly={true} />
                          <InputField label="Issuer" name={`certifications.${certIndex}.issuer`} value={cert.issuer} readOnly={true} />
                          <InputField label="Year" name={`certifications.${certIndex}.year`} type="number" value={cert.year} readOnly={true} />
                        </div>
                      ))}
                    </>
                  )}

                  {step.id === 'customization' && (
                    <>
                      <InputField label="Key Strengths / Keywords for AI (comma-separated)" name="keyStrengths" value={formData.keyStrengths} readOnly={true} />
                      <TextareaField label="Specific Values or Cultural Fit Notes (Optional)" name="culturalFitNotes" value={formData.culturalFitNotes} rows={3} readOnly={true} />
                    </>
                  )}

                  {step.id === 'optional-extras' && (
                    <>
                      <TextareaField label="Volunteer Experience (Optional)" name="volunteerExperience" value={formData.volunteerExperience} rows={3} readOnly={true} />
                      <InputField label="Languages (comma-separated, e.g., English, Spanish, French)" name="languages" value={formData.languages} readOnly={true} />
                      <TextareaField label="Publications or Portfolios (URLs, one per line)" name="publicationsOrPortfolios" value={formData.publicationsOrPortfolios} rows={4} readOnly={true} />
                      <RadioGroupField label="Willing to Relocate?" name="willingToRelocate" value={formData.willingToRelocate} options={['Yes', 'No']} readOnly={true} />
                    </>
                  )}
                </SectionWrapper>
              ))}
            </div>
          ) : (
            // Edit Mode: Either single-section or multi-step form
            <div className="transition-transform duration-500 ease-in-out">
              {currentEditSectionId ? (
                // Single-section edit mode: Wrapped in an extra fragment to help parser
                <>
                  <SectionWrapper
                    title={currentSection?.title}
                    readOnly={!isEditMode}
                  >
                    {currentEditSectionId === 'personal-details' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} required readOnly={!isEditMode} />
                        <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required readOnly={!isEditMode} />
                        <InputField label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber} required readOnly={!isEditMode} />
                        <InputField label="LinkedIn Profile URL (Optional)" name="linkedinUrl" type="url" value={formData.linkedinUrl} onChange={handleChange} placeholder="e.g., https://linkedin.com/in/yourprofile" error={errors.linkedinUrl} readOnly={!isEditMode} />
                        <InputField label="Current Location (e.g., Sydney, NSW)" name="location" value={formData.location} onChange={handleChange} error={errors.location} required readOnly={!isEditMode} />
                        <SelectField label="Citizenship / Visa Status" name="visaStatus" value={formData.visaStatus} onChange={handleChange} options={['Australian Citizen', 'Permanent Resident', 'Student Visa (Subclass 500)', 'Temporary Skill Trade Visa (Subclass 482)', 'Other']} readOnly={!isEditMode} />
                      </div>
                    )}

                    {currentEditSectionId === 'core-story' && (
                      <>
                        <TextareaField label="Professional Summary" name="professionalSummary" value={formData.professionalSummary} onChange={handleChange} placeholder="A 3-5 sentence summary of your experience, goals, and strengths." error={errors.professionalSummary} required readOnly={!isEditMode} />
                        <InputField label="Career Goal (Optional)" name="careerGoal" value={formData.careerGoal} onChange={handleChange} placeholder="e.g., To become a Senior Software Engineer" error={errors.careerGoal} className="mt-6" readOnly={!isEditMode} />
                        <InputField label="Key Skills (comma-separated)" name="keySkills" value={formData.keySkills} onChange={handleChange} placeholder="e.g., React, Node.js, Project Management" error={errors.keySkills} required className="mt-6" readOnly={!isEditMode} />
                      </>
                    )}

                    {currentEditSectionId === 'job-preferences' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Preferred Job Titles (comma-separated)" name="preferredJobTitles" value={formData.preferredJobTitles} onChange={handleChange} error={errors.preferredJobTitles} required readOnly={!isEditMode} />
                        <InputField label="Desired Industry / Sector" name="desiredIndustry" value={formData.desiredIndustry} onChange={handleChange} error={errors.desiredIndustry} required readOnly={!isEditMode} />
                        <SelectField label="Availability" name="availability" value={formData.availability} onChange={handleChange} options={['Immediately Available', '1-2 Weeks Notice', '3-4 Weeks Notice', 'Negotiable']} readOnly={!isEditMode} />
                        <SelectField label="Preferred Work Type" name="preferredWorkType" value={formData.preferredWorkType} onChange={handleChange} options={['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid']} readOnly={!isEditMode} />
                      </div>
                    )}

                    {currentEditSectionId === 'work-experience' && (
                      <>
                        {isEditMode && (
                            <button type="button" onClick={addWorkExperience} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Add Work Experience
                            </button>
                        )}
                        {formData.workExperience.length === 0 && !isEditMode && (
                            <p className="text-gray-500 italic mb-4">No work experience added yet. Click "Add Work Experience" to begin.</p>
                        )}
                        {formData.workExperience.map((role, index) => (
                          <div key={index} className="space-y-4 border border-gray-200 p-4 rounded-md mb-4 relative bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-700 mb-3">Role {index + 1}</h3>
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={() => removeWorkExperience(index)}
                                className="absolute top-2 right-2 p-1 text-red-600 hover:text-red-800 rounded-full transition duration-200"
                                title="Remove Role"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            )}
                            <InputField label="Job Title" name={`workExperience.${index}.title`} value={role.title} onChange={handleChange} error={errors[`workExperience.${index}.title`]} required readOnly={!isEditMode} />
                            <InputField label="Company" name={`workExperience.${index}.company`} value={role.company} onChange={handleChange} error={errors[`workExperience.${index}.company`]} required readOnly={!isEditMode} />
                            <InputField label="Location (City, State)" name={`workExperience.${index}.location`} value={role.location} onChange={handleChange} error={errors[`workExperience.${index}.location`]} required readOnly={!isEditMode} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Start Date (YYYY-MM-DD)" name={`workExperience.${index}.startDate`} type="date" value={role.startDate} onChange={handleChange} error={errors[`workExperience.${index}.startDate`]} required readOnly={!isEditMode} />
                              <div className="flex items-end">
                                <InputField label="End Date (YYYY-MM-DD) or 'Present'" name={`workExperience.${index}.endDate`} type="date" value={role.endDate} onChange={handleChange} error={errors[`workExperience.${index}.endDate`]} readOnly={!isEditMode} className="flex-grow" dateFieldType="work" />
                                {isEditMode && role.endDate !== 'Present' && (
                                    <button type="button" onClick={() => handleChange({ target: { name: `workExperience.${index}.endDate`, value: 'Present' }})} className="ml-2 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Present</button>
                                )}
                              </div>
                            </div>
                            <TextareaField label="Key Responsibilities / Achievements" name={`workExperience.${index}.summary`} value={role.summary} onChange={handleChange} rows={4} placeholder="Use bullet points or a short paragraph." error={errors[`workExperience.${index}.summary`]} required readOnly={!isEditMode} />
                          </div>
                        ))}
                        {errors['workExperience.minimum'] && <p className="mt-1 text-sm text-red-600">{errors['workExperience.minimum']}</p>}
                      </>
                    )}

                    {currentEditSectionId === 'education' && (
                      <>
                         {isEditMode && (
                            <button type="button" onClick={addEducation} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Add Education
                            </button>
                        )}
                        {formData.education.length === 0 && !isEditMode && (
                            <p className="text-gray-500 italic mb-4">No education entries added yet.</p>
                        )}
                        {formData.education.map((edu, eduIndex) => (
                          <div key={eduIndex} className="space-y-4 border border-gray-200 p-4 rounded-md mb-4 relative bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-700 mb-3">Education {eduIndex + 1}</h3>
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={() => removeEducation(eduIndex)}
                                className="absolute top-2 right-2 p-1 text-red-600 hover:text-red-800 rounded-full transition duration-200"
                                title="Remove Education"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            )}
                            <InputField label="Qualification (e.g., Bachelor of IT)" name={`education.${eduIndex}.qualification`} value={edu.qualification} onChange={handleChange} error={errors[`education.${eduIndex}.qualification`]} readOnly={!isEditMode} />
                            <InputField label="Institution Name" name={`education.${eduIndex}.institution`} value={edu.institution} onChange={handleChange} error={errors[`education.${eduIndex}.institution`]} readOnly={!isEditMode} />
                            <InputField label="Location (Optional)" name={`education.${eduIndex}.location`} value={edu.location} onChange={handleChange} error={errors[`education.${eduIndex}.location`]} readOnly={!isEditMode} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <InputField label="Start Date (YYYY-MM-DD)" name={`education.${eduIndex}.startDate`} type="date" value={edu.startDate} onChange={handleChange} error={errors[`education.${eduIndex}.startDate`]} readOnly={!isEditMode} />
                              <div className="flex items-end">
                                <InputField label="End Date (YYYY-MM-DD) or 'Expected'" name={`education.${eduIndex}.endDate`} type="date" value={edu.endDate} onChange={handleChange} error={errors[`education.${eduIndex}.endDate`]} readOnly={!isEditMode} className="flex-grow" dateFieldType="education" />
                                {isEditMode && edu.endDate !== 'Present' && ( // "Present" for education is "Expected"
                                  <button type="button" onClick={() => handleChange({ target: { name: `education.${eduIndex}.endDate`, value: 'Present' }})} className="ml-2 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Expected</button>
                                )}
                              </div>
                            </div>
                            <InputField label="Honours / Distinctions (Optional)" name={`education.${eduIndex}.honors`} value={edu.honors} onChange={handleChange} error={errors[`education.${eduIndex}.honors`]} readOnly={!isEditMode} />
                          </div>
                        ))}
                      </>
                    )}

                    {currentEditSectionId === 'certifications' && (
                      <>
                        {isEditMode && (
                            <button type="button" onClick={addCertification} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                                Add Certification
                            </button>
                        )}
                        {formData.certifications.length === 0 && !isEditMode && (
                            <p className="text-gray-500 italic mb-4">No certifications added yet.</p>
                        )}
                        {formData.certifications.map((cert, certIndex) => (
                          <div key={certIndex} className="space-y-4 border border-gray-200 p-4 rounded-md mb-4 relative bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-700 mb-3">Certification {certIndex + 1}</h3>
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={() => removeCertification(certIndex)}
                                className="absolute top-2 right-2 p-1 text-red-600 hover:text-red-800 rounded-full transition duration-200"
                                title="Remove Certification"
                              >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                              </button>
                            )}
                            <InputField label="Certification Name" name={`certifications.${certIndex}.name`} value={cert.name} onChange={handleChange} error={errors[`certifications.${certIndex}.name`]} readOnly={!isEditMode} />
                            <InputField label="Issuer" name={`certifications.${certIndex}.issuer`} value={cert.issuer} onChange={handleChange} error={errors[`certifications.${certIndex}.issuer`]} readOnly={!isEditMode} />
                            <InputField label="Year" name={`certifications.${certIndex}.year`} type="number" value={cert.year} onChange={handleChange} placeholder="YYYY" error={errors[`certifications.${certIndex}.year`]} readOnly={!isEditMode} />
                          </div>
                        ))}
                      </>
                    )}

                    {currentEditSectionId === 'customization' && (
                      <>
                        <InputField label="Key Strengths / Keywords for AI (comma-separated)" name="keyStrengths" value={formData.keyStrengths} onChange={handleChange} error={errors.keyStrengths} readOnly={!isEditMode} />
                        <TextareaField label="Specific Values or Cultural Fit Notes (Optional)" name="culturalFitNotes" value={formData.culturalFitNotes} onChange={handleChange} placeholder="Describe what kind of company culture you thrive in, or values important to you." rows={3} error={errors.culturalFitNotes} className="mt-6" readOnly={!isEditMode} />
                      </>
                    )}

                    {currentEditSectionId === 'optional-extras' && (
                      <>
                        <TextareaField label="Volunteer Experience (Optional)" name="volunteerExperience" value={formData.volunteerExperience} onChange={handleChange} placeholder="Briefly describe your volunteer work." rows={3} error={errors.volunteerExperience} readOnly={!isEditMode} />
                        <InputField label="Languages (comma-separated, e.g., English, Spanish, French)" name="languages" value={formData.languages} onChange={handleChange} error={errors.languages} className="mt-6" readOnly={!isEditMode} />
                        <TextareaField label="Publications or Portfolios (URLs, one per line)" name="publicationsOrPortfolios" value={formData.publicationsOrPortfolios} onChange={handleChange} placeholder="https://yourportfolio.com&#10;https://github.com/yourrepo" rows={4} error={errors.publicationsOrPortfolios} className="mt-6" readOnly={!isEditMode} />
                        <RadioGroupField label="Willing to Relocate?" name="willingToRelocate" value={formData.willingToRelocate} onChange={handleChange} options={['Yes', 'No']} readOnly={!isEditMode} className="mt-6" />
                      </>
                    )}
                  </SectionWrapper>
                </> // Closing the extra fragment for single-section edit mode
              ) : (
                // Multi-step edit mode
                <>
                  {currentStep === 0 && (
                    <SectionWrapper title="Personal Details" readOnly={!isEditMode}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Full Name" name="fullName" value={formData.fullName} onChange={handleChange} error={errors.fullName} required readOnly={!isEditMode} />
                        <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} required readOnly={!isEditMode} />
                        <InputField label="Phone Number" name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleChange} error={errors.phoneNumber} required readOnly={!isEditMode} />
                        <InputField label="LinkedIn Profile URL (Optional)" name="linkedinUrl" type="url" value={formData.linkedinUrl} onChange={handleChange} placeholder="e.g., https://linkedin.com/in/yourprofile" error={errors.linkedinUrl} readOnly={!isEditMode} />
                        <InputField label="Current Location (e.g., Sydney, NSW)" name="location" value={formData.location} onChange={handleChange} error={errors.location} required readOnly={!isEditMode} />
                        <SelectField label="Citizenship / Visa Status" name="visaStatus" value={formData.visaStatus} onChange={handleChange} options={['Australian Citizen', 'Permanent Resident', 'Student Visa (Subclass 500)', 'Temporary Skill Trade Visa (Subclass 482)', 'Other']} readOnly={!isEditMode} />
                      </div>
                    </SectionWrapper>
                  )}

                  {currentStep === 1 && (
                    <SectionWrapper title="Your Core Story" readOnly={!isEditMode}>
                      <TextareaField label="Professional Summary" name="professionalSummary" value={formData.professionalSummary} onChange={handleChange} placeholder="A 3-5 sentence summary of your experience, goals, and strengths." error={errors.professionalSummary} required readOnly={!isEditMode} />
                      <InputField label="Career Goal (Optional)" name="careerGoal" value={formData.careerGoal} onChange={handleChange} placeholder="e.g., To become a Senior Software Engineer" error={errors.careerGoal} className="mt-6" readOnly={!isEditMode} />
                      <InputField label="Key Skills (comma-separated)" name="keySkills" value={formData.keySkills} onChange={handleChange} placeholder="e.g., React, Node.js, Project Management" error={errors.keySkills} required className="mt-6" readOnly={!isEditMode} />
                    </SectionWrapper>
                  )}

                  {currentStep === 2 && (
                    <SectionWrapper title="Job Preferences" readOnly={!isEditMode}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField label="Preferred Job Titles (comma-separated)" name="preferredJobTitles" value={formData.preferredJobTitles} onChange={handleChange} error={errors.preferredJobTitles} required readOnly={!isEditMode} />
                        <InputField label="Desired Industry / Sector" name="desiredIndustry" value={formData.desiredIndustry} onChange={handleChange} error={errors.desiredIndustry} required readOnly={!isEditMode} />
                        <SelectField label="Availability" name="availability" value={formData.availability} onChange={handleChange} options={['Immediately Available', '1-2 Weeks Notice', '3-4 Weeks Notice', 'Negotiable']} readOnly={!isEditMode} />
                        <SelectField label="Preferred Work Type" name="preferredWorkType" value={formData.preferredWorkType} onChange={handleChange} options={['Full-time', 'Part-time', 'Contract', 'Remote', 'Hybrid']} readOnly={!isEditMode} />
                      </div>
                    </SectionWrapper>
                  )}

                  {currentStep === 3 && (
                    <SectionWrapper title="Work Experience" readOnly={!isEditMode}>
                      {isEditMode && (
                          <button type="button" onClick={addWorkExperience} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                              Add Work Experience
                          </button>
                      )}
                      {formData.workExperience.length === 0 && !isEditMode && (
                          <p className="text-gray-500 italic mb-4">No work experience added yet. Click "Add Work Experience" to begin.</p>
                      )}
                      {formData.workExperience.map((role, index) => (
                        <div key={index} className="space-y-4 border border-gray-200 p-4 rounded-md mb-4 relative bg-gray-50">
                          <h3 className="text-lg font-medium text-gray-700 mb-3">Role {index + 1}</h3>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={() => removeWorkExperience(index)}
                              className="absolute top-2 right-2 p-1 text-red-600 hover:text-red-800 rounded-full transition duration-200"
                              title="Remove Role"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          )}
                          <InputField label="Job Title" name={`workExperience.${index}.title`} value={role.title} onChange={handleChange} error={errors[`workExperience.${index}.title`]} required readOnly={!isEditMode} />
                          <InputField label="Company" name={`workExperience.${index}.company`} value={role.company} onChange={handleChange} error={errors[`workExperience.${index}.company`]} required readOnly={!isEditMode} />
                          <InputField label="Location (City, State)" name={`workExperience.${index}.location`} value={role.location} onChange={handleChange} error={errors[`workExperience.${index}.location`]} required readOnly={!isEditMode} />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Start Date (YYYY-MM-DD)" name={`workExperience.${index}.startDate`} type="date" value={role.startDate} onChange={handleChange} error={errors[`workExperience.${index}.startDate`]} required readOnly={!isEditMode} />
                            <div className="flex items-end">
                              <InputField label="End Date (YYYY-MM-DD) or 'Present'" name={`workExperience.${index}.endDate`} type="date" value={role.endDate} onChange={handleChange} error={errors[`workExperience.${index}.endDate`]} readOnly={!isEditMode} className="flex-grow" dateFieldType="work" />
                              {isEditMode && role.endDate !== 'Present' && (
                                  <button type="button" onClick={() => handleChange({ target: { name: `workExperience.${index}.endDate`, value: 'Present' }})} className="ml-2 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Present</button>
                              )}
                            </div>
                          </div>
                          <TextareaField label="Key Responsibilities / Achievements" name={`workExperience.${index}.summary`} value={role.summary} onChange={handleChange} rows={4} placeholder="Use bullet points or a short paragraph." error={errors[`workExperience.${index}.summary`]} required readOnly={!isEditMode} />
                        </div>
                      ))}
                      {errors['workExperience.minimum'] && <p className="mt-1 text-sm text-red-600">{errors['workExperience.minimum']}</p>}
                    </SectionWrapper>
                  )}

                  {currentStep === 4 && (
                    <SectionWrapper title="Your Education" readOnly={!isEditMode}>
                       {isEditMode && (
                          <button type="button" onClick={addEducation} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                              Add Education
                          </button>
                      )}
                      {formData.education.length === 0 && !isEditMode && (
                          <p className="text-gray-500 italic mb-4">No education entries added yet.</p>
                      )}
                      {formData.education.map((edu, index) => (
                        <div key={index} className="space-y-4 border border-gray-200 p-4 rounded-md mb-4 relative bg-gray-50">
                          <h3 className="text-lg font-medium text-gray-700 mb-3">Education {index + 1}</h3>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={() => removeEducation(index)}
                              className="absolute top-2 right-2 p-1 text-red-600 hover:text-red-800 rounded-full transition duration-200"
                              title="Remove Education"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          )}
                          <InputField label="Qualification (e.g., Bachelor of IT)" name={`education.${index}.qualification`} value={edu.qualification} onChange={handleChange} error={errors[`education.${index}.qualification`]} readOnly={!isEditMode} />
                          <InputField label="Institution Name" name={`education.${index}.institution`} value={edu.institution} onChange={handleChange} error={errors[`education.${index}.institution`]} readOnly={!isEditMode} />
                          <InputField label="Location (Optional)" name={`education.${index}.location`} value={edu.location} onChange={handleChange} error={errors[`education.${index}.location`]} readOnly={!isEditMode} />
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Start Date (YYYY-MM-DD)" name={`education.${index}.startDate`} type="date" value={edu.startDate} onChange={handleChange} error={errors[`education.${index}.startDate`]} readOnly={!isEditMode} />
                            <div className="flex items-end">
                              <InputField label="End Date (YYYY-MM-DD) or 'Expected'" name={`education.${index}.endDate`} type="date" value={edu.endDate} onChange={handleChange} error={errors[`education.${index}.endDate`]} readOnly={!isEditMode} className="flex-grow" dateFieldType="education" />
                              {isEditMode && edu.endDate !== 'Present' && (
                                <button type="button" onClick={() => handleChange({ target: { name: `education.${index}.endDate`, value: 'Present' }})} className="ml-2 px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Expected</button>
                              )}
                            </div>
                          </div>
                          <InputField label="Honours / Distinctions (Optional)" name={`education.${index}.honors`} value={edu.honors} onChange={handleChange} error={errors[`education.${index}.honors`]} readOnly={!isEditMode} />
                        </div>
                      ))}
                    </SectionWrapper>
                  )}

                  {currentStep === 5 && (
                    <SectionWrapper title="Certifications & Training" readOnly={!isEditMode}>
                      {isEditMode && (
                          <button type="button" onClick={addCertification} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                              Add Certification
                          </button>
                      )}
                      {formData.certifications.length === 0 && !isEditMode && (
                          <p className="text-gray-500 italic mb-4">No certifications added yet.</p>
                      )}
                      {formData.certifications.map((cert, index) => (
                        <div key={index} className="space-y-4 border border-gray-200 p-4 rounded-md mb-4 relative bg-gray-50">
                          <h3 className="text-lg font-medium text-gray-700 mb-3">Certification {index + 1}</h3>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={() => removeCertification(index)}
                              className="absolute top-2 right-2 p-1 text-red-600 hover:text-red-800 rounded-full transition duration-200"
                              title="Remove Certification"
                            >
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        )}
                        <InputField label="Certification Name" name={`certifications.${index}.name`} value={cert.name} onChange={handleChange} error={errors[`certifications.${index}.name`]} readOnly={!isEditMode} />
                        <InputField label="Issuer" name={`certifications.${index}.issuer`} value={cert.issuer} onChange={handleChange} error={errors[`certifications.${index}.issuer`]} readOnly={!isEditMode} />
                        <InputField label="Year" name={`certifications.${index}.year`} type="number" value={cert.year} onChange={handleChange} placeholder="YYYY" error={errors[`certifications.${index}.year`]} readOnly={!isEditMode} />
                      </div>
                    ))}
                  </SectionWrapper>
                )}

                {currentStep === 6 && (
                  <SectionWrapper title="Customization & Fit" readOnly={!isEditMode}>
                    <InputField label="Key Strengths / Keywords for AI (comma-separated)" name="keyStrengths" value={formData.keyStrengths} onChange={handleChange} error={errors.keyStrengths} readOnly={!isEditMode} />
                    <TextareaField label="Specific Values or Cultural Fit Notes (Optional)" name="culturalFitNotes" value={formData.culturalFitNotes} onChange={handleChange} placeholder="Describe what kind of company culture you thrive in, or values important to you." rows={3} error={errors.culturalFitNotes} className="mt-6" readOnly={!isEditMode} />
                  </SectionWrapper>
                )}

                {currentStep === 7 && (
                  <SectionWrapper title="Optional Extras" readOnly={!isEditMode}>
                    <TextareaField label="Volunteer Experience (Optional)" name="volunteerExperience" value={formData.volunteerExperience} onChange={handleChange} placeholder="Briefly describe your volunteer work." rows={3} error={errors.volunteerExperience} readOnly={!isEditMode} />
                    <InputField label="Languages (comma-separated, e.g., English, Spanish, French)" name="languages" value={formData.languages} onChange={handleChange} error={errors.languages} className="mt-6" readOnly={!isEditMode} />
                    <TextareaField label="Publications or Portfolios (URLs, one per line)" name="publicationsOrPortfolios" value={formData.publicationsOrPortfolios} onChange={handleChange} placeholder="https://yourportfolio.com&#10;https://github.com/yourrepo" rows={4} error={errors.publicationsOrPortfolios} className="mt-6" readOnly={!isEditMode} />
                    <RadioGroupField label="Willing to Relocate?" name="willingToRelocate" value={formData.willingToRelocate} onChange={handleChange} options={['Yes', 'No']} readOnly={!isEditMode} className="mt-6" />
                  </SectionWrapper>
                )}
                </>
              )}
            </div>
          )} {/* End of Conditional Rendering */}

          {/* Navigation Buttons and Submit */}
          <div className="fixed bottom-6 right-6 left-6 flex justify-between space-x-2 p-4 bg-white rounded-xl shadow-lg">
            {/* Previous Button (Multi-step) */}
            {!currentEditSectionId && isEditMode && currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out transform hover:-translate-x-1"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Previous
              </button>
            )}
            
            {/* Save Current Section Button (Multi-step, not last step) */}
            {!currentEditSectionId && isEditMode && currentStep < formSteps.length - 1 && (
              <button
                type="button" // Use type="button" to prevent default form submission
                onClick={handleSaveSection} // Call the unified save logic
                disabled={isSubmitting}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-70 transition duration-200 ease-in-out transform hover:scale-105"
              >
                {isSubmitting ? 'Saving Section...' : 'Save Current Section'}
                {isSubmitting && <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              </button>
            )}

            {/* Next Button (Multi-step) */}
            {!currentEditSectionId && isEditMode && currentStep < formSteps.length - 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="ml-auto flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out transform hover:translate-x-1"
              >
                Next
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </button>
            )}

            {/* Save Full Profile Button (Multi-step, last step) */}
            {!currentEditSectionId && isEditMode && currentStep === formSteps.length - 1 && (
              <button
                type="submit" // This button will trigger handleSubmit
                disabled={isSubmitting}
                className="ml-auto flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70 transition duration-200 ease-in-out transform hover:scale-105"
              >
                {isSubmitting ? 'Saving Profile...' : 'Save Full Profile'}
                {isSubmitting && <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
              </button>
            )}

            {/* Buttons for single-section edit mode (visible only when currentEditSectionId is set) */}
            {currentEditSectionId && (
              <div className="flex justify-between w-full">
                <button
                  type="button"
                  onClick={handleCancelSectionEdit}
                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200 ease-in-out transform hover:-translate-x-1"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  Cancel Edit
                </button>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleSaveSection}
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70 transition duration-200 ease-in-out transform hover:scale-105"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Section'}
                    {isSubmitting && <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveSection().then(() => {
                        setIsEditMode(false);
                        setIsReviewMode(true);
                        setCurrentEditSectionId(null);
                      });
                    }}
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70 transition duration-200 ease-in-out transform hover:scale-105"
                  >
                    {isSubmitting ? 'Saving...' : 'Save & Return'}
                    {isSubmitting && <svg className="animate-spin ml-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                  </button>
                </div>
              </div>
            )}
            {/* Initial Edit Profile button (visible only in initial state) */}
            {!isEditMode && !isReviewMode && (
              <button
                type="button"
                onClick={() => {
                  setIsEditMode(true);
                  setIsReviewMode(false); // Ensure review mode is off
                  setCurrentStep(0); // Reset to first step when entering edit mode
                  setCurrentEditSectionId(null); // Ensure not in single section edit mode
                }}
                className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out transform hover:scale-105"
              >
                Edit Profile
              </button>
            )}
            {/* Edit All Sections button (visible in review mode when not editing a single section) */}
            {isReviewMode && !currentEditSectionId && (
                 <button
                 type="button"
                 onClick={() => handleSectionEdit(0)} // Go to first step on overall edit
                 className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out transform hover:scale-105"
               >
                 Edit All Sections
               </button>
            )}
          </div>
        </form>

        {/* Success message */}
        {submitSuccess && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded z-50 animate-bounce-in-out">
            Profile updated successfully!
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Section Wrapper Component for consistent styling and transitions
const SectionWrapper = ({ title, note, children, readOnly, onEdit, showEditButton = false }) => (
  <div className="p-6 border border-gray-200 rounded-xl bg-white shadow-sm mb-6 transition-all duration-300 ease-in-out transform hover:shadow-md">
    <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center justify-between">
      <span className="flex items-center">
        <span className="text-blue-600 mr-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </span>
        {title}
      </span>
      {readOnly && showEditButton && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out transform hover:scale-105"
        >
          Edit Section
        </button>
      )}
    </h2>
    {note && <p className="text-sm text-gray-500 mb-4 italic">{note}</p>}
    <div className="space-y-6">
      {children}
    </div>
  </div>
);


// Reusable Form Field Components
const InputField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = '',
  readOnly = false,
  dateFieldType = null // 'work' or 'education'
}) => {
  const displayValueForPresent = dateFieldType === 'work' ? 'Present' : (dateFieldType === 'education' ? 'Expected' : '');

  return (
    <div className={`${className} transition-opacity duration-300`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {readOnly ? (
        <div className="py-2 px-3 bg-gray-100 rounded-md border border-gray-200 text-gray-800 shadow-sm">
          {type === 'date' && value === 'Present' ? displayValueForPresent : value || <span className="text-gray-400">Not provided</span>}
        </div>
      ) : (
        <>
          {type === 'date' && value === 'Present' ? (
            <div className="flex items-center w-full px-3 py-2 border rounded-md shadow-sm bg-gray-100 text-gray-800">
              <span>{displayValueForPresent}</span>
              <button
                type="button"
                onClick={() => onChange({ target: { name, value: '' } })}
                className="ml-auto text-gray-500 hover:text-gray-700"
                title="Clear selection"
              >
                &times;
              </button>
            </div>
          ) : (
            <input
              type={type}
              id={name}
              name={name}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              required={required}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                error ? 'border-red-500 ring-red-500' : 'border-gray-300'
              }`}
            />
          )}
        </>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const TextareaField = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  required = false,
  error,
  className = '',
  readOnly = false
}) => (
  <div className={`${className} transition-opacity duration-300`}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {readOnly ? (
      <div className="py-2 px-3 bg-gray-100 rounded-md border border-gray-200 whitespace-pre-wrap text-gray-800 shadow-sm">
        {value || <span className="text-gray-400">Not provided</span>}
      </div>
    ) : (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          error ? 'border-red-500 ring-red-500' : 'border-gray-300'
        }`}
      />
    )}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  className = '',
  readOnly = false
}) => (
  <div className={`${className} transition-opacity duration-300`}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {readOnly ? (
      <div className="py-2 px-3 bg-gray-100 rounded-md border border-gray-200 text-gray-800 shadow-sm">
        {value || <span className="text-gray-400">Not provided</span>}
      </div>
    ) : (
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          error ? 'border-red-500 ring-red-500' : 'border-gray-300'
        }`}
      >
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )}
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const RadioGroupField = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  className = '',
  readOnly = false
}) => (
  <div className={`${className} transition-opacity duration-300`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="mt-1 flex space-x-4">
      {options.map((option) => (
        <div key={option} className="flex items-center">
          {readOnly ? (
            <span className="py-2 px-3 bg-gray-100 rounded-md border border-gray-200 text-gray-800 shadow-sm">
              {value === option ? option : ''}
            </span>
          ) : (
            <>
              <input
                type="radio"
                id={`${name}-${option}`}
                name={name}
                value={option}
                checked={value === option}
                onChange={onChange}
                required={required}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 transition-all duration-200"
              />
              <label htmlFor={`${name}-${option}`} className="ml-2 block text-sm text-gray-900">
                {option}
              </label>
            </>
          )}
        </div>
      ))}
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserProfile } from '@/types/form.types';

type FormField = keyof Omit<UserProfile, 'uid' | 'email' | 'emailVerified' | 'phoneVerified' | 'createdAt' | 'updatedAt' | 'preferences'>;
type ArrayField = 'education' | 'workExperience' | 'skills' | 'certifications' | 'addresses';

interface ProfileFormContextValue {
  // Form state
  formData: Partial<UserProfile>;
  errors: Record<string, string>;
  
  // Form field handlers
  updateField: <K extends FormField>(field: K, value: UserProfile[K]) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  
  // Array field handlers
  addItem: <T extends ArrayField>(field: T, item: UserProfile[T] extends Array<infer U> ? Omit<U, 'id'> : never) => void;
  updateItem: <T extends ArrayField>(
    field: T, 
    id: string, 
    updates: Partial<UserProfile[T] extends Array<infer U> ? U : never>
  ) => void;
  removeItem: (field: ArrayField, id: string) => void;
  
  // Form submission
  validateForm: () => boolean;
  resetForm: () => void;
}

const ProfileFormContext = createContext<ProfileFormContextValue | undefined>(undefined);

interface ProfileFormProviderProps {
  children: ReactNode;
  initialData?: Partial<UserProfile>;
}

export const ProfileFormProvider: React.FC<ProfileFormProviderProps> = ({ 
  children, 
  initialData = {} 
}) => {
  const [formData, setFormData] = useState<Partial<UserProfile>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update a single field
  const updateField = useCallback(<K extends FormField>(field: K, value: UserProfile[K]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle form field changes
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' 
      ? (e.target as HTMLInputElement).checked 
      : value;

    updateField(name as FormField, inputValue);
  }, [updateField]);

  // Add a new item to an array field
  const addItem = useCallback(<T extends ArrayField>(
    field: T, 
    item: UserProfile[T] extends Array<infer U> ? Omit<U, 'id'> : never
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: [
        ...(prev[field] || []) as unknown[],
        { ...item, id: Date.now().toString() }
      ]
    }));
  }, []);

  // Update an item in an array field
  const updateItem = useCallback(<T extends ArrayField>(
    field: T, 
    id: string, 
    updates: Partial<UserProfile[T] extends Array<infer U> ? U : never>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as unknown[])?.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ) || []
    }));
  }, []);

  // Remove an item from an array field
  const removeItem = useCallback((field: ArrayField, id: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as unknown[])?.filter(item => item.id !== id) || []
    }));
  }, []);

  // Validate the entire form
  const validateForm = useCallback((): boolean => {
    // TODO: Implement validation logic
    // For now, just clear any existing errors
    setErrors({});
    return true;
  }, []);

  // Reset the form to initial values
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  // Context value
  const contextValue: ProfileFormContextValue = {
    formData,
    errors,
    updateField,
    handleChange,
    addItem,
    updateItem,
    removeItem,
    validateForm,
    resetForm,
  };

  return (
    <ProfileFormContext.Provider value={contextValue}>
      {children}
    </ProfileFormContext.Provider>
  );
};

// Custom hook to use the form context
export const useProfileForm = (): ProfileFormContextValue => {
  const context = useContext(ProfileFormContext);
  if (context === undefined) {
    throw new Error('useProfileForm must be used within a ProfileFormProvider');
  }
  return context;
};

export default ProfileFormContext
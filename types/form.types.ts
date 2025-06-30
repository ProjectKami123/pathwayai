// Basic user information types
export type UserRole = 'student' | 'professional' | 'educator' | 'employer' | 'other';
export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say' | 'other';
export type PhoneVerificationStatus = 'pending' | 'verified' | 'not-verified';

// Address information
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary?: boolean;
}

// Education history
export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  isCurrent: boolean;
  description?: string;
}

// Work experience
export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: Date | string;
  endDate?: Date | string | null;
  isCurrent: boolean;
  description?: string;
  location?: string;
}

// Skills and certifications
export interface Skill {
  name: string;
  level: 1 | 2 | 3 | 4 | 5; // 1-5 rating
  category?: string;
}

export interface Certification {
  name: string;
  issuingOrganization: string;
  issueDate: Date | string;
  expirationDate?: Date | string | null;
  credentialId?: string;
  credentialUrl?: string;
}

// User profile data
export interface UserProfile {
  // Basic info
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  phoneVerified: boolean;
  
  // Personal info
  firstName: string;
  lastName: string;
  dateOfBirth?: Date | string | null;
  gender?: Gender;
  bio?: string;
  
  // Professional info
  headline?: string;
  currentPosition?: string;
  company?: string;
  industry?: string;
  
  // Arrays
  addresses: Address[];
  education: Education[];
  workExperience: WorkExperience[];
  skills: Skill[];
  certifications: Certification[];
  
  // Preferences
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    privacySettings: {
      profileVisibility: 'public' | 'connections' | 'private';
      emailVisibility: 'public' | 'connections' | 'private';
      phoneVisibility: 'public' | 'connections' | 'private';
    };
  };
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
  lastLoginAt?: Date | string | null;
}

// Form specific types
export type AuthFormData = {
  email: string;
  password: string;
  confirmPassword?: string; // Only for signup
  rememberMe?: boolean;
};

export type ProfileFormData = Omit<UserProfile, 'uid' | 'email' | 'emailVerified' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>;

// Form field validation
export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  validate?: (value: any) => boolean | string;
}

export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'date' | 'textarea' | 'tel';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: FormFieldValidation;
  defaultValue?: T;
  disabled?: boolean;
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

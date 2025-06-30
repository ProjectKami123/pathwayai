import React from 'react';
import { useProfileForm } from '../../form-context/ProfileFormContext';
import { InputField } from '../fields/InputField';
import { Button } from '../../ui/Button';
import { Plus, Trash2 } from 'lucide-react';

type Certification = {
  id: string;
  name: string;
  issuer: string;
  year: string;
};

const CertificationsSection: React.FC = () => {
  const { 
    formData, 
    errors, 
    handleArrayChange,
    isReadOnly,
  } = useProfileForm();

  // Initialize certifications from formData or with one empty entry
  const certifications: Certification[] = formData.certifications?.length 
    ? formData.certifications 
    : [{ 
        id: Date.now().toString(), 
        name: '', 
        issuer: '', 
        year: new Date().getFullYear().toString()
      }];

  const handleAddCertification = () => {
    const newCertification: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      year: new Date().getFullYear().toString()
    };
    handleArrayChange('certifications', [...certifications, newCertification]);
  };

  const handleRemoveCertification = (id: string) => {
    if (certifications.length <= 1) return;
    handleArrayChange('certifications', certifications.filter(cert => cert.id !== id));
  };

  const handleCertificationChange = (id: string, field: keyof Certification, value: string) => {
    const updatedCertifications = certifications.map(cert => 
      cert.id === id ? { ...cert, [field]: value } : cert
    );
    handleArrayChange('certifications', updatedCertifications);
  };

  // Validate year input to ensure it's a 4-digit number
  const validateYear = (value: string): string => {
    if (!/^\d{0,4}$/.test(value)) {
      return 'Please enter a valid 4-digit year';
    }
    return '';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
        {!isReadOnly && certifications.length < 10 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddCertification}
            className="text-sm"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Certification
          </Button>
        )}
      </div>

      {certifications.map((cert, index) => (
        <div key={cert.id} className="border border-gray-200 rounded-lg p-6 relative">
          {certifications.length > 1 && !isReadOnly && (
            <button
              type="button"
              onClick={() => handleRemoveCertification(cert.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
              aria-label="Remove certification"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <InputField
                label="Certification Name"
                name={`certifications[${index}].name`}
                value={cert.name}
                onChange={(e) => handleCertificationChange(cert.id, 'name', e.target.value)}
                error={errors[`certifications[${index}].name`]}
                placeholder="E.g., AWS Certified Solutions Architect"
                required
                readOnly={isReadOnly}
              />
            </div>
            <InputField
              label="Issuing Organization"
              name={`certifications[${index}].issuer`}
              value={cert.issuer}
              onChange={(e) => handleCertificationChange(cert.id, 'issuer', e.target.value)}
              error={errors[`certifications[${index}].issuer`]}
              placeholder="E.g., Amazon Web Services"
              required
              readOnly={isReadOnly}
            />
            <InputField
              label="Year Obtained"
              name={`certifications[${index}].year`}
              value={cert.year}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d{0,4}$/.test(value)) {
                  handleCertificationChange(cert.id, 'year', value);
                }
              }}
              onBlur={(e) => {
                const error = validateYear(e.target.value);
                if (error) {
                  // Handle validation error if needed
                }
              }}
              error={errors[`certifications[${index}].year`]}
              placeholder="YYYY"
              maxLength={4}
              required
              readOnly={isReadOnly}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CertificationsSection;
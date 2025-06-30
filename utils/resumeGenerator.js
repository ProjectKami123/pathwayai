import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register standard fonts for ATS compatibility
Font.register({
  family: 'Arial',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

Font.register({
  family: 'Times-Roman',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Liberation/LiberationSerif-Regular.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Liberation/LiberationSerif-Bold.ttf', fontWeight: 700 },
  ],
});

// Define styles for the resume with ATS-friendly formatting
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 36, // 0.5 inch margins (72 dpi * 0.5)
    fontFamily: 'Arial',
    fontSize: 11, // Standard ATS-friendly size
    lineHeight: 1.3,
    color: '#000000',
  },
  header: {
    marginBottom: 16,
    borderBottom: '1pt solid #000000',
    paddingBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    fontSize: 10,
    color: '#333333',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 6,
    borderBottom: '0.5pt solid #999999',
    paddingBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  item: {
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  itemSubtitle: {
    fontSize: 10,
    color: '#333333',
    fontStyle: 'normal',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 10,
    color: '#333333',
    fontStyle: 'normal',
  },
  itemDescription: {
    fontSize: 10,
    lineHeight: 1.4,
    marginTop: 4,
  },
  bulletPoint: {
    marginLeft: 10,
    fontSize: 10,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  skillTag: {
    backgroundColor: '#f5f5f5',
    padding: '2px 8px',
    borderRadius: 2,
    fontSize: 9,
    marginRight: 4,
    marginBottom: 4,
    border: '0.5pt solid #dddddd',
  },
});

/**
 * Format a date to a readable string with month and year
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string (e.g., "Jan 2020")
 */
const formatDate = (date) => {
  if (!date || date === 'Present') return 'Present';
  
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  } catch (e) {
    return String(date);
  }
};

/**
 * Format the date range for experience/education items
 * @param {string} startDate - Start date
 * @param {string} endDate - End date (can be null for current)
 * @returns {string} Formatted date range
 */
const formatDateRange = (startDate, endDate) => {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : 'Present';
  return `${start} - ${end}`;
};

/**
 * Format job description text with bullet points
 * @param {string} text - Description text
 * @returns {Array} Array of Text components for bullet points
 */
const formatDescription = (text) => {
  if (!text) return null;
  
  // Split by common bullet point characters or new lines
  const points = text.split(/[•\n\r]+/).filter(point => point.trim());
  
  return points.map((point, index) => (
    <View key={index} style={{ flexDirection: 'row', marginBottom: 2 }}>
      <Text>• </Text>
      <Text style={styles.bulletPoint}>{point.trim()}</Text>
    </View>
  ));
};

/**
 * Main Resume component that structures the PDF document
 * @param {Object} props - Component props
 * @param {Object} props.formData - Resume data from the form
 * @returns {React.ReactElement} PDF document structure
 */
const ResumeDocument = ({ formData }) => {
  const {
    personalInfo = {},
    experiences = [],
    education = [],
    skills = [],
    certifications = [],
  } = formData;

  // Prepare document metadata
  const docInfo = {
    title: `${personalInfo.firstName || ''} ${personalInfo.lastName || ''} - Resume`,
    author: `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`,
    subject: 'Professional Resume',
    keywords: ['resume', 'CV', 'professional', 'work experience', 'education', 'skills']
      .concat(skills)
      .filter(Boolean)
      .join(', '),
  };

  return (
    <Document
      title={docInfo.title}
      author={docInfo.author}
      subject={docInfo.subject}
      keywords={docInfo.keywords}
      creator="PathwayAI Resume Builder"
      producer="PathwayAI"
    >
      <Page size="A4" style={styles.page}>
        {/* Header with personal info */}
        <View style={styles.header}>
          <Text style={styles.name}>
            {[personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(' ')}
          </Text>
          <View style={styles.contactInfo}>
            <Text>{personalInfo.email}</Text>
            <Text>{personalInfo.phone}</Text>
            {personalInfo.linkedIn && <Text>{personalInfo.linkedIn}</Text>}
            {personalInfo.website && <Text>{personalInfo.website}</Text>}
            {personalInfo.location && <Text>{personalInfo.location}</Text>}
          </View>
        </View>

        {/* Professional Summary */}
        {personalInfo.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.itemDescription}>{personalInfo.summary}</Text>
          </View>
        )}

        {/* Work Experience */}
        {experiences?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {experiences.map((exp, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {exp.title}
                    {exp.title && exp.company && ' | '}
                    {exp.company}
                  </Text>
                  <Text style={styles.itemDate}>
                    {formatDateRange(exp.startDate, exp.endDate)}
                  </Text>
                </View>
                {exp.location && (
                  <Text style={styles.itemSubtitle}>
                    {exp.location}
                  </Text>
                )}
                {exp.description && (
                  <View style={{ marginTop: 4 }}>
                    {formatDescription(exp.description)}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {edu.degree}
                    {edu.field && ` in ${edu.field}`}
                  </Text>
                  <Text style={styles.itemDate}>
                    {formatDateRange(edu.startDate, edu.endDate)}
                  </Text>
                </View>
                <Text style={styles.itemSubtitle}>
                  {[edu.institution, edu.location].filter(Boolean).join(' | ')}
                </Text>
                {edu.gpa && (
                  <Text style={styles.itemDescription}>GPA: {edu.gpa}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {certifications?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((cert, index) => (
              <View key={index} style={styles.item}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{cert.name}</Text>
                  {cert.date && (
                    <Text style={styles.itemDate}>{formatDate(cert.date)}</Text>
                  )}
                </View>
                {cert.issuer && (
                  <Text style={styles.itemSubtitle}>{cert.issuer}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {skills?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Technical Skills</Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <Text key={index} style={styles.skillTag}>
                  {skill}
                </Text>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

/**
 * Generate a PDF resume from form data
 * @param {Object} formData - The resume data from the form
 * @param {string} [outputPath] - Optional output path to save the PDF
 * @returns {Promise<Blob>} A promise that resolves to the PDF blob
 */
const generateResume = async (formData, outputPath) => {
  try {
    const { pdf } = await import('@react-pdf/renderer');
    const blob = await pdf(<ResumeDocument formData={formData} />).toBlob();
    
    // If outputPath is provided, save the file (browser only)
    if (outputPath && typeof window !== 'undefined') {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputPath.endsWith('.pdf') ? outputPath : `${outputPath}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    return blob;
  } catch (error) {
    console.error('Error generating resume:', error);
    throw error;
  }
};

export { generateResume, ResumeDocument };

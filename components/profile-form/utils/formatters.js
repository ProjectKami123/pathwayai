/**
 * Utility functions for formatting and transforming form data
 * All functions are pure and side-effect free
 */

/**
 * Converts a comma-separated string to an array of trimmed strings
 * @param {string} str - The input string (e.g., "React, JavaScript, Node.js")
 * @returns {string[]} Array of trimmed strings (e.g., ["React", "JavaScript", "Node.js"])
 */
export const commaStringToArray = (str) => {
  if (!str) return [];
  if (Array.isArray(str)) return str; // Already an array
  return str
    .split(',')
    .map(item => item.trim())
    .filter(Boolean); // Remove empty strings
};

/**
 * Converts an array of strings to a comma-separated string
 * @param {string[]} arr - Array of strings
 * @returns {string} Comma-separated string
 */
export const arrayToCommaString = (arr) => {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.filter(Boolean).join(', ');
};

/**
 * Converts a newline-separated string to an array of trimmed strings
 * @param {string} str - The input string with newlines
 * @returns {string[]} Array of trimmed strings
 */
export const newlineStringToArray = (str) => {
  if (!str) return [];
  if (Array.isArray(str)) return str; // Already an array
  return str
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean); // Remove empty strings
};

/**
 * Converts an array of strings to a newline-separated string
 * @param {string[]} arr - Array of strings
 * @returns {string} Newline-separated string
 */
export const arrayToNewlineString = (arr) => {
  if (!arr || !Array.isArray(arr)) return '';
  return arr.filter(Boolean).join('\n');
};

/**
 * Converts a boolean to 'Yes' or 'No' string
 * @param {boolean} bool - The boolean value
 * @returns {'Yes'|'No'} 'Yes' if true, 'No' if false
 */
export const booleanToYesNo = (bool) => {
  return bool === true ? 'Yes' : 'No';
};

/**
 * Converts 'Yes'/'No' string to boolean
 * @param {string} str - 'Yes' or 'No' string (case insensitive)
 * @returns {boolean} true if 'yes', false otherwise
 */
export const yesNoToBoolean = (str) => {
  if (typeof str !== 'string') return false;
  return str.trim().toLowerCase() === 'yes';
};

/**
 * Formats a date string to a more readable format
 * @param {string|Date} date - The date to format
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.includeTime=false] - Whether to include time in the output
 * @returns {string} Formatted date string (e.g., "Jan 1, 2023" or "Jan 1, 2023 14:30")
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const { includeTime = false } = options;
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return ''; // Invalid date
  
  const dateOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  const formattedDate = dateObj.toLocaleDateString('en-US', dateOptions);
  
  if (includeTime) {
    const formattedTime = dateObj.toLocaleTimeString('en-US', timeOptions);
    return `${formattedDate} ${formattedTime}`;
  }
  
  return formattedDate;
};

/**
 * Formats a date string to ISO format (YYYY-MM-DD) for date inputs
 * @param {string|Date} date - The date to format
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return ''; // Invalid date
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Formats a phone number for display
 * @param {string} phone - The phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = ('' + phone).replace(/\D/g, '');
  
  // Check if the number looks like a US number
  const match = cleaned.match(/^(\d{1,3})?(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    const intlCode = match[1] ? `+${match[1]} ` : '';
    return `${intlCode}(${match[2]}) ${match[3]}-${match[4]}`;
  }
  
  // Return original if format doesn't match
  return phone;
};

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Converts a string to title case
 * @param {string} str - The string to convert
 * @returns {string} String in title case
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
  );
};

/**
 * Safely gets a nested property from an object
 * @param {Object} obj - The object to query
 * @param {string} path - The path of the property to get
 * @param {*} [defaultValue] - The value to return if the resolved value is undefined
 * @returns {*} The resolved value or default value
 */
export const get = (obj, path, defaultValue = '') => {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) return defaultValue;
  }
  
  return result ?? defaultValue;
};

const formatters = {
  commaStringToArray,
  arrayToCommaString,
  newlineStringToArray,
  arrayToNewlineString,
  booleanToYesNo,
  yesNoToBoolean,
  formatDate,
  formatDateForInput,
  formatPhoneNumber,
  truncateText,
  toTitleCase,
  get
};

export default formatters;

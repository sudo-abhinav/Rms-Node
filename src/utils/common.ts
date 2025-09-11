const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim() !== '';
};

const isValidEmail = (value: string): boolean => {
  // Very basic email validation (replace with a library if needed)
  return value.includes('@') && value.includes('.');
};

// Minimum password length requirement
const isAcceptablePassword = (value: string): boolean => {
  return value.length >= 6; // Adjust as needed
};

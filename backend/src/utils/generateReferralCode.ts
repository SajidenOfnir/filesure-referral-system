/**
 * Generates a unique referral code based on user's name
 * Format: UPPERCASE_NAME + 3_RANDOM_DIGITS
 * Example: LINA123, RYAN456
 */
export const generateReferralCode = (name: string): string => {
  // Clean the name: remove spaces, special characters, take first 8 chars
  const cleanName = name
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 8);
  
  // Generate 3 random digits
  const randomDigits = Math.floor(100 + Math.random() * 900);
  
  return `${cleanName}${randomDigits}`;
};

/**
 * Validates referral code format
 */
export const isValidReferralCode = (code: string): boolean => {
  // Must be 3-11 characters (min name length 0 + 3 digits, max 8 chars + 3 digits)
  // Must contain at least some digits at the end
  return /^[A-Z]{0,8}\d{3}$/.test(code);
};
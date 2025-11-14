import DOMPurify from 'dompurify';

// ==================== HTML SANITIZATION ====================

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Removes dangerous tags like <script>, <iframe>, event handlers, etc.
 */
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
  // Configure DOMPurify to allow safe HTML tags
  const config = {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'div', 'span',
      'blockquote', 'pre', 'code'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src',
      'class', 'id'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  };
  
  return DOMPurify.sanitize(html, config);
};

// ==================== INPUT VALIDATION ====================

/**
 * Validates and sanitizes a name (2-100 characters, letters and spaces only)
 */
export const validateName = (name: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Name is required' };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' };
  }
  
  // Allow letters, spaces, hyphens, apostrophes (for names like O'Brien)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { valid: true, sanitized: trimmed };
};

/**
 * Validates Indian phone number (10 digits)
 */
export const validatePhone = (phone: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's 10 digits
  if (cleaned.length !== 10) {
    return { valid: false, error: 'Phone number must be exactly 10 digits' };
  }
  
  // Check if it starts with 6, 7, 8, or 9 (valid Indian mobile numbers)
  if (!/^[6-9]/.test(cleaned)) {
    return { valid: false, error: 'Phone number must start with 6, 7, 8, or 9' };
  }
  
  return { valid: true, sanitized: cleaned };
};

/**
 * Validates district/state name
 */
export const validateLocation = (location: string, fieldName: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!location || typeof location !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  const trimmed = location.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: `${fieldName} must be at least 2 characters` };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: `${fieldName} must be less than 50 characters` };
  }
  
  // Allow letters, spaces, hyphens (for names like Tamil Nadu)
  const locationRegex = /^[a-zA-Z\s-]+$/;
  if (!locationRegex.test(trimmed)) {
    return { valid: false, error: `${fieldName} can only contain letters, spaces, and hyphens` };
  }
  
  return { valid: true, sanitized: trimmed };
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const trimmed = email.trim().toLowerCase();
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (trimmed.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }
  
  return { valid: true, sanitized: trimmed };
};

// ==================== JOB DATA VALIDATION ====================

/**
 * Validates job title
 */
export const validateJobTitle = (title: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Job title is required' };
  }
  
  const trimmed = title.trim();
  
  if (trimmed.length < 5) {
    return { valid: false, error: 'Job title must be at least 5 characters' };
  }
  
  if (trimmed.length > 200) {
    return { valid: false, error: 'Job title must be less than 200 characters' };
  }
  
  return { valid: true, sanitized: trimmed };
};

/**
 * Validates job fee (must be 0 or positive, max 100,000)
 */
export const validateFee = (fee: number): { valid: boolean; error?: string; sanitized?: number } => {
  if (typeof fee !== 'number' || isNaN(fee)) {
    return { valid: false, error: 'Fee must be a valid number' };
  }
  
  if (fee < 0) {
    return { valid: false, error: 'Fee cannot be negative' };
  }
  
  if (fee > 100000) {
    return { valid: false, error: 'Fee cannot exceed ₹100,000' };
  }
  
  // Round to 2 decimal places
  const sanitized = Math.round(fee * 100) / 100;
  
  return { valid: true, sanitized };
};

/**
 * Validates date is in the future
 */
export const validateFutureDate = (dateString: string, fieldName: string): { valid: boolean; error?: string } => {
  if (!dateString || typeof dateString !== 'string') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (isNaN(date.getTime())) {
    return { valid: false, error: `${fieldName} is not a valid date` };
  }
  
  if (date < today) {
    return { valid: false, error: `${fieldName} must be in the future` };
  }
  
  // Check if date is not too far in the future (max 5 years)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 5);
  
  if (date > maxDate) {
    return { valid: false, error: `${fieldName} cannot be more than 5 years in the future` };
  }
  
  return { valid: true };
};

/**
 * Validates URL format and ensures it's HTTPS
 */
export const validateURL = (url: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!url || typeof url !== 'string') {
    return { valid: true, sanitized: '' }; // URL is optional
  }
  
  const trimmed = url.trim();
  
  if (trimmed === '') {
    return { valid: true, sanitized: '' };
  }
  
  try {
    const urlObj = new URL(trimmed);
    
    // Only allow https:// for security
    if (urlObj.protocol !== 'https:') {
      return { valid: false, error: 'URL must use HTTPS protocol' };
    }
    
    return { valid: true, sanitized: urlObj.href };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validates job short description
 */
export const validateShortDescription = (short: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!short || typeof short !== 'string') {
    return { valid: true, sanitized: '' }; // Short description is optional
  }
  
  const trimmed = short.trim();
  
  if (trimmed.length > 200) {
    return { valid: false, error: 'Short description must be less than 200 characters' };
  }
  
  return { valid: true, sanitized: trimmed };
};

/**
 * Validates job description (allows HTML but sanitizes it)
 */
export const validateJobDescription = (description: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!description || typeof description !== 'string') {
    return { valid: true, sanitized: '' }; // Description is optional
  }
  
  const trimmed = description.trim();
  
  if (trimmed.length > 50000) {
    return { valid: false, error: 'Description is too long (max 50,000 characters)' };
  }
  
  // Sanitize the HTML
  const sanitized = sanitizeHTML(trimmed);
  
  return { valid: true, sanitized };
};

// ==================== COMPLETE JOB VALIDATION ====================

export interface JobValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedData?: {
    title: string;
    short: string;
    location: string;
    fee: number;
    applyBy: string;
    examDate?: string;
    description: string;
    registrationLink?: string;
  };
}

/**
 * Validates complete job data
 */
export const validateJobData = (data: any): JobValidationResult => {
  const errors: Record<string, string> = {};
  
  // Validate title
  const titleResult = validateJobTitle(data.title);
  if (!titleResult.valid) {
    errors.title = titleResult.error!;
  }
  
  // Validate location
  const locationResult = validateLocation(data.location, 'Location');
  if (!locationResult.valid) {
    errors.location = locationResult.error!;
  }
  
  // Validate fee
  const feeResult = validateFee(data.fee || 0);
  if (!feeResult.valid) {
    errors.fee = feeResult.error!;
  }
  
  // Validate apply by date
  const applyByResult = validateFutureDate(data.applyBy, 'Apply by date');
  if (!applyByResult.valid) {
    errors.applyBy = applyByResult.error!;
  }
  
  // Validate exam date (optional)
  if (data.examDate) {
    const examDateResult = validateFutureDate(data.examDate, 'Exam date');
    if (!examDateResult.valid) {
      errors.examDate = examDateResult.error!;
    }
  }
  
  // Validate registration link (optional)
  const urlResult = validateURL(data.registrationLink);
  if (!urlResult.valid) {
    errors.registrationLink = urlResult.error!;
  }
  
  // Validate short description
  const shortResult = validateShortDescription(data.short);
  if (!shortResult.valid) {
    errors.short = shortResult.error!;
  }
  
  // Validate and sanitize description
  const descResult = validateJobDescription(data.description);
  if (!descResult.valid) {
    errors.description = descResult.error!;
  }
  
  // If there are any errors, return invalid
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  
  // Return sanitized data
  return {
    valid: true,
    errors: {},
    sanitizedData: {
      title: titleResult.sanitized!,
      short: shortResult.sanitized || '',
      location: locationResult.sanitized!,
      fee: feeResult.sanitized!,
      applyBy: data.applyBy,
      examDate: data.examDate || '',
      description: descResult.sanitized!,
      registrationLink: urlResult.sanitized || '',
    }
  };
};

// ==================== USER PROFILE VALIDATION ====================

export interface ProfileValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedData?: {
    name: string;
    phone: string;
    district: string;
    state: string;
    email: string;
  };
}

/**
 * Validates complete user profile data
 */
export const validateProfileData = (data: any): ProfileValidationResult => {
  const errors: Record<string, string> = {};
  
  // Validate name
  const nameResult = validateName(data.name);
  if (!nameResult.valid) {
    errors.name = nameResult.error!;
  }
  
  // Validate phone
  const phoneResult = validatePhone(data.phone);
  if (!phoneResult.valid) {
    errors.phone = phoneResult.error!;
  }
  
  // Validate district
  const districtResult = validateLocation(data.district, 'District');
  if (!districtResult.valid) {
    errors.district = districtResult.error!;
  }
  
  // Validate state
  const stateResult = validateLocation(data.state, 'State');
  if (!stateResult.valid) {
    errors.state = stateResult.error!;
  }
  
  // Validate email
  const emailResult = validateEmail(data.email);
  if (!emailResult.valid) {
    errors.email = emailResult.error!;
  }
  
  // If there are any errors, return invalid
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  
  // Return sanitized data
  return {
    valid: true,
    errors: {},
    sanitizedData: {
      name: nameResult.sanitized!,
      phone: phoneResult.sanitized!,
      district: districtResult.sanitized!,
      state: stateResult.sanitized!,
      email: emailResult.sanitized!,
    }
  };
};

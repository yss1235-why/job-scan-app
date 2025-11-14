// src/lib/sanitize.ts
import DOMPurify from 'dompurify';

// ==================== HTML SANITIZATION ====================

export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  
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
  
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { valid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }
  
  return { valid: true, sanitized: trimmed };
};

export const validatePhone = (phone: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length !== 10) {
    return { valid: false, error: 'Phone number must be exactly 10 digits' };
  }
  
  if (!/^[6-9]/.test(cleaned)) {
    return { valid: false, error: 'Phone number must start with 6, 7, 8, or 9' };
  }
  
  return { valid: true, sanitized: cleaned };
};

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
  
  const locationRegex = /^[a-zA-Z\s-]+$/;
  if (!locationRegex.test(trimmed)) {
    return { valid: false, error: `${fieldName} can only contain letters, spaces, and hyphens` };
  }
  
  return { valid: true, sanitized: trimmed };
};

export const validateEmail = (email: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const trimmed = email.trim().toLowerCase();
  
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
  
  const sanitized = Math.round(fee * 100) / 100;
  
  return { valid: true, sanitized };
};

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
  
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 5);
  
  if (date > maxDate) {
    return { valid: false, error: `${fieldName} cannot be more than 5 years in the future` };
  }
  
  return { valid: true };
};

export const validateURL = (url: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!url || typeof url !== 'string') {
    return { valid: true, sanitized: '' };
  }
  
  const trimmed = url.trim();
  
  if (trimmed === '') {
    return { valid: true, sanitized: '' };
  }
  
  try {
    const urlObj = new URL(trimmed);
    
    if (urlObj.protocol !== 'https:') {
      return { valid: false, error: 'URL must use HTTPS protocol' };
    }
    
    return { valid: true, sanitized: urlObj.href };
  } catch (error) {
    return { valid: false, error: 'Invalid URL format' };
  }
};

export const validateShortDescription = (short: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!short || typeof short !== 'string') {
    return { valid: true, sanitized: '' };
  }
  
  const trimmed = short.trim();
  
  if (trimmed.length > 200) {
    return { valid: false, error: 'Short description must be less than 200 characters' };
  }
  
  return { valid: true, sanitized: trimmed };
};

export const validateJobDescription = (description: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!description || typeof description !== 'string') {
    return { valid: true, sanitized: '' };
  }
  
  const trimmed = description.trim();
  
  if (trimmed.length > 50000) {
    return { valid: false, error: 'Description is too long (max 50,000 characters)' };
  }
  
  const sanitized = sanitizeHTML(trimmed);
  
  return { valid: true, sanitized };
};

// ==================== NEW FIELD VALIDATIONS ====================

export const validateLocationType = (locationType: string): { valid: boolean; error?: string; sanitized?: string } => {
  const validTypes = ['local', 'state', 'national'];
  
  if (!locationType || typeof locationType !== 'string') {
    return { valid: false, error: 'Location type is required' };
  }
  
  const trimmed = locationType.trim().toLowerCase();
  
  if (!validTypes.includes(trimmed)) {
    return { valid: false, error: 'Location type must be local, state, or national' };
  }
  
  return { valid: true, sanitized: trimmed };
};

export const validateDistrict = (district: string, locationType: string): { valid: boolean; error?: string; sanitized?: string } => {
  // District is required only for local jobs
  if (locationType === 'local') {
    if (!district || typeof district !== 'string' || district.trim().length === 0) {
      return { valid: false, error: 'District is required for local jobs' };
    }
    
    const trimmed = district.trim();
    
    if (trimmed.length < 2) {
      return { valid: false, error: 'District name must be at least 2 characters' };
    }
    
    if (trimmed.length > 50) {
      return { valid: false, error: 'District name must be less than 50 characters' };
    }
    
    return { valid: true, sanitized: trimmed };
  }
  
  // For non-local jobs, district is optional
  return { valid: true, sanitized: district?.trim() || '' };
};

export const validateState = (state: string): { valid: boolean; error?: string; sanitized?: string } => {
  if (!state || typeof state !== 'string') {
    return { valid: false, error: 'State is required' };
  }
  
  const trimmed = state.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, error: 'State name must be at least 2 characters' };
  }
  
  if (trimmed.length > 50) {
    return { valid: false, error: 'State name must be less than 50 characters' };
  }
  
  return { valid: true, sanitized: trimmed };
};

export const validateSector = (sector: string): { valid: boolean; error?: string; sanitized?: string } => {
  const validSectors = ['government', 'private'];
  
  if (!sector || typeof sector !== 'string') {
    return { valid: false, error: 'Sector is required' };
  }
  
  const trimmed = sector.trim().toLowerCase();
  
  if (!validSectors.includes(trimmed)) {
    return { valid: false, error: 'Sector must be government or private' };
  }
  
  return { valid: true, sanitized: trimmed };
};

export const validateContractType = (contractType: string): { valid: boolean; error?: string; sanitized?: string } => {
  const validTypes = ['permanent', 'contract', 'temporary', 'part-time'];
  
  if (!contractType || typeof contractType !== 'string') {
    return { valid: false, error: 'Contract type is required' };
  }
  
  const trimmed = contractType.trim().toLowerCase();
  
  if (!validTypes.includes(trimmed)) {
    return { valid: false, error: 'Contract type must be permanent, contract, temporary, or part-time' };
  }
  
  return { valid: true, sanitized: trimmed };
};

// ==================== COMPLETE JOB VALIDATION ====================

export interface JobValidationResult {
  valid: boolean;
  errors: Record<string, string>;
  sanitizedData?: {
    title: string;
    short: string;
    location: string;
    locationType: 'local' | 'state' | 'national';
    district?: string;
    state: string;
    sector: 'government' | 'private';
    contractType: 'permanent' | 'contract' | 'temporary' | 'part-time';
    fee: number;
    applyBy: string;
    examDate?: string;
    description: string;
    registrationLink?: string;
  };
}

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
  
  // Validate location type
  const locationTypeResult = validateLocationType(data.locationType);
  if (!locationTypeResult.valid) {
    errors.locationType = locationTypeResult.error!;
  }
  
  // Validate district (required for local jobs)
  const districtResult = validateDistrict(data.district, data.locationType);
  if (!districtResult.valid) {
    errors.district = districtResult.error!;
  }
  
  // Validate state
  const stateResult = validateState(data.state);
  if (!stateResult.valid) {
    errors.state = stateResult.error!;
  }
  
  // Validate sector
  const sectorResult = validateSector(data.sector);
  if (!sectorResult.valid) {
    errors.sector = sectorResult.error!;
  }
  
  // Validate contract type
  const contractTypeResult = validateContractType(data.contractType);
  if (!contractTypeResult.valid) {
    errors.contractType = contractTypeResult.error!;
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
      locationType: locationTypeResult.sanitized as 'local' | 'state' | 'national',
      district: districtResult.sanitized || '',
      state: stateResult.sanitized!,
      sector: sectorResult.sanitized as 'government' | 'private',
      contractType: contractTypeResult.sanitized as 'permanent' | 'contract' | 'temporary' | 'part-time',
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

export const validateProfileData = (data: any): ProfileValidationResult => {
  const errors: Record<string, string> = {};
  
  const nameResult = validateName(data.name);
  if (!nameResult.valid) {
    errors.name = nameResult.error!;
  }
  
  const phoneResult = validatePhone(data.phone);
  if (!phoneResult.valid) {
    errors.phone = phoneResult.error!;
  }
  
  const districtResult = validateLocation(data.district, 'District');
  if (!districtResult.valid) {
    errors.district = districtResult.error!;
  }
  
  const stateResult = validateLocation(data.state, 'State');
  if (!stateResult.valid) {
    errors.state = stateResult.error!;
  }
  
  const emailResult = validateEmail(data.email);
  if (!emailResult.valid) {
    errors.email = emailResult.error!;
  }
  
  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }
  
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

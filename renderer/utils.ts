export const formatFullName = (officer: any, kapisanan?: string) => {
  if (!officer) return '';
  if (officer.name && !officer.firstName) return officer.name;

  const isMarriedWoman = officer.gender === 'BABAE' && officer.lastNameSpouse && officer.lastNameSpouse.trim() !== '';
  const first = officer.firstName || '';
  const mid = officer.lastNameMother || ''; // Full middle name (mother's last name)
  const last = officer.lastNameFather || ''; // Apelyido sa Ama
  const spouseLast = isMarriedWoman ? officer.lastNameSpouse : '';
  const suffix = officer.suffix ? officer.suffix : '';

  // Format: Last, First Suffix Middle - Husband's Surname (for BUKLOD married women)
  if (kapisanan === 'BUKLOD' && spouseLast) {
    // BUKLOD with husband's surname: Last, First Suffix Middle - Husband's Surname
    const parts = [first, suffix, mid].filter(Boolean);
    return `${last}, ${parts.join(' ')} - ${spouseLast}`;
  } else {
    // KADIWA AND BINHI (or BUKLOD without husband's surname): Last, First Suffix Middle
    const parts = [first, suffix, mid].filter(Boolean);
    return `${last}, ${parts.join(' ')}`;
  }
};

// Validation utilities
export const validatePhone = (phone: string): boolean => {
  if (!phone) return true; // Empty is allowed
  const phoneStr = phone.replace(/\D/g, ''); // Remove all non-digits
  return phoneStr.length >= 10 && phoneStr.length <= 15; // Philippine phone numbers are 10-11 digits
};

export const validateDate = (date: string): boolean => {
  if (!date) return true; // Empty is allowed
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

export const validateEmail = (email: string): boolean => {
  if (!email) return true; // Empty is allowed
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: any, fieldName: string): { valid: boolean; message: string } => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
};

export const validateOfficer = (officer: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Required fields
  const requiredFields = [
    { field: 'firstName', name: 'First Name' },
    { field: 'lastNameFather', name: 'Last Name (Father)' },
    { field: 'gender', name: 'Gender' },
    { field: 'kapisanan', name: 'Kapisanan' },
  ];

  requiredFields.forEach(({ field, name }) => {
    const validation = validateRequired(officer[field], name);
    if (!validation.valid) {
      errors.push(validation.message);
    }
  });

  // Phone validation
  if (officer.cellphone && !validatePhone(officer.cellphone)) {
    errors.push('Cellphone number must be 10-15 digits');
  }

  // Date validation
  if (officer.bday && !validateDate(officer.bday)) {
    errors.push('Birthday must be a valid date');
  }

  if (officer.marriageDate && !validateDate(officer.marriageDate)) {
    errors.push('Marriage date must be a valid date');
  }

  return { valid: errors.length === 0, errors };
};

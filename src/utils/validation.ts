
export const validateEmail = (email: string) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string) => {
  // Minimum 8 characters, at least one letter and one number
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasMinLength && hasLetter && hasNumber;
};

export const validatePhone = (phone: string) => {
  // Numbers only, 8-15 digits
  const isNumeric = /^\d+$/.test(phone);
  const hasValidLength = phone.length >= 8 && phone.length <= 15;
  return isNumeric && hasValidLength;
};

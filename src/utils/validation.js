export function validateFirstName(firstName) {
  if (!firstName.trim()) return "First Name is required.";
  if (firstName.length < 3) return "firstName must be at least 3 characters.";
  return "";
}

export function validateLastName(lastName) {
  if (!lastName.trim()) return "Last Name is required.";
  if (lastName.length < 3) return "Last Name must be at least 3 characters.";
  return "";
}

export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  if (!email.trim()) return "Email is required.";
  if (!emailRegex.test(email)) return "Invalid email format.";
  return "";
}

export function validatePassword(password) {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  return "";
}
export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) return "Confirm Password is required.";
  if (password !== confirmPassword) return "Passwords do not match.";
  return "";
}




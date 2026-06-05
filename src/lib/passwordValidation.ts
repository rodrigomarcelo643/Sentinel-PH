export function isPasswordValid(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export function passwordsMatch(password: string, confirmPassword: string): boolean {
  return password.length > 0 && password === confirmPassword;
}

export function getPasswordValidationError(password: string, confirmPassword: string): string | null {
  if (!password) return "Password is required";
  if (!isPasswordValid(password)) {
    return "Password must be at least 8 characters with uppercase, lowercase, and a number";
  }
  if (!passwordsMatch(password, confirmPassword)) {
    return "Passwords do not match";
  }
  return null;
}

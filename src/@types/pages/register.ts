// Types from src/pages/public/RegisterPage.tsx

export interface FormData {
  accountType: string;
  region: string;
  municipality: string;
  barangay: string;
  officeName: string;
  headOfficer: string;
  address: string;
  estimatedPopulation: string;
  officialEmail: string;
  fullName: string;
  email: string;
  phone: string;
  documents: File[];
  subscription: string;
  paymentMethod: string;
  username: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export interface FormErrors {
  [key: string]: string;
}
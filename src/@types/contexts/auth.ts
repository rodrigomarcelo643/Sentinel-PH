// Types from src/contexts/AuthContext.tsx

export interface User {
  email: string | null;
  uid: string;
  displayName?: string | null;
  role?: string;
  fullName?: string;
  phone?: string;
  officeName?: string;
  headOfficer?: string;
  officialEmail?: string;
  address?: string;
  municipality?: string;
  region?: string;
  accountType?: string;
  status?: string;
  subscription?: string;
  subscriptionStatus?: string;
  documentUrls?: string[];
  profilePicture?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => void;
}
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

interface User {
  email: string;
  uid: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users database
const MOCK_USERS = [
  { email: 'admin@sentinelph.com', password: 'admin123', uid: 'mock-uid-1' },
  { email: 'user@sentinelph.com', password: 'user123', uid: 'mock-uid-2' },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('sentinelph_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );
    
    if (!mockUser) {
      throw new Error('Invalid email or password');
    }
    
    const user = { email: mockUser.email, uid: mockUser.uid };
    setUser(user);
    localStorage.setItem('sentinelph_user', JSON.stringify(user));
  };

  const signup = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (MOCK_USERS.some(u => u.email === email)) {
      throw new Error('Email already exists');
    }
    
    const user = { email, uid: `mock-uid-${Date.now()}` };
    setUser(user);
    localStorage.setItem('sentinelph_user', JSON.stringify(user));
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('sentinelph_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

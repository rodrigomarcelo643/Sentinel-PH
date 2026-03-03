import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User as FirebaseUser
} from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface User {
  email: string | null;
  uid: string;
  displayName?: string | null;
  role?: string;
  firstName?: string;
  lastName?: string;
  middleInitial?: string;
  documents?: {
    selfieUrl?: string;
    validIdUrl?: string;
    idType?: string;
  };
  address?: {
    barangay?: string;
    municipality?: string;
    region?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'sentinelph_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<any> => {
    try {
      const collections = [
        { ref: collection(db, "users"), priority: 1 },
        { ref: collection(db, "registrations"), priority: 2 },
        { ref: collection(db, "admins"), priority: 3 }
      ];

      for (const { ref } of collections) {
        const q = query(ref, where("uid", "==", firebaseUser.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return snapshot.docs[0].data();
        }
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  const updateUser = (firebaseUser: FirebaseUser | null, userData: any = null) => {
    if (firebaseUser) {
      const newUser: User = {
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        displayName: userData?.firstName && userData?.lastName 
          ? `${userData.firstName} ${userData.lastName}` 
          : firebaseUser.displayName,
        role: userData?.role,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        middleInitial: userData?.middleInitial,
        documents: userData?.documents,
        address: userData?.address,
      };
      setUser(newUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    } else {
      setUser(null);
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Only update if this is the active tab or if there's no stored user
      const isActiveTab = document.visibilityState === 'visible' || !localStorage.getItem(USER_STORAGE_KEY);
      
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        if (isActiveTab) {
          updateUser(firebaseUser, userData);
        }
      } else {
        if (isActiveTab) {
          updateUser(null);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userData = await fetchUserData(userCredential.user);
    updateUser(userCredential.user, userData);
  };

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    setUser({
      email: userCredential.user.email,
      uid: userCredential.user.uid,
      displayName: userCredential.user.displayName,
    });
  };

  const logout = async () => {
    await signOut(auth);
    updateUser(null);
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

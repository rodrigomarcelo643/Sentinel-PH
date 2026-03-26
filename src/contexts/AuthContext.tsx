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
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import type { User, AuthContextType } from '@/@types/contexts/auth';

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
      // 1. Try direct lookup in admins (Document ID is UID)
      const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
      if (adminDoc.exists()) return adminDoc.data();

      // 2. Check registrations collection (Query needed as IDs are random)
      const registrationsRef = collection(db, "registrations");
      const regQuery = query(registrationsRef, where("uid", "==", firebaseUser.uid));
      const regSnapshot = await getDocs(regQuery);
      if (!regSnapshot.empty) {
        return regSnapshot.docs[0].data();
      }

      // 3. Fallback to users collection (Document ID is UID)
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) return userDoc.data();

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
        displayName: userData?.fullName || firebaseUser.displayName,
        role: userData?.role || userData?.accountType,
        fullName: userData?.fullName,
        phone: userData?.phone,
        officeName: userData?.officeName,
        headOfficer: userData?.headOfficer,
        officialEmail: userData?.officialEmail,
        address: userData?.address,
        municipality: userData?.municipality,
        region: userData?.region,
        accountType: userData?.accountType,
        status: userData?.status,
        subscription: userData?.subscription,
        subscriptionStatus: userData?.subscriptionStatus,
        documentUrls: userData?.documentUrls,
        profilePicture: userData?.profilePicture || userData?.documentUrls?.[0]
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
      if (firebaseUser) {
        const userData = await fetchUserData(firebaseUser);
        updateUser(firebaseUser, userData);
      } else {
        updateUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    console.log("AuthContext login attempt with email:", email);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Firebase auth successful, user:", userCredential.user);
    
    const userData = await fetchUserData(userCredential.user);
    console.log("Fetched user data:", userData);
    
    updateUser(userCredential.user, userData);
    console.log("User updated in context:", userData);
    return userData; // Return data for immediate use in redirection
  };

  const signup = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    setUser({
      email: userCredential.user.email,
      uid: userCredential.user.uid,
      displayName: userCredential.user.displayName,
    });
  };

  const updateUserProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  };

  const logout = async () => {
    await signOut(auth);
    updateUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUserProfile }}>
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

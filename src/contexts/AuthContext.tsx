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
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set persistence to LOCAL (remember user)
    setPersistence(auth, browserLocalPersistence);
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch role from Firestore
        let userRole = null;
        try {
          const registrationsRef = collection(db, "registrations");
          const regQuery = query(registrationsRef, where("uid", "==", firebaseUser.uid));
          const regSnapshot = await getDocs(regQuery);
          
          if (!regSnapshot.empty) {
            userRole = regSnapshot.docs[0].data().role;
          } else {
            const adminsRef = collection(db, "admins");
            const adminQuery = query(adminsRef, where("uid", "==", firebaseUser.uid));
            const adminSnapshot = await getDocs(adminQuery);
            
            if (!adminSnapshot.empty) {
              userRole = adminSnapshot.docs[0].data().role || "admin";
            }
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
        
        setUser({
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          role: userRole,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Fetch role from Firestore
    let userRole = null;
    try {
      const registrationsRef = collection(db, "registrations");
      const regQuery = query(registrationsRef, where("uid", "==", userCredential.user.uid));
      const regSnapshot = await getDocs(regQuery);
      
      if (!regSnapshot.empty) {
        userRole = regSnapshot.docs[0].data().role;
      } else {
        const adminsRef = collection(db, "admins");
        const adminQuery = query(adminsRef, where("uid", "==", userCredential.user.uid));
        const adminSnapshot = await getDocs(adminQuery);
        
        if (!adminSnapshot.empty) {
          userRole = adminSnapshot.docs[0].data().role || "admin";
        }
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
    
    setUser({
      email: userCredential.user.email,
      uid: userCredential.user.uid,
      displayName: userCredential.user.displayName,
      role: userRole,
    });
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
    setUser(null);
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

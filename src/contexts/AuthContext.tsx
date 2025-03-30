
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile 
} from 'firebase/auth';
import { auth, database } from '@/lib/firebase';
import { ref, set, get } from 'firebase/database';

interface AuthContextType {
  currentUser: User | null;
  userRole: string;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string>('patient');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Get user role from database
        const userRef = ref(database, `users/${user.uid}/role`);
        const snapshot = await get(userRef);
        if (snapshot.exists()) {
          setUserRole(snapshot.val());
        } else {
          setUserRole('patient'); // Default role
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register new user
  const register = async (email: string, password: string, name: string, role: string = 'patient') => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with name
      await updateProfile(user, {
        displayName: name
      });
      
      // Store user role in database
      await set(ref(database, `users/${user.uid}`), {
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      });
      
      setUserRole(role);
    } catch (error) {
      console.error("Error during registration:", error);
      throw error;
    }
  };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user role
      const userRef = ref(database, `users/${user.uid}/role`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        setUserRole(snapshot.val());
      }
      
      return user;
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userRole,
    login,
    register,
    logout,
    isAdmin: userRole === 'admin',
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

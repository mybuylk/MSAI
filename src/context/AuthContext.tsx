import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface UserSettings {
  language: {
    selected: string;
  };
  appearance: {
    theme: 'light' | 'dark';
    fontSize: 'small' | 'medium' | 'large';
    sidebarCompact: boolean;
    animationsEnabled: boolean;
    chatBubbleStyle: 'modern' | 'classic' | 'glass';
  };
  chat: {
    typingAnimation: boolean;
    markdownRendering: boolean;
    codeHighlighting: boolean;
    messageSound: boolean;
  };
  ai: {
    responseSpeed: 'fast' | 'balanced' | 'thorough';
    personality: 'creative' | 'balanced' | 'smart';
    memoryMode: boolean;
    welcomeMessage: string;
  };
  notification: {
    enabled: boolean;
    soundEffects: boolean;
    desktopAlerts: boolean;
  };
}

export const DEFAULT_SETTINGS: UserSettings = {
  language: { selected: 'en' },
  appearance: {
    theme: 'light',
    fontSize: 'medium',
    sidebarCompact: false,
    animationsEnabled: true,
    chatBubbleStyle: 'modern',
  },
  chat: {
    typingAnimation: true,
    markdownRendering: true,
    codeHighlighting: true,
    messageSound: false,
  },
  ai: {
    responseSpeed: 'balanced',
    personality: 'balanced',
    memoryMode: true,
    welcomeMessage: '',
  },
  notification: {
    enabled: true,
    soundEffects: true,
    desktopAlerts: true,
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  userSettings: UserSettings | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setUserSettings(DEFAULT_SETTINGS);
        setLoading(false);
        // Sync user to Firestore
        const userRef = doc(db, 'users', user.uid);
        
    getDoc(userRef).then(async (userSnap) => {
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid || '',
          email: user.email || '',
          displayName: user.displayName || 'User',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          settings: DEFAULT_SETTINGS
        });
        setUserSettings(DEFAULT_SETTINGS);
      } else {
        const data = userSnap.data();
        const fetched = data.settings || {};
        // Deep merge categories
        const merged = { ...DEFAULT_SETTINGS } as any;
        for (const key in fetched) {
          if (typeof fetched[key] === 'object' && fetched[key] !== null) {
            merged[key] = { ...merged[key], ...fetched[key] };
          } else {
            merged[key] = fetched[key];
          }
        }
        setUserSettings(merged);
      }
    }).catch(error => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      setUserSettings(DEFAULT_SETTINGS);
    });
      } else {
        setUser(null);
        setUserSettings(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const userRef = doc(db, 'users', user.uid);
      // Deep merge for the top level objects
      const updatedSettings = { ...userSettings } as any;
      
      for (const key in newSettings) {
        if (typeof (newSettings as any)[key] === 'object' && (newSettings as any)[key] !== null) {
          updatedSettings[key] = { ...updatedSettings[key], ...(newSettings as any)[key] };
        } else {
          updatedSettings[key] = (newSettings as any)[key];
        }
      }

      await updateDoc(userRef, { settings: updatedSettings });
      setUserSettings(updatedSettings as UserSettings);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, userSettings, loginWithGoogle, logout, updateSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export type { UserSettings };

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

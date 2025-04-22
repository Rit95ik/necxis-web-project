'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { 
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  Auth,
  getAuth,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from './firebase';

// Check if code is running on the client side
const isClient = typeof window !== 'undefined';

// Define the auth context type
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  authError: string | null;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  authError: null
});

// Export hook for using the auth context
export const useAuth = () => useContext(AuthContext);

// Create Google provider instance
const googleProvider = new GoogleAuthProvider();

// Auth provider component
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Function to store user data in localStorage
  const storeUserInLocalStorage = (user: any) => {
    if (!user) {
      localStorage.removeItem('authUser');
      return;
    }

    try {
      localStorage.setItem('authUser', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }));
    } catch (error) {
      console.warn('Could not store user in localStorage:', error);
    }
  };

  // Handle redirect result after sign-in with popup/redirect
  const handleRedirectResult = async () => {
    if (!isClient) return;
    
    console.log('Checking for auth redirect result...');
    try {
      // Check if we were redirected from the external login page
      const urlParams = new URLSearchParams(window.location.search);
      const authStatus = urlParams.get('auth_status');
      
      if (authStatus === 'success') {
        console.log('Auth success from redirect');
        // The user data should already be in localStorage from the redirect page
        try {
          const storedUser = localStorage.getItem('authUser');
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            setCurrentUser(userData);
            setLoading(false);
            console.log('User data loaded from redirect:', userData.displayName);
            
            // Clear URL parameters without full page reload
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            
            return;
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
        }
      }
      
      // Standard Firebase redirect result check
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        console.log('Firebase redirect result obtained:', result.user.displayName);
        setCurrentUser(result.user);
        
        // Store user in localStorage
        storeUserInLocalStorage(result.user);
      }
    } catch (error) {
      console.error('Error handling redirect result:', error);
      setAuthError('Authentication failed. Please try again.');
    }
  };

  // Google sign-in handler - use redirect
  const signInWithGoogle = async () => {
    if (!isClient) return;
    
    setAuthError(null);
    
    try {
      // Configure the provider
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });
      
      // Use redirect-based login as specified
      console.log('Starting Google sign-in redirect...');
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error('Error initiating Google sign-in:', error);
      
      if (error instanceof Error) {
        setAuthError(error.message);
      } else {
        setAuthError('An unknown error occurred during sign in');
      }
    }
  };

  // Sign out handler
  const signOut = async () => {
    if (!isClient) return;
    
    setAuthError(null);
    
    try {
      await firebaseSignOut(auth);
      console.log('Signed out successfully');
      
      // Clear storage
      try {
        sessionStorage.clear();
        storeUserInLocalStorage(null);
        localStorage.removeItem('firebase:authUser');
        localStorage.removeItem('firebase:previousAuthUser');
      } catch (storageError) {
        console.warn('Could not clear storage:', storageError);
      }
      
      // Post a message to the mobile app to clear its session too
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SIGN_OUT' }));
      }
    } catch (error) {
      console.error('Error signing out:', error);
      if (error instanceof Error) {
        setAuthError(error.message);
      }
    }
  };

  // Check for stored user on initial load
  useEffect(() => {
    if (!isClient) {
      setLoading(false);
      return;
    }
    
    try {
      // Try to get user from localStorage
      const storedUser = localStorage.getItem('authUser');
      if (storedUser) {
        console.log('Found stored user in localStorage');
        setCurrentUser(JSON.parse(storedUser));
        setLoading(false);
      }
    } catch (error) {
      console.warn('Error reading from localStorage:', error);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    if (!isClient) {
      setLoading(false);
      return () => {};
    }
    
    try {
      console.log('Setting up auth state listener...');
      
      // Handle redirect result when component mounts
      handleRedirectResult().finally(() => {
        // Set up auth state listener only after checking redirect result
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
          setLoading(false);
          
          if (user) {
            console.log('Auth state changed - User is logged in:', user.displayName);
            setCurrentUser(user);
            
            // Store user data in localStorage for persistence
            storeUserInLocalStorage(user);
          } else {
            // Only clear current user if there's no stored user in localStorage
            try {
              const storedUser = localStorage.getItem('authUser');
              if (!storedUser) {
                console.log('Auth state changed - User is logged out');
                setCurrentUser(null);
              }
            } catch (error) {
              console.warn('Error checking localStorage:', error);
              setCurrentUser(null);
            }
          }
          
          // Notify mobile app about authentication state
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(
              JSON.stringify({ 
                type: 'AUTH_STATE_CHANGED', 
                user: user ? { uid: user.uid, email: user.email } : null 
              })
            );
          }
        });
        
        return () => unsubscribe();
      });
      
      // Listen for messages from mobile app
      const handleMessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'MOBILE_SIGN_OUT_REQUEST') {
            signOut();
          }
        } catch (error) {
          console.error('Error processing message from mobile app:', error);
        }
      };
  
      window.addEventListener('message', handleMessage);
  
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    } catch (error) {
      console.error('Error setting up auth state listener:', error);
      setLoading(false);
      return () => {};
    }
  }, []);

  // Provide auth context values
  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signOut,
    authError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Add type declaration for ReactNativeWebView
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
} 
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

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

// Auth provider component
export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Google sign-in handler
  const signInWithGoogle = async () => {
    if (!isClient) return;
    
    setAuthError(null);
    
    try {
      console.log('Attempting to sign in with Google...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Sign in successful:', result.user.displayName);
      
      // Clear any previous errors
      setAuthError(null);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      
      // Handle specific errors
      if (error instanceof Error) {
        setAuthError(error.message);
        
        // Check for common error codes in the error message
        const errorMessage = error.message;
        if (errorMessage.includes('popup-closed-by-user')) {
          setAuthError('Sign-in popup was closed before completing the sign-in');
        } else if (errorMessage.includes('cancelled-popup-request')) {
          setAuthError('The sign-in popup was cancelled');
        }
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

  // Listen for auth state changes
  useEffect(() => {
    if (!isClient) {
      setLoading(false);
      return () => {};
    }
    
    try {
      console.log('Setting up auth state listener...');
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        setLoading(false);
        
        console.log('Auth state changed:', user ? `User: ${user.displayName}` : 'No user');
        
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
        unsubscribe();
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
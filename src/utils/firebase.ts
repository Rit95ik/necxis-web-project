'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Check if code is running on the client side
const isClient = typeof window !== 'undefined';

// Default settings - used as fallback if environment variables are missing
const defaultSettings = {
  apiKey: "AIzaSyA3fnbWCWcMxAewpJrFKKkrTdK30M5Atig",
  authDomain: "necxis-a684f.firebaseapp.com",
  projectId: "necxis-a684f",
  storageBucket: "necxis-a684f.firebasestorage.app",
  messagingSenderId: "451037214549",
  appId: "1:451037214549:web:4f0006eb7726b808ee21dc",
  measurementId: "G-91CWYPCE51"
};

// Variables to store Firebase instances
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

// Only initialize Firebase on the client side
if (isClient) {
  try {
    // Firebase configuration with fallbacks for development
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || defaultSettings.apiKey,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultSettings.authDomain,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultSettings.projectId,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultSettings.storageBucket,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultSettings.messagingSenderId,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || defaultSettings.appId,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || defaultSettings.measurementId
    };

    console.log('Firebase config:', {
      apiKey: firebaseConfig.apiKey ? '✓ present' : '✗ missing',
      authDomain: firebaseConfig.authDomain ? '✓ present' : '✗ missing',
      projectId: firebaseConfig.projectId ? '✓ present' : '✗ missing',
      appId: firebaseConfig.appId ? '✓ present' : '✗ missing'
    });

    // Initialize Firebase
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    // Configure Google Auth Provider
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    
    // Create more robust fallbacks for client-side errors
    try {
      // Try one more time with default settings
      const fallbackConfig = { ...defaultSettings };
      app = !getApps().length ? initializeApp(fallbackConfig) : getApp();
      auth = getAuth(app);
      db = getFirestore(app);
      googleProvider = new GoogleAuthProvider();
      
      console.log('Firebase initialized with fallback configuration');
    } catch (fallbackError) {
      console.error('Fatal error initializing Firebase with fallbacks:', fallbackError);
      
      // Last resort dummy implementations
      app = {} as FirebaseApp;
      auth = {} as Auth;
      db = {} as Firestore;
      googleProvider = new GoogleAuthProvider();
    }
  }
} else {
  // Create dummy implementations for server-side rendering
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  googleProvider = new GoogleAuthProvider();
}

export { app, auth, db, googleProvider }; 
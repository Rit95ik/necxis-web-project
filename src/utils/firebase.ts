'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Check if code is running on the client side
const isClient = typeof window !== 'undefined';

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
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
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
    
    // Create dummy implementations for server-side rendering
    // @ts-ignore - This is a workaround for SSR
    app = {} as FirebaseApp;
    // @ts-ignore - This is a workaround for SSR
    auth = {} as Auth;
    // @ts-ignore - This is a workaround for SSR
    db = {} as Firestore;
    googleProvider = new GoogleAuthProvider();
  }
} else {
  // Create dummy implementations for server-side rendering
  // @ts-ignore - This is a workaround for SSR
  app = {} as FirebaseApp;
  // @ts-ignore - This is a workaround for SSR
  auth = {} as Auth;
  // @ts-ignore - This is a workaround for SSR
  db = {} as Firestore;
  googleProvider = new GoogleAuthProvider();
}

export { app, auth, db, googleProvider }; 
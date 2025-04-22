'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Box, CircularProgress, Typography, Button, Paper, Alert } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/utils/AuthContext';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/utils/firebase';

// Separate component that uses hooks safely
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [processingAuth, setProcessingAuth] = useState(true);

  useEffect(() => {
    // Process authentication
    async function processAuth() {
      try {
        // Check for error parameters in the URL
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const errorMessage = urlParams.get('error_message') || urlParams.get('error');
          
          if (errorMessage) {
            console.error('Auth error from URL:', errorMessage);
            setError(errorMessage);
            setProcessingAuth(false);
            return;
          }
        }

        // Check for redirect result
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('Authentication successful in callback:', result.user.email);
          
          // Store user in localStorage for persistence
          try {
            localStorage.setItem('authUser', JSON.stringify({
              uid: result.user.uid,
              email: result.user.email,
              displayName: result.user.displayName,
              photoURL: result.user.photoURL
            }));
          } catch (storageError) {
            console.warn('Could not store user in localStorage:', storageError);
          }
          
          setIsRedirecting(true);
          
          // Notify mobile app of successful authentication if in WebView
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'AUTH_SUCCESS',
              user: {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName
              }
            }));
          }
          
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else if (currentUser) {
          // User is already authenticated
          console.log('User already authenticated in callback page');
          setIsRedirecting(true);
          setTimeout(() => {
            router.push('/');
          }, 1000);
        }
      } catch (error) {
        console.error('Error processing authentication in callback:', error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unknown error occurred during authentication');
        }
      } finally {
        setProcessingAuth(false);
      }
    }
    
    processAuth();
  }, [currentUser, router]);

  const handleReturnToApp = () => {
    // If we're in a WebView, send a message to return to app
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'RETURN_TO_APP'
      }));
    } else {
      // Otherwise redirect to home page
      router.push('/');
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant="h5" align="center" gutterBottom>
          Authentication
        </Typography>
        
        {error ? (
          <>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Typography variant="body1" sx={{ mb: 3 }}>
              There was a problem signing you in. Please try again later.
            </Typography>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleReturnToApp}
            >
              Return to App
            </Button>
          </>
        ) : loading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Completing authentication...</Typography>
          </Box>
        ) : isRedirecting ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Authentication successful!
            </Alert>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Redirecting to the application...</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Waiting for authentication...
            </Alert>
            <CircularProgress sx={{ mb: 2 }} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

// Main page component with Suspense
export default function AuthCallback() {
  return (
    <Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3 
      }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
} 
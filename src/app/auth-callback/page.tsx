'use client';

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button, Paper, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/utils/AuthContext';

const AuthCallback = () => {
  const router = useRouter();
  const { currentUser, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check for error parameters in the URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const errorMessage = urlParams.get('error_message') || urlParams.get('error');
      
      if (errorMessage) {
        setError(errorMessage);
      }
    }

    // If user is logged in, redirect to home page
    if (currentUser && !loading) {
      setIsRedirecting(true);
      
      // Notify mobile app of successful authentication if in WebView
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'AUTH_SUCCESS',
          user: {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName
          }
        }));
      }
      
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  }, [currentUser, loading, router]);

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
};

export default AuthCallback; 
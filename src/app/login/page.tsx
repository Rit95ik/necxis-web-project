'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/utils/AuthContext';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '@/utils/firebase';

// Separate component that uses useSearchParams
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [redirectResult, setRedirectResult] = useState<any>(null);
  const [redirectError, setRedirectError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingRedirect, setProcessingRedirect] = useState(true);
  const { signInWithGoogle, currentUser, authError } = useAuth();

  // Handle redirect result as specified in the instructions
  useEffect(() => {
    async function handleRedirect() {
      try {
        setProcessingRedirect(true);
        const result = await getRedirectResult(auth);
        if (result) {
          setRedirectResult(result);
          console.log('Sign-in successful:', result.user);
        }
      } catch (error) {
        console.error('Error handling redirect:', error);
        if (error instanceof Error) {
          setRedirectError(error.message);
        } else {
          setRedirectError('An unknown error occurred');
        }
      } finally {
        setProcessingRedirect(false);
      }
    }

    handleRedirect();
  }, []);

  // Redirect logic
  useEffect(() => {
    // If user is authenticated, redirect to home
    if (currentUser && !loading && !processingRedirect) {
      router.push('/');
    }
  }, [currentUser, loading, processingRedirect, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error starting sign-in:', error);
    } finally {
      setLoading(false);
    }
  };

  if (processingRedirect) {
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
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Processing authentication...
        </Typography>
      </Box>
    );
  }

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
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          width: '100%', 
          maxWidth: 400,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Sign In
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
          Please sign in to continue to your account.
        </Typography>
        
        {(redirectError || authError) && (
          <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
            {redirectError || authError}
          </Alert>
        )}

        {redirectResult && (
          <Alert severity="success" sx={{ mb: 3, width: '100%' }}>
            Successfully signed in as {redirectResult.user.displayName || redirectResult.user.email}
          </Alert>
        )}
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleSignIn}
          disabled={loading}
          size="large"
          fullWidth
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Sign in with Google'}
        </Button>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </Typography>
      </Paper>
    </Box>
  );
}

// Main page component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={
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
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    }>
      <LoginContent />
    </Suspense>
  );
} 
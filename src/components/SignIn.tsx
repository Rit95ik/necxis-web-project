'use client';

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Box,
  Container,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { useAuth } from '@/utils/AuthContext';
import { useRouter } from 'next/navigation';

const SignIn: React.FC = () => {
  const { signInWithGoogle, authError, currentUser } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const router = useRouter();

  // Clear any old auth errors or pending states on mount
  useEffect(() => {
    // Clear any old redirect pending flags that might be hanging around
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('auth_redirect_pending') === 'true') {
        const redirectTime = parseInt(localStorage.getItem('auth_redirect_time') || '0', 10);
        const timeSinceRedirect = Date.now() - redirectTime;
        
        // If the flag is older than 2 minutes, it's stale
        if (timeSinceRedirect > 2 * 60 * 1000) {
          console.log('Clearing stale auth redirect flags on SignIn mount');
          localStorage.removeItem('auth_redirect_pending');
          localStorage.removeItem('auth_redirect_time');
        }
      }
    }
  }, []);

  // Handle redirection to dashboard when user becomes authenticated
  useEffect(() => {
    if (currentUser) {
      console.log('User authenticated in SignIn component, redirecting to dashboard');
      setIsSigningIn(false);
      
      // Store auth success
      localStorage.setItem('auth_successful', 'true');
      localStorage.setItem('auth_time', Date.now().toString());
      
      // Wait a moment before redirecting to ensure context is updated
      setTimeout(() => {
        router.push('/');
      }, 300);
    }
  }, [currentUser, router]);

  const handleSignIn = async () => {
    console.log('Sign in button clicked');
    setIsSigningIn(true);
    setInternalError(null);
    
    try {
      // First clear any old redirect flags
      localStorage.removeItem('auth_redirect_pending');
      localStorage.removeItem('auth_redirect_time');
      
      await signInWithGoogle();
      console.log('Sign in initiated');
      
      // Set a timeout to check if we're still in the loading state after 10 seconds
      // This would indicate that the redirect didn't happen correctly
      setTimeout(() => {
        if (isSigningIn) {
          console.log('Sign in taking too long, may have failed silently');
          setIsSigningIn(false);
          setInternalError('Authentication process is taking longer than expected. Please try again.');
        }
      }, 10000);
    } catch (error) {
      console.error('Error during sign in:', error);
      setIsSigningIn(false);
      
      if (error instanceof Error) {
        setInternalError(error.message);
      } else {
        setInternalError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Welcome
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
              Sign in to continue to Necxis App
            </Typography>

            {(authError || internalError) && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {authError || internalError}
              </Alert>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={isSigningIn ? <CircularProgress size={20} /> : <GoogleIcon />}
                onClick={handleSignIn}
                disabled={isSigningIn}
                size="large"
                sx={{ 
                  py: 1.5, 
                  borderColor: '#dddddd',
                  color: 'text.primary',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderColor: '#c6c6c6'
                  }
                }}
              >
                {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
              </Button>
            </Box>

            <Divider sx={{ my: 3 }} />
            
            <Typography variant="body2" color="text.secondary" align="center">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default SignIn; 
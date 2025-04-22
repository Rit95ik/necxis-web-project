'use client';

import React, { useState } from 'react';
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

const SignIn: React.FC = () => {
  const { signInWithGoogle, authError } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    await signInWithGoogle();
    setIsSigningIn(false);
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

            {authError && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {authError}
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
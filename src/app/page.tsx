'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Snackbar, Typography } from '@mui/material';
import { useAuth } from '@/utils/AuthContext';
import Layout from '@/components/Layout';
import SignIn from '@/components/SignIn';
import Dashboard from '@/components/Dashboard';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { currentUser, loading, authError } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [initialAuthCheck, setInitialAuthCheck] = useState(true);
  
  // Prevent hydration mismatch by waiting for client-side rendering
  useEffect(() => {
    setIsMounted(true);
    
    // Check for stored auth in localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('authUser');
        if (!storedUser && !loading && !currentUser) {
          console.log('No stored user found, redirecting to login page');
          router.push('/login');
        } else {
          setInitialAuthCheck(false);
        }
      } catch (error) {
        console.error('Error checking localStorage:', error);
        setInitialAuthCheck(false);
      }
    }
  }, []);

  // Show success message when user signs in
  useEffect(() => {
    if (currentUser && isMounted) {
      setShowSuccess(true);
      setInitialAuthCheck(false);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, isMounted]);

  // Redirect to login if no user after loading completes
  useEffect(() => {
    if (!loading && !currentUser && isMounted) {
      console.log('No authenticated user found, redirecting to login');
      router.push('/login');
    }
  }, [loading, currentUser, router, isMounted]);

  if (!isMounted || initialAuthCheck) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Layout>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {currentUser ? <Dashboard /> : (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Redirecting to Login Page...
              </Typography>
              <CircularProgress sx={{ mt: 2 }} />
            </Box>
          )}
          
          <Snackbar 
            open={showSuccess} 
            autoHideDuration={3000} 
            onClose={() => setShowSuccess(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert severity="success">
              Successfully signed in as {currentUser?.displayName || 'User'}
            </Alert>
          </Snackbar>
        </>
      )}
    </Layout>
  );
} 
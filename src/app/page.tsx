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
  
  // Prevent hydration mismatch by waiting for client-side rendering
  useEffect(() => {
    setIsMounted(true);
    console.log('Page mounted, checking authentication state...');
    console.log('Current user from context:', currentUser ? 'User is authenticated' : 'No user');
    
    // Check for stored auth in localStorage
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('authUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('Found stored user in localStorage:', userData.email);
          setShowSuccess(true);
        } else {
          console.log('No user found in localStorage');
        }
      } catch (error) {
        console.error('Error checking localStorage:', error);
      }
    }
  }, [currentUser]);

  // Show success message when user signs in
  useEffect(() => {
    if (currentUser && isMounted) {
      console.log('User signed in, showing success message:', currentUser);
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, isMounted]);

  if (!isMounted) {
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
          {currentUser ? (
            <Dashboard />
          ) : (
            <Box sx={{ padding: 3 }}>
              <SignIn />
            </Box>
          )}
          
          <Snackbar 
            open={showSuccess && currentUser} 
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
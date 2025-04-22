'use client';

import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert, Snackbar } from '@mui/material';
import { useAuth } from '@/utils/AuthContext';
import Layout from '@/components/Layout';
import SignIn from '@/components/SignIn';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const { currentUser, loading, authError } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Prevent hydration mismatch by waiting for client-side rendering
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show success message when user signs in
  useEffect(() => {
    if (currentUser && isMounted) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUser, isMounted]);

  if (!isMounted) {
    return null;
  }

  return (
    <Layout>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {currentUser ? <Dashboard /> : <SignIn />}
          
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
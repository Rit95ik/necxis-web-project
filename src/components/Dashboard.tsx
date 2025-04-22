'use client';

import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  Paper, 
  Avatar,
  Button
} from '@mui/material';
import { useAuth } from '@/utils/AuthContext';

const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <Box>
      {/* Welcome section */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
          <Avatar 
            src={currentUser?.photoURL || ''} 
            alt={currentUser?.displayName || ''}
            sx={{ width: 60, height: 60, mr: 3 }}
          />
          <Box>
            <Typography variant="h5" component="h1" gutterBottom>
              Welcome, {currentUser?.displayName || 'User'}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              This is your personal dashboard.
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Dashboard content */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Application Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1">
                Your account is active
              </Typography>
              <Box 
                sx={{ 
                  width: 10, 
                  height: 10, 
                  borderRadius: '50%', 
                  bgcolor: 'success.main' 
                }} 
              />
            </Box>
            <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
              Connected via Google Authentication
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1" gutterBottom>
                {currentUser?.email}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                User ID
              </Typography>
              <Typography variant="body1" gutterBottom>
                {currentUser?.uid}
              </Typography>
              
              <Button 
                variant="outlined" 
                size="small" 
                sx={{ mt: 2 }}
              >
                Update Profile
              </Button>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notifications
            </Typography>
            <Typography variant="body1">
              You will receive notifications on this device when important events occur.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => {
                // For WebView communication
                if (window.ReactNativeWebView) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'REQUEST_NOTIFICATION_PERMISSION'
                  }));
                }
              }}
            >
              Enable Notifications
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 
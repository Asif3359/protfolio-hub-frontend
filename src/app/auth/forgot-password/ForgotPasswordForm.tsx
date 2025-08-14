'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Avatar,
  Link as MuiLink,
} from '@mui/material';
import { Email } from '@mui/icons-material';

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await forgotPassword(email);
      
      if (result.success) {
        setSuccess('Password reset code has been sent to your email address.');
      } else {
        setError(result.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: 'grey.50',
      py: { xs: 2, sm: 3, md: 4 },
      px: { xs: 1, sm: 2, md: 3 },
    }}>
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          mx: { xs: 1, sm: 2 },
          textAlign: 'center' 
        }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
              <Email />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
              Forgot your password?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your email address and we&apos;ll send you a reset code.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 2 }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {success}
                </Typography>
                <MuiLink component={Link} href="/auth/reset-password" color="primary">
                  Go to Reset Password
                </MuiLink>
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
            >
              {loading ? 'Sending...' : 'Send Reset Code'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <MuiLink component={Link} href="/auth/login" color="primary">
                Back to Login
              </MuiLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

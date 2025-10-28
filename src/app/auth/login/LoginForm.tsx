"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Paper,
  Alert,
  Avatar,
  Link as MuiLink,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';

export const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const { login, resendVerification } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(
        formData.email,
        formData.password,
        formData.rememberMe
      );
      console.log('Login result:', result);
      if (result.success) {
        console.log('User role:', result.data?.role);
        // Redirect based on user role
        if (result.data?.role === "admin") {
          console.log('Redirecting to Admin Dashboard');
          window.location.href = "/Admin-Dashboard";
        } else if (result.data?.role === "customer") {
          console.log('Redirecting to Client Dashboard');
          window.location.href = "/Client-Dashboard";
        } else {
          console.log('Redirecting to Home');
          window.location.href = "/";
        }
      } else {
        if (result.message?.includes("verify your email")) {
          setShowVerificationMessage(true);
          setUnverifiedEmail(formData.email);
        } else {
          setError(result.message || "Login failed");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      const result = await resendVerification(unverifiedEmail);
      if (result.success) {
        setError("Verification email sent successfully!");
        setShowVerificationMessage(false);
      } else {
        setError(result.message || "Failed to send verification email");
      }
    } catch (err) {
      setError("Failed to send verification email");
    } finally {
      setLoading(false);
    }
  };

  if (showVerificationMessage) {
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
            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
              <LockOutlined />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
              Email Verification Required
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please check your email and verify your account before logging in.
            </Typography>
            
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Didn&apos;t receive the verification email?
              </Typography>
              <Button
                onClick={handleResendVerification}
                disabled={loading}
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? "Sending..." : "Resend Verification Email"}
              </Button>
              <Button
                onClick={() => setShowVerificationMessage(false)}
                variant="outlined"
                color="primary"
                fullWidth
              >
                Back to Login
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

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
        }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 } }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              mx: 'auto', 
              mb: 2,
              width: { xs: 56, sm: 64 },
              height: { xs: 56, sm: 64 }
            }}>
              <LockOutlined sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ 
              mb: 1, 
              fontWeight: 600,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}>
              Sign in to your account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}>
              Or{" "}
              <MuiLink component={Link} href="/auth/signup" color="primary">
                create a new account
              </MuiLink>
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
              value={formData.email}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              sx={{ mb: 2 }}
            />

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              mb: 2,
              gap: { xs: 1, sm: 0 }
            }}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Remember me"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              />
              <MuiLink 
                component={Link} 
                href="/auth/forgot-password" 
                variant="body2" 
                color="primary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Forgot your password?
              </MuiLink>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
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
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

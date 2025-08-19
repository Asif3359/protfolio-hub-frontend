"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Alert,
  Avatar,
  Link as MuiLink,
  FormHelperText,
  SelectChangeEvent,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";

export const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationCountdown, setVerificationCountdown] = useState(0);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [pollIntervalRef, setPollIntervalRef] = useState<NodeJS.Timeout | null>(
    null
  );
  const [countdownIntervalRef, setCountdownIntervalRef] =
    useState<NodeJS.Timeout | null>(null);

  const { signup, verifyEmail } = useAuth();
  const router = useRouter();

  // Cleanup intervals on component unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef) clearInterval(pollIntervalRef);
      if (countdownIntervalRef) clearInterval(countdownIntervalRef);
    };
  }, [pollIntervalRef, countdownIntervalRef]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // const handleSelectChange = (event: SelectChangeEvent) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     role: event.target.value,
  //   }));
  // };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://protfolio-hub-backend.onrender.com/api/auth/resend-verification",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(
          "Verification email sent successfully! Please check your inbox."
        );
        setShowResendButton(false);
        setVerifying(true);
        setVerificationCountdown(180); // Restart 3-minute countdown

        // Clear any existing intervals first
        if (pollIntervalRef) clearInterval(pollIntervalRef);
        if (countdownIntervalRef) clearInterval(countdownIntervalRef);

        // Restart polling
        const pollInterval = setInterval(async () => {
          try {
            const response = await fetch(
              "https://protfolio-hub-backend.onrender.com/api/auth/check-verification",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email: formData.email }),
              }
            );

            const data = await response.json();

                          if (data.verified) {
                // Clear all intervals
                if (pollIntervalRef) clearInterval(pollIntervalRef);
                if (countdownIntervalRef) clearInterval(countdownIntervalRef);
                setPollIntervalRef(null);
                setCountdownIntervalRef(null);

                setVerifying(false);
                setVerificationCountdown(0);
                setShowResendButton(false); // Hide resend button
                setSuccess(
                  "Email verified successfully! Redirecting to dashboard..."
                );

                // Set user state in sessionStorage for resend verification
                if (data.user) {
                  const storage = sessionStorage;
                  storage.setItem('user', JSON.stringify(data.user));
                  console.log('User data set in sessionStorage (resend):', data.user); // Debug log
                }

                setTimeout(() => {
                  console.log('Resend verification - Executing redirect...'); // Debug log
                  if (data.user?.role === "admin") {
                    console.log('Redirecting to Admin Dashboard'); // Debug log
                    window.location.href = "/Admin-Dashboard";
                  } else if (data.user?.role === "customer") {
                    console.log('Redirecting to Client Dashboard'); // Debug log
                    window.location.href = "/Client-Dashboard";
                  } else {
                    console.log('Unknown role, redirecting to home'); // Debug log
                    window.location.href = "/";
                  }
                }, 2000); // 2 second delay to show success message
              }
          } catch (err) {
            console.error("Error checking verification status:", err);
          }
        }, 10000);

        setPollIntervalRef(pollInterval);

        // Restart countdown
        const countdownInterval = setInterval(() => {
          setVerificationCountdown((prev) => {
            if (prev <= 1) {
              // Clear all intervals
              if (pollIntervalRef) clearInterval(pollIntervalRef);
              if (countdownIntervalRef) clearInterval(countdownIntervalRef);
              setPollIntervalRef(null);
              setCountdownIntervalRef(null);

              setVerifying(false);
              setShowResendButton(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setCountdownIntervalRef(countdownInterval);
      } else {
        setError(data.message || "Failed to resend verification email");
      }
    } catch (err) {
      setError(
        "An unexpected error occurred while resending verification email"
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const result = await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );

      if (result.success) {
        // Check if user is verified
        if (result.data?.verified) {
          // User is verified, redirect to appropriate dashboard
          if (result.data.role === "admin") {
            router.push("/Admin-Dashboard");
          } else if (result.data.role === "customer") {
            router.push("/Client-Dashboard");
          }
        } else {
          // User needs email verification - DO NOT redirect, stay on signup page
          setSuccess(
            "Account created successfully! Please check your email to verify your account."
          );
          setVerifying(true);
          setVerificationCountdown(180); // 3 minutes countdown

          // Start polling for verification status
          const pollInterval = setInterval(async () => {
            try {
              // You'll need to implement this API endpoint to check verification status
              const response = await fetch(
                "https://protfolio-hub-backend.onrender.com/api/auth/check-verification",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email: formData.email }),
                }
              );

              const data = await response.json();
              
              console.log('Verification check response:', data); // Debug log

              if (data.verified) {
                console.log('User verified! Clearing intervals and preparing redirect...'); // Debug log
                
                // Clear all intervals
                if (pollIntervalRef) clearInterval(pollIntervalRef);
                if (countdownIntervalRef) clearInterval(countdownIntervalRef);
                setPollIntervalRef(null);
                setCountdownIntervalRef(null);

                setVerifying(false);
                setVerificationCountdown(0);
                setShowResendButton(false); // Hide resend button
                setSuccess(
                  "Email verified successfully! Redirecting to dashboard..."
                );
                  const storage = sessionStorage;
                  if (result.token) {
                    storage.setItem('token', result.token);
                    sessionStorage.setItem('token', result.token);
                    localStorage.setItem('token', result.token);
                  }
                  storage.setItem('user', JSON.stringify(data.user));
                  sessionStorage.setItem('user', JSON.stringify(data.user));
                  localStorage.setItem('user', JSON.stringify(data.user));
                
                
                // Use the role from the verification response
                console.log('Using role from verification response:', data.user?.role); // Debug log
                
                // Add delay to show success message before redirecting
                setTimeout(() => {
                  console.log('Executing redirect...'); // Debug log
                  
                  // Use the same redirect pattern as login form
                  if (result.data?.role  === "admin") {
                    console.log('Redirecting to Admin Dashboard'); // Debug log
                    window.location.href = "/Admin-Dashboard";
                  } else if (result.data?.role === "customer") {
                    console.log('Redirecting to Client Dashboard'); // Debug log
                    window.location.href = "/Client-Dashboard";
                  } 
                }, 2000); // 2 second delay to show success message
              }
            } catch (err) {
              console.error("Error checking verification status:", err);
            }
          }, 1000); // Check every 10 seconds

          setPollIntervalRef(pollInterval);

          // Countdown timer
          const countdownInterval = setInterval(() => {
            setVerificationCountdown((prev) => {
              if (prev <= 1) {
                // Clear all intervals
                if (pollIntervalRef) clearInterval(pollIntervalRef);
                if (countdownIntervalRef) clearInterval(countdownIntervalRef);
                setPollIntervalRef(null);
                setCountdownIntervalRef(null);

                setVerifying(false);
                setShowResendButton(true); // Show resend button when countdown ends
                return 0;
              }
              return prev - 1;
            });
          }, 1000);

          setCountdownIntervalRef(countdownInterval);
        }
      } else {
        setError(result.message || "Signup failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mx: { xs: 1, sm: 2 },
          }}
        >
          <Box sx={{ textAlign: "center", mb: { xs: 3, sm: 4 } }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                mx: "auto",
                mb: 2,
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
              }}
            >
              <PersonAdd sx={{ fontSize: { xs: 28, sm: 32 } }} />
            </Avatar>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                mb: 1,
                fontWeight: 600,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              }}
            >
              Create your account
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
              }}
            >
              Or{" "}
              <MuiLink component={Link} href="/auth/login" color="primary">
                sign in to your existing account
              </MuiLink>
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleInputChange}
              sx={{ mb: { xs: 1.5, sm: 2 } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange}
              sx={{ mb: { xs: 1.5, sm: 2 } }}
            />
            {/* <FormControl fullWidth sx={{ mb: { xs: 1.5, sm: 2 } }}>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formData.role}
                label="Role"
                onChange={handleSelectChange}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl> */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
              sx={{ mb: { xs: 1.5, sm: 2 } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              sx={{ mb: { xs: 1.5, sm: 2 } }}
            />

            {error && (
              <Alert severity="error" sx={{ mb: { xs: 1.5, sm: 2 } }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: { xs: 1.5, sm: 2 } }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {success}
                </Typography>
                {verifying && (
                  <Box>
                    <Typography
                      variant="body2"
                      color="primary"
                      sx={{
                        mb: 1,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      Waiting for email verification...
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                      }}
                    >
                      Time remaining: {Math.floor(verificationCountdown / 60)}:
                      {(verificationCountdown % 60).toString().padStart(2, "0")}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      Checking verification status every 10 seconds...
                    </Typography>
                  </Box>
                )}
                {showResendButton && (
                  <Box sx={{ mt: { xs: 1.5, sm: 2 } }}>
                    <Button
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{
                        mb: 1,
                        py: { xs: 1, sm: 1.5 },
                      }}
                    >
                      {resendLoading
                        ? "Sending..."
                        : "Resend Verification Email"}
                    </Button>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        textAlign: "center",
                        display: "block",
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      }}
                    >
                      Didn&apos;t receive the email? Click the button above to
                      resend.
                    </Typography>
                  </Box>
                )}
              </Alert>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{
                mt: { xs: 1.5, sm: 2 },
                mb: { xs: 1.5, sm: 2 },
                py: { xs: 1, sm: 1.5 },
              }}
            >
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

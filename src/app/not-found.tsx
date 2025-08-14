"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Avatar,
} from "@mui/material";
import { Home, Search, ErrorOutline } from "@mui/icons-material";
import { useAuth } from "./contexts/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
        py: 3,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 6 },
            textAlign: "center",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Error Icon */}
          <Avatar
            sx={{
              bgcolor: "error.main",
              width: { xs: 80, sm: 120 },
              height: { xs: 80, sm: 120 },
              mx: "auto",
              mb: 3,
            }}
          >
            <ErrorOutline sx={{ fontSize: { xs: 40, sm: 60 } }} />
          </Avatar>

          {/* Error Code */}
          <Typography
            variant="h1"
            component="h1"
            sx={{
              fontSize: { xs: "4rem", sm: "6rem", md: "8rem" },
              fontWeight: 700,
              color: "primary.main",
              mb: 2,
              lineHeight: 1,
            }}
          >
            404
          </Typography>

          {/* Error Title */}
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 600,
              mb: 2,
              color: "text.primary",
            }}
          >
            Page Not Found
          </Typography>

          {/* Error Description */}
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              maxWidth: 500,
              mx: "auto",
              lineHeight: 1.6,
            }}
          >
            Oops! The page you&apos;re looking for doesn&apos;t exist. It might
            have been moved, deleted, or you entered the wrong URL.
          </Typography>

          {/* Action Buttons */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              component={Link}
              href="/"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<Home />}
              sx={{
                px: 4,
                py: 1.5,
                minWidth: { xs: "100%", sm: "auto" },
              }}
            >
              Go to Home
            </Button>

            {isMounted && user && (
              <Button
                component={Link}
                href={
                  user.role === "customer"
                    ? "/Client-Dashboard"
                    : "/Admin-Dashboard"
                }
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<Search />}
                sx={{
                  px: 4,
                  py: 1.5,
                  minWidth: { xs: "100%", sm: "auto" },
                }}
              >
                Go to{" "}
                {user.role === "customer"
                  ? "Client Dashboard"
                  : "Admin Dashboard"}
              </Button>
            )}
          </Box>

          {/* Additional Help */}
          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Need help? Contact our support team
            </Typography>
            <Typography
              variant="body2"
              component={Link}
              href="/auth/login"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Sign in to your account
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

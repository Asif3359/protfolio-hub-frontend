"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "../app/contexts/AuthContext";
import { Box, Button, Typography, AppBar, Toolbar, Container } from '@mui/material';

function NavBarComponent() {
  const { user } = useAuth();

  return (
    <AppBar elevation={1} sx={{ bgcolor: 'black', color: 'white', borderRadius: '0px', zIndex: 1000, top: 0, position: 'sticky', boxShadow: 'none', padding: 0, margin: 0 }} >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
            <Typography variant="h2" component="div" sx={{ fontWeight: 800, color: 'white' }}>
              <span style={{ color: 'green', fontWeight: 800 }}>Portfolio</span> <span style={{ color: 'white', fontWeight: 800 }}>Hub</span>
            </Typography>
          </Link>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <Button
                component={Link}
                href={user.role === "admin" ? "/Admin-Dashboard" : "/Client-Dashboard"}
                variant="contained"
                color="primary"
                size="medium"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                {user.role === "admin" ? "Admin Dashboard" : "Client Dashboard"}
              </Button>
            ) : (
              <Button
                component={Link}
                href="/auth/login"
                variant="outlined"
                color="inherit"
                sx={{ color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}

              >
                Login
              </Button>
            )}
            {user ? (
              <Button
                component={Link}
                href="/auth/logout"
                variant="outlined"
                color="inherit"
                sx={{ color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
              >
                Logout
              </Button>
            ) : (
              <Button
                component={Link}
                href="/auth/signup"
                variant="outlined"
                color="primary"
                size="medium"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' }
                }}
              >
                Sign Up
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBarComponent;

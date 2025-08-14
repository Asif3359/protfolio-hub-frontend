"use client";

import Link from "next/link";
import React from "react";
import { useAuth } from "../app/contexts/AuthContext";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Container,
} from "@mui/material";

function NavBarComponent() {
  const { user } = useAuth();

  return (
    <AppBar
      elevation={1}
      sx={{
        background:
              "linear-gradient(90deg, rgb(33, 100, 36) 0%, rgb(33, 100, 36) 100%)",
        color: "white",
        borderRadius: "0px",
        zIndex: 1000,
        top: 0,
        position: "sticky",
        boxShadow: "none",
        padding: 0,
        margin: 0,
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", py: 1 }}>
          <Link href="/" style={{ textDecoration: "none", color: "black" }}>
            <Typography
              variant="h2"
              component="div"
              sx={{ fontWeight: 800, color: "black" }}
            >
              <span style={{ color: "white", fontWeight: 800 }}>Portfolio</span>{" "}
              <span style={{ color: "black", fontWeight: 800 }}>Hub</span>
            </Typography>
          </Link>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {user ? (
              <Button
                component={Link}
                href={
                  user.role === "admin"
                    ? "/Admin-Dashboard"
                    : "/Client-Dashboard"
                }
                variant="contained"
                color="primary"
                size="medium"
                sx={{
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark", color: "white" },
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
                sx={{ color: "white", "&:hover": { bgcolor: "primary.dark", borderColor: "black" } }}
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
                sx={{ color: "white", "&:hover": { bgcolor: "primary.dark", borderColor: "black" } }}
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
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark", borderColor: "black" },
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

"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useAuth } from "../app/contexts/AuthContext";

// Define ProfileData interface to match AuthContext
interface ProfileData {
  _id: string;
  userId: string;
  headline: string;
  bio: string;
  location: string;
  phone: string;
  website: string;
  linkedin: string;
  facebook: string;
  github: string;
  portfolioLink: string;
  profileImage: string;
  updatedAt: string;
}
import { usePathname } from "next/navigation";
import {
  Box,
  Button,
  Typography,
  AppBar,
  Toolbar,
  Container,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Logout, AccountCircle } from "@mui/icons-material";

function NavBarComponent() {
  const { user, getProfileData } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const pathname = usePathname();

  const [profileData, setProfileData] = useState<{
    success: boolean;
    message?: string;
    data?: ProfileData;
  } | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      const profileData = await getProfileData();
      setProfileData(profileData);
    };
    fetchProfileData();
  }, [getProfileData]);
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutDialogOpen(false);
    // Add logout logic here if needed
    window.location.href = "/auth/logout";
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const navigationItems = [
    { text: "Home", href: "/" },
    { text: "About", href: "/about" },
    { text: "Services", href: "/services" },
    { text: "Portfolio", href: "/portfolio" },
    { text: "Contact", href: "/contact" },
    { text: "Blog", href: "/blog" },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={handleDrawerClose}>
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          justifyContent: "center",
          backgroundColor: "primary.main",
          color: "white",
        }}
      >
        <img
          src={profileData?.data?.profileImage}
          alt="logo"
          width={100}
          height={100}
          style={{ borderRadius: "50%", border: "1px solid white" }}
        />
        <Typography
          variant="h6"
          component="div"
          sx={{ fontWeight: 600, color: "white" }}
        >
          {user?.name}
        </Typography>
      </Box>
      <List>
        {navigationItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                sx={{
                  backgroundColor: isActive ? "primary.main" : "transparent",
                  color: isActive ? "white" : "text.primary",
                  "&:hover": {
                    backgroundColor: isActive ? "primary.dark" : "action.hover",
                  },
                }}
              >
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    color: isActive ? "white" : "inherit",
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
        <Divider sx={{ my: 1 }} />
        {user ? (
          <>
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                href={
                  user.role === "admin"
                    ? "/Admin-Dashboard"
                    : "/Client-Dashboard"
                }
              >
                <ListItemText
                  primary={
                    user.role === "admin"
                      ? "Admin Dashboard"
                      : "Client Dashboard"
                  }
                  primaryTypographyProps={{
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogoutClick}>
                <ListItemText
                  primary="Logout"
                  primaryTypographyProps={{ color: "error.main" }}
                />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/auth/login">
                <ListItemText
                  primary="Login"
                  primaryTypographyProps={{
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} href="/auth/signup">
                <ListItemText
                  primary="Sign Up"
                  primaryTypographyProps={{
                    color: "primary.main",
                    fontWeight: 600,
                  }}
                />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
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
            <Link
              href="/"
              style={{ textDecoration: "none", color: "primary.main" }}
            >
              <Typography
                variant={isMobile ? "h4" : "h2"}
                component="div"
                sx={{ fontWeight: 800, color: "black" }}
              >
                <span style={{ color: "white", fontWeight: 800 }}>
                  Portfolio
                </span>{" "}
                <span style={{ color: "black", fontWeight: 800 }}>Hub</span>
              </Typography>
            </Link>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {user ? (
                  <Button
                    component={Link}
                    href={
                      user.role === "admin"
                        ? "/Admin-Dashboard"
                        : "/Client-Dashboard"
                    }
                    variant="outlined"
                    color="primary"
                    size="medium"
                    sx={{
                      boxShadow: "none",
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                        borderColor: "black",
                      },
                    }}
                  >
                    {user.role === "admin"
                      ? "Admin Dashboard"
                      : "Client Dashboard"}
                  </Button>
                ) : (
                  <Button
                    component={Link}
                    href="/auth/login"
                    variant="outlined"
                    color="primary"
                    size="medium"
                    sx={{
                      boxShadow: "none",
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                        borderColor: "black",
                      },
                    }}
                  >
                    Login
                  </Button>
                )}
                {user ? (
                  <Button
                    onClick={handleLogoutClick}
                    variant="outlined"
                    color="primary"
                    size="medium"
                    sx={{
                      boxShadow: "none",
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                        borderColor: "black",
                      },
                    }}
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
                      boxShadow: "none",
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": {
                        bgcolor: "primary.dark",
                        borderColor: "black",
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                )}

                {/* Desktop Menu Button */}
                <IconButton
                  color="primary"
                  size="medium"
                  sx={{
                    boxShadow: "none",
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": {
                      bgcolor: "primary.dark",
                      borderColor: "black",
                    },
                  }}
                  onClick={handleDrawerToggle}
                >
                  <MenuIcon />
                </IconButton>
              </Box>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="primary"
                size="medium"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{
                  boxShadow: "none",
                  bgcolor: "primary.main",
                  color: "white",
                  "&:hover": { bgcolor: "primary.dark", borderColor: "black" },
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Drawer for all screen sizes */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 250 },
        }}
      >
        {drawer}
      </Drawer>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={handleLogoutCancel}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            border: "1px solid",
            borderColor: "divider",
            maxWidth: 400,
            width: "90%",
          },
        }}
      >
        <DialogTitle
          id="logout-dialog-title"
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            textAlign: "center",
            py: 2,
            "& .MuiTypography-root": {
              fontWeight: 600,
              fontSize: "1.25rem",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Logout sx={{ fontSize: 28 }} />
            Confirm Logout
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3, px: 3 }}>
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <AccountCircle
              sx={{ fontSize: 64, color: "primary.main", mb: 2 }}
            />
            <DialogContentText
              id="logout-dialog-description"
              sx={{
                fontSize: "1rem",
                color: "text.secondary",
                lineHeight: 1.6,
                mb: 1,
              }}
            >
              Are you sure you want to logout from your account?
            </DialogContentText>
            <DialogContentText
              sx={{
                fontSize: "0.875rem",
                color: "text.disabled",
                fontStyle: "italic",
              }}
            >
              You will be redirected to the login page
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
          <Button
            onClick={handleLogoutCancel}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 500,
              borderColor: "divider",
              "&:hover": {
                borderColor: "primary.main",
                backgroundColor: "primary.50",
              },
            }}
          >
            Stay Logged In
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            variant="contained"
            color="error"
            startIcon={<Logout />}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 500,
              boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(244, 67, 54, 0.4)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default NavBarComponent;

"use client";

import * as React from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { createTheme } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme as useMuiTheme,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Avatar,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home,
  Person,
  Work,
  Assessment,
  Settings,
  Logout,
  AccountCircle,
  School,
  EmojiEvents,
  Psychology,
  Star,
  WorkspacePremium,
  Chat,
} from "@mui/icons-material";

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

interface ClientDashboardLayoutProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

const navigationItems = [
  { title: "Dashboard", icon: <DashboardIcon />, path: "/Client-Dashboard" },
  { title: "Profile", icon: <Person />, path: "/Client-Dashboard/profile" },
  { title: "Education", icon: <School />, path: "/Client-Dashboard/education" },
  { title: "Projects", icon: <Work />, path: "/Client-Dashboard/projects" },
  { title: "Experience", icon: <Assessment />, path: "/Client-Dashboard/experience" },
  { title: "Research", icon: <Psychology />, path: "/Client-Dashboard/research" },
  {
    title: "Certification",
    icon: <WorkspacePremium />,
    path: "/Client-Dashboard/certification",
  },
  {
    title: "Achievement",
    icon: <EmojiEvents />,
    path: "/Client-Dashboard/achievement",
  },
  { title: "Skills", icon: <Star />, path: "/Client-Dashboard/skill" },
  { title: "Settings", icon: <Settings />, path: "/Client-Dashboard/settings" },
  { title: "Chat", icon: <Chat />, path: "/Client-Dashboard/chat" },
  { title: "Home", icon: <Home />, path: "/" },
];

export const ClientDashboardLayout: React.FC<ClientDashboardLayoutProps> = ({
  children,
}) => {
  const { user, logout, getProfileData } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = React.useState(false);
  const [profileData, setProfileData] = React.useState<ProfileData | null>(
    null
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
  };

  const handleLogoutConfirm = async () => {
    setLogoutDialogOpen(false);
    await logout();
    router.push("/auth/login");
  };

  const handleLogoutCancel = () => {
    setLogoutDialogOpen(false);
  };

  const fetchProfileData = async () => {
    const response = await getProfileData();
    if (response.success) {
      setProfileData(response.data || null);
    }
  };

  React.useEffect(() => {
    fetchProfileData();
  }, []);

  const drawer = (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: "0px",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          backgroundColor: "primary.main",
          color: "white",
          borderRadius: "0px",
        }}
      >
        {/* <img
          src={profileData?.profileImage || "/logo.png"}
          alt="Logo"
          width={100}
          height={100}
          style={{
            borderRadius: "50%",
            border: "1px solid white",
            objectFit: "cover",
          }}
        /> */}

        <Avatar
          src={profileData?.profileImage || "/logo.png"}
          alt="Logo"
          sx={{ width: 100, height: 100, border: "1px solid white" }}
        />
        <Typography variant="body2" color="white" sx={{ mt: 1 }}>
          Welcome, {user?.name}
        </Typography>
      </Box>

      <List sx={{ pt: 1, flexGrow: 1 }}>
        {navigationItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem key={item.title} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  backgroundColor: isActive ? "primary.main" : "transparent",
                  color: isActive ? "white" : "text.primary",
                  "&:hover": {
                    backgroundColor: isActive ? "primary.dark" : "action.hover",
                  },
                  "& .MuiListItemIcon-root": {
                    color: isActive ? "white" : "primary.main",
                  },
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ mt: "auto" }}>
        <Divider sx={{ my: 2 }} />
        <ListItem disablePadding>
          <ListItemButton onClick={() => router.push(`/protfolio/${user?.email}`)}>
            <ListItemIcon sx={{ color: "primary.main" }}>
              <Work />
            </ListItemIcon>
            <ListItemText primary="Portfolio" />
          </ListItemButton>
        </ListItem>
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogoutClick}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: "primary.main",
          color: "white",
          boxShadow: "none",
          borderBottom: "1px solid",
          borderColor: "divider",
          borderRadius: "0px",
        }}
      >
        <Toolbar
          sx={{
            borderRadius: "0px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, textAlign: "end" }}
          >
            Client Dashboard
          </Typography>
          {/* <IconButton color="inherit">
            <AccountCircle />
          </IconButton> */}
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "background.paper",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              backgroundColor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: "background.default",
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ p: 0 }}>
          {children}
        </Container>
      </Box>
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
    </Box>
  );
};

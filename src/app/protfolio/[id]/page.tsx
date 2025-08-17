"use client";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { trackView } from "@/utils/viewTracker";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Stack,
  LinearProgress,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  useScrollTrigger,
  Slide,
  Fab,
  Zoom,
  Fade,
  Grow,
} from "@mui/material";
import {
  Email,
  Phone,
  LocationOn,
  LinkedIn,
  GitHub,
  Twitter,
  Work,
  School,
  Star,
  Code,
  Language,
  Business,
  CalendarToday,
  Description,
  Facebook,
  Public,
  EmojiEvents,
  Science,
  KeyboardArrowUp,
  Home,
  Person,
  WorkOutline,
  SchoolOutlined,
  StarOutline,
  EmojiEventsOutlined,
  ScienceOutlined,
  Menu,
  Close,
} from "@mui/icons-material";

interface User {
  id: string;
  name: string;
  email: string;
  verified: boolean;
  role: string;
  createdAt: string;
}

interface Profile {
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

interface Project {
  _id: string;
  userId: string;
  title: string;
  description: string;
  keyFeatures: string[];
  technologies: string[];
  startDate: string;
  status: string;
  images: { url: string; _id: string }[];
  createdAt: string;
  updatedAt: string;
  liveUrl: string;
  repositoryUrl: string;
}

interface Experience {
  _id: string;
  userId: string;
  title: string;
  employmentType: string;
  company: string;
  location: string;
  locationType: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  skills: string[];
  media: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Education {
  _id: string;
  userId: string;
  school: string;
  logo: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  currentlyStudying: boolean;
  description: string;
  grade: string;
  activities: string;
  honors: string;
  educationType: string;
  location: string;
  website: string;
  media: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Certification {
  _id: string;
  userId: string;
  title: string;
  issuer: string;
  issuerLogo: string;
  issueDate: string;
  expirationDate: string | null;
  credentialID: string;
  credentialLink: string;
  description: string;
  skills: string[];
  doesNotExpire: boolean;
  media: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
  verification: {
    verified: boolean;
  };
}

interface Achievement {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  dateAchieved: string;
  issuer: string;
  issuerLogo: string;
  skillsGained: string[];
  evidence: string;
  visibility: string;
  tags: string[];
  impactDescription: string;
  createdAt: string;
  updatedAt: string;
  verification: {
    verified: boolean;
  };
}

interface Research {
  _id: string;
  userId: string;
  title: string;
  description: string;
  researchField: string;
  publicationDate: string;
  publisher: string;
  publicationType: string;
  doi: string;
  coAuthors: {
    name: string;
    institution: string;
  }[];
  institution: string;
  fundingAgency: string;
  grantNumber: string;
  keywords: string[];
  citations: number;
  isPublished: boolean;
  peerReviewed: boolean;
  impactStatement: string;
  createdAt: string;
  updatedAt: string;
  links: {
    pdf: string;
    projectPage: string;
    codeRepository: string;
  };
}

interface Skill {
  _id: string;
  userId: string;
  name: string;
  category: string;
  proficiency: number;
  learningResources: string[];
  priority: number;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioData {
  user: User;
  profile: Profile;
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  certifications: Certification[];
  achievements: Achievement[];
  researches: Research[];
  skills: Skill[];
}

// Scroll to top component
function ScrollTop(props: { children: React.ReactNode }) {
  const { children } = props;
  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Zoom in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 1000 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}

// Hide on scroll app bar
function HideOnScroll(props: { children: React.ReactElement }) {
  const { children } = props;
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}



function PortfolioPage() {
  const params = useParams();
  const id = params.id as string;
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `https://protfolio-hub.vercel.app/api/portfolio/email/${id}`
        );
        const result = await response.json();

        if (result.success) {
          setPortfolioData(result.data);
          // Track view after successfully loading portfolio data
          if (result.data?.user?.id) {
            trackView(result.data.user.id);
          }
        } else {
          setError("Failed to fetch portfolio data");
        }
      } catch (err) {
        setError("Error fetching portfolio data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPortfolioData();
    }
  }, [id]);

  // Scroll spy effect
  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "home",
        "about",
        "projects",
        "experience",
        "education",
        "certifications",
        "achievements",
        "research",
      ];
      const appBarHeight = 64;
      const scrollPosition = window.scrollY + appBarHeight + 50; // Account for app bar height

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;

          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const appBarHeight = 64; // Height of the app bar
      const elementPosition = element.offsetTop - appBarHeight - 20; // Extra 20px for spacing
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
    }
    setMobileMenuOpen(false);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !portfolioData) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "grey.50",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: "center", py: 8 }}>
            {/* Error Icon */}
            <Box
              sx={{
                width: 120,
                height: 120,
                mx: "auto",
                mb: 4,
                background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 32px rgba(255, 107, 107, 0.3)",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -10,
                  left: -10,
                  right: -10,
                  bottom: -10,
                  background:
                    "radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%)",
                  borderRadius: "50%",
                  zIndex: -1,
                },
              }}
            >
              <Person sx={{ fontSize: 60, color: "white" }} />
            </Box>

            {/* Error Title */}
            <Typography
              variant="h3"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 2,
                letterSpacing: "-0.02em",
              }}
            >
              User Not Found
            </Typography>

            {/* Error Message */}
            <Typography
              variant="h6"
              sx={{
                color: "text.secondary",
                mb: 4,
                maxWidth: 500,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              {error ||
                "The portfolio you're looking for doesn't exist or may have been removed."}
            </Typography>

            {/* Additional Info */}
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                mb: 6,
                opacity: 0.8,
              }}
            >
              Email: {id}
            </Typography>

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => window.history.back()}
                sx={{
                  background: "linear-gradient(135deg, #2E7D32, #4CAF50)",
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1B5E20, #2E7D32)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(46, 125, 50, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Go Back
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="/"
                sx={{
                  borderColor: "primary.main",
                  color: "primary.main",
                  px: 4,
                  py: 1.5,
                  borderRadius: 3,
                  textTransform: "none",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "primary.dark",
                    backgroundColor: "rgba(46, 125, 50, 0.08)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Go Home
              </Button>
            </Box>

            {/* Decorative Elements */}
            <Box
              sx={{
                mt: 8,
                display: "flex",
                justifyContent: "center",
                gap: 2,
                opacity: 0.3,
              }}
            >
              {[1, 2, 3].map((i) => (
                <Box
                  key={i}
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #2E7D32, #4CAF50)",
                    animation: `pulse 2s ease-in-out infinite ${i * 0.3}s`,
                    "@keyframes pulse": {
                      "0%, 100%": {
                        transform: "scale(1)",
                        opacity: 0.3,
                      },
                      "50%": {
                        transform: "scale(1.2)",
                        opacity: 0.8,
                      },
                    },
                  }}
                />
              ))}
            </Box>

            {/* Help Text */}
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                mt: 4,
                opacity: 0.6,
                maxWidth: 400,
                mx: "auto",
              }}
            >
              If you believe this is an error, please check the email address or
              contact support.
            </Typography>
          </Box>
        </Container>
      </Box>
    );
  }

  const {
    user,
    profile,
    projects,
    experiences,
    educations,
    certifications,
    achievements,
    researches,
    skills,
  } = portfolioData;

  const skillCategories = [...new Set(skills.map((skill) => skill.category))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const navigationItems = [
    { id: "home", label: "Home", icon: <Home /> },
    { id: "about", label: "About", icon: <Person /> },
    {
      id: "projects",
      label: "Projects",
      icon: <Code />,
      count: projects.length,
    },
    {
      id: "experience",
      label: "Experience",
      icon: <WorkOutline />,
      count: experiences.length,
    },
    {
      id: "education",
      label: "Education",
      icon: <SchoolOutlined />,
      count: educations.length,
    },
    {
      id: "certifications",
      label: "Certifications",
      icon: <StarOutline />,
      count: certifications.length,
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: <EmojiEventsOutlined />,
      count: achievements.length,
    },
    {
      id: "research",
      label: "Research",
      icon: <ScienceOutlined />,
      count: researches.length,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
        position: "relative",
        margin: 0,
        padding: 0,
        background: "rgba(255, 255, 255, 0.95)",
      }}
    >
      {/* App Bar */}
      {/* <HideOnScroll> */}
      <AppBar
        position="sticky"
        sx={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 0px 0px rgba(0,0,0,0.1)",
          zIndex: 1000,
          top: 0,
          left: 0,
          right: 0,
          borderRadius: "0px",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={profile.profileImage}
                sx={{
                  width: 40,
                  height: 40,
                  mr: 2,
                  border: 2,
                  borderColor: "primary.main",
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  color: "primary.main",
                  fontWeight: 600,
                  display: { xs: "block", sm: "block" },
                }}
              >
                {user.name}
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {navigationItems.map(
                (item) =>
                  (item.id === "home" || item.id === "about" || (item.count && item.count > 0)) && (
                    <Button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      sx={{
                        color:
                          activeSection === item.id
                            ? "primary.main"
                            : "text.secondary",
                        fontWeight: activeSection === item.id ? 600 : 400,
                        position: "relative",
                        "&:hover": {
                          backgroundColor: "rgba(46, 125, 50, 0.08)",
                        },
                      }}
                    >
                      {item.icon}
                      <Typography
                        sx={{ ml: 0.5, display: { xs: "none", lg: "block" } }}
                      >
                        {item.label}
                      </Typography>
                      {item.count && item.count > 0 && (
                        <Chip
                          label={item.count}
                          size="small"
                          sx={{
                            ml: 0.5,
                            height: 18,
                            fontSize: "0.7rem",
                            backgroundColor:
                              activeSection === item.id
                                ? "primary.main"
                                : "grey.300",
                            color:
                              activeSection === item.id
                                ? "white"
                                : "text.secondary",
                          }}
                        />
                      )}
                    </Button>
                  )
              )}
            </Box>

            {/* Mobile Menu Button */}
            <IconButton
              sx={{ display: { xs: "flex", md: "none" } }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <Close /> : <Menu />}
            </IconButton>
          </Toolbar>
        </Container>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              zIndex: 1200,
            }}
          >
            <Box sx={{ py: 2 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    px: 3,
                    py: 1.5,
                    color:
                      activeSection === item.id
                        ? "primary.main"
                        : "text.secondary",
                    fontWeight: activeSection === item.id ? 600 : 400,
                    "&:hover": {
                      backgroundColor: "rgba(46, 125, 50, 0.08)",
                    },
                  }}
                >
                  {item.icon}
                  <Typography sx={{ ml: 2 }}>{item.label}</Typography>
                  {item.count && item.count > 0 && (
                    <Chip
                      label={item.count}
                      size="small"
                      sx={{
                        ml: "auto",
                        height: 18,
                        fontSize: "0.7rem",
                        backgroundColor:
                          activeSection === item.id
                            ? "primary.main"
                            : "grey.300",
                        color:
                          activeSection === item.id
                            ? "white"
                            : "text.secondary",
                      }}
                    />
                  )}
                </Button>
              ))}
            </Box>
          </Box>
        )}
      </AppBar>
      {/* </HideOnScroll> */}

      {/* Hero Section */}
      <Box
        id="home"
        sx={{
          background:
            "linear-gradient(135deg, #1B5E20 0%, #2E7D32 25%, #4CAF50 50%, #66BB6A 75%, #81C784 100%)",
          color: "white",
          pt: 20,
          pb: 12,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url("data:image/svg+xml,%3Csvg width="80" height="80" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.08"%3E%3Ccircle cx="40" cy="40" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.4,
          },
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-50%",
            right: "-20%",
            width: "60%",
            height: "200%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
            transform: "rotate(15deg)",
          },
        }}
      >
        <Container maxWidth="lg">
          <Fade in timeout={1000}>
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 4,
                position: "relative",
                zIndex: 1,
              }}
            >
              <Box sx={{ flex: "1 1 300px", textAlign: "center", minWidth: 0 }}>
                <Grow in timeout={1500}>
                  <Box
                    sx={{
                      position: "relative",
                      borderRadius: "50%",
                      width: "220px",
                      height: "220px",
                      mx: "auto",
                      mb: 3,
                    }}
                  >
                    <Avatar
                      src={profile.profileImage}
                      sx={{
                        width: "100%",
                        height: "100%",
                        mx: "auto",
                        mb: 3,
                        border: 6,
                        borderColor: "rgba(255,255,255,0.3)",
                        boxShadow:
                          "0 10px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.2)",
                        position: "relative",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: -10,
                          left: -10,
                          right: -10,
                          bottom: -10,
                          background:
                            "linear-gradient(45deg, rgba(255,255,255,0.1), transparent)",
                          borderRadius: "50%",
                          zIndex: -1,
                        },
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: 60,
                        height: 60,
                        background: "linear-gradient(45deg, #4CAF50, #66BB6A)",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                        border: "3px solid white",
                      }}
                    >
                      <Work sx={{ color: "white", fontSize: 28 }} />
                    </Box>
                  </Box>
                </Grow>
              </Box>
              <Box sx={{ flex: "2 1 400px", minWidth: 0 }}>
                <Grow in timeout={2000}>
                  <Typography
                    variant="h2"
                    component="h1"
                    gutterBottom
                    sx={{
                      fontWeight: 800,
                      textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {user.name}
                  </Typography>
                </Grow>
                <Grow in timeout={2500}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h4"
                      component="h2"
                      gutterBottom
                      sx={{
                        opacity: 0.95,
                        fontWeight: 600,
                        textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                      }}
                    >
                      {profile.headline}
                    </Typography>
                    <Box
                      sx={{
                        width: 60,
                        height: 4,
                        background:
                          "linear-gradient(90deg, rgba(255,255,255,0.8), transparent)",
                        borderRadius: 2,
                        mb: 2,
                      }}
                    />
                  </Box>
                </Grow>
                <Grow in timeout={3000}>
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 4,
                      opacity: 0.9,
                      lineHeight: 1.8,
                      fontSize: "1.1rem",
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {profile.bio}
                  </Typography>
                </Grow>
                <Grow in timeout={3500}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        opacity: 0.8,
                        mb: 2,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontWeight: 500,
                      }}
                    >
                      Connect with me
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      {profile.linkedin && (
                        <IconButton
                          href={profile.linkedin}
                          target="_blank"
                          sx={{
                            color: "white",
                            backgroundColor: "rgba(255,255,255,0.15)",
                            width: 56,
                            height: 56,
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.25)",
                              transform: "translateY(-3px) scale(1.05)",
                              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <LinkedIn sx={{ fontSize: 28 }} />
                        </IconButton>
                      )}
                      {profile.github && (
                        <IconButton
                          href={profile.github}
                          target="_blank"
                          sx={{
                            color: "white",
                            backgroundColor: "rgba(255,255,255,0.15)",
                            width: 56,
                            height: 56,
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.25)",
                              transform: "translateY(-3px) scale(1.05)",
                              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <GitHub sx={{ fontSize: 28 }} />
                        </IconButton>
                      )}
                      {profile.facebook && (
                        <IconButton
                          href={profile.facebook}
                          target="_blank"
                          sx={{
                            color: "white",
                            backgroundColor: "rgba(255,255,255,0.15)",
                            width: 56,
                            height: 56,
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.25)",
                              transform: "translateY(-3px) scale(1.05)",
                              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <Facebook sx={{ fontSize: 28 }} />
                        </IconButton>
                      )}
                      {profile.website && (
                        <IconButton
                          href={profile.website}
                          target="_blank"
                          sx={{
                            color: "white",
                            backgroundColor: "rgba(255,255,255,0.15)",
                            width: 56,
                            height: 56,
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.25)",
                              transform: "translateY(-3px) scale(1.05)",
                              boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
                            },
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        >
                          <Public sx={{ fontSize: 28 }} />
                        </IconButton>
                      )}
                    </Stack>
                  </Box>
                </Grow>
              </Box>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {/* Contact Information */}
          <Box sx={{ flex: "1 1 320px", minWidth: 0 }}>
            <Box id="about" sx={{ scrollMarginTop: "80px" }}>
              <Card
                sx={{
                  mb: 4,
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  "&:hover": {
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box
                      sx={{
                        width: 4,
                        height: 24,
                        background: "linear-gradient(180deg, #2E7D32, #4CAF50)",
                        borderRadius: 2,
                        mr: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "primary.main",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Contact Information
                    </Typography>
                  </Box>
                  <List>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Email color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={user.email}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      />
                    </ListItem>
                    {profile.phone && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Phone color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={profile.phone} />
                      </ListItem>
                    )}
                    {profile.location && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <LocationOn color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={profile.location} />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Box>

            {/* Skills */}
            {skills.length > 0 && (
              <Card
                sx={{
                  borderRadius: 4,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  overflow: "hidden",
                  "&:hover": {
                    boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                    <Box
                      sx={{
                        width: 4,
                        height: 24,
                        background: "linear-gradient(180deg, #2E7D32, #4CAF50)",
                        borderRadius: 2,
                        mr: 2,
                      }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "primary.main",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Skills
                    </Typography>
                  </Box>
                  {skillCategories.map((category) => (
                    <Box key={category} sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle2"
                        color="primary"
                        gutterBottom
                        sx={{ fontWeight: 600 }}
                      >
                        {category}
                      </Typography>
                      {skills
                        .filter((skill) => skill.category === category)
                        .map((skill) => (
                          <Box key={skill._id} sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: 500 }}
                              >
                                {skill.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {skill.proficiency}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={skill.proficiency}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: "grey.200",
                                "& .MuiLinearProgress-bar": {
                                  borderRadius: 4,
                                  background:
                                    "linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%)",
                                },
                              }}
                            />
                          </Box>
                        ))}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Main Content */}
          <Box sx={{ flex: "2 1 600px", minWidth: 0 }}>
            {/* Projects */}
            {projects.length > 0 && (
              <Box id="projects" sx={{ scrollMarginTop: "80px" }}>
                <Card
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      Projects
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 3, flexDirection: "column" }}
                    >
                      {projects.map((project, index) => (
                        <Grow in timeout={500 + index * 100} key={project._id}>
                          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                height: "100%",
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "grey.200",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  transform: "translateY(-4px)",
                                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                                  borderColor: "primary.main",
                                },
                              }}
                            >
                              {project.images && project.images.length > 0 && (
                                <Box
                                  component="img"
                                  src={project.images[0].url}
                                  alt={project.title}
                                  sx={{
                                    width: "100%",
                                    height: 180,
                                    objectFit: "cover",
                                    borderRadius: 2,
                                    mb: 2,
                                  }}
                                />
                              )}
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                              >
                                {project.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2, whiteSpace: "pre-line" }}
                              >
                                {project.description}
                              </Typography>

                              <Box color="text.primary" sx={{ mb: 2 }}>
                                <Typography
                                  variant="caption"
                                  color="text.primary"
                                  sx={{
                                    mb: 1,
                                    display: "block",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  Key Features:
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 0.5,
                                  }}
                                >
                                  {project.keyFeatures
                                    .slice(0, 3)
                                    .map((tech, index) => (
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                          display: "block",
                                          fontSize: "0.7rem",
                                        }}
                                        key={index}
                                      >
                                        {tech}
                                      </Typography>
                                    ))}
                                  {project.keyFeatures.length > 3 && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{
                                        display: "block",
                                        fontSize: "0.7rem",
                                      }}
                                    >
                                      {`+${project.keyFeatures.length - 3}`}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              <Box sx={{ mb: 2 }}>
                                <Typography
                                  variant="caption"
                                  color="text.primary"
                                  sx={{
                                    mb: 1,
                                    display: "block",
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  Technologies:
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                  }}
                                >
                                  {project.technologies
                                    .slice(0, 3)
                                    .map((tech, index) => (
                                      <Chip
                                        key={index}
                                        label={tech}
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                        sx={{ fontSize: "0.7rem", borderRadius: 2 }}
                                      />
                                    ))}
                                  {project.technologies.length > 3 && (
                                    <Chip
                                      label={`+${project.technologies.length - 3}`}
                                      size="small"
                                      variant="outlined"
                                      color="secondary"
                                      sx={{ fontSize: "0.7rem", borderRadius: 2 }}
                                    />
                                  )}
                                </Box>
                              </Box>
                              <Stack direction="row" spacing={1}>
                                {project.repositoryUrl && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    href={project.repositoryUrl}
                                    target="_blank"
                                    startIcon={<GitHub />}
                                    sx={{ borderRadius: 2 }}
                                  >
                                    Code
                                  </Button>
                                )}
                                {project.liveUrl && (
                                  <Button
                                    size="small"
                                    variant="contained"
                                    href={project.liveUrl}
                                    target="_blank"
                                    startIcon={<Language />}
                                    sx={{ borderRadius: 2 }}
                                  >
                                    Live Demo
                                  </Button>
                                )}
                              </Stack>
                            </Paper>
                          </Box>
                        </Grow>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Experience */}
            {experiences.length > 0 && (
              <Box id="experience" sx={{ scrollMarginTop: "80px" }}>
                <Card
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      Experience
                    </Typography>
                    {experiences.map((exp, index) => (
                      <Grow in timeout={500 + index * 100} key={exp._id}>
                        <Box sx={{ mb: 3 }}>
                          <Paper
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              border: "1px solid",
                              borderColor: "grey.200",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                borderColor: "primary.main",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Work color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {exp.title}
                              </Typography>
                            </Box>
                            <Typography
                              variant="subtitle1"
                              color="primary"
                              gutterBottom
                              sx={{ fontWeight: 500 }}
                            >
                              {exp.company}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                                flexWrap: "wrap",
                              }}
                            >
                              <LocationOn
                                fontSize="small"
                                sx={{ mr: 0.5, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ mr: 2, color: "text.secondary" }}
                              >
                                {exp.location}
                              </Typography>
                              <CalendarToday
                                fontSize="small"
                                sx={{ mr: 0.5, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary" }}
                              >
                                {formatDate(exp.startDate)} -{" "}
                                {exp.currentlyWorking
                                  ? "Present"
                                  : formatDate(exp.endDate)}
                              </Typography>
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ whiteSpace: "pre-line" }}
                            >
                              {exp.description}
                            </Typography>
                            {exp.skills && exp.skills.length > 0 && (
                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{ mt: 2 }}
                                flexWrap="wrap"
                              >
                                {exp.skills.map((skill) => (
                                  <Chip
                                    key={skill}
                                    label={skill}
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                    sx={{ borderRadius: 2, fontSize: "0.7rem"  }}
                                  />
                                ))}
                              </Stack>
                            )}
                            {exp._id !==
                              experiences[experiences.length - 1]._id && (
                              <Divider sx={{ mt: 2 }} />
                            )}
                          </Paper>
                        </Box>
                      </Grow>
                    ))}
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <Box id="education" sx={{ scrollMarginTop: "80px" }}>
                <Card
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      Education
                    </Typography>
                    {educations.map((edu, index) => (
                      <Grow in timeout={500 + index * 100} key={edu._id}>
                        <Box sx={{ mb: 3 }}>
                          <Paper
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              border: "1px solid",
                              borderColor: "grey.200",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                borderColor: "primary.main",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <School color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {edu.degree} in {edu.fieldOfStudy}
                              </Typography>
                            </Box>
                            <Typography
                              variant="subtitle1"
                              color="primary"
                              gutterBottom
                              sx={{ fontWeight: 500 }}
                            >
                              {edu.school}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <CalendarToday
                                fontSize="small"
                                sx={{ mr: 0.5, color: "text.secondary" }}
                              />
                              <Typography
                                variant="body2"
                                sx={{ color: "text.secondary" }}
                              >
                                {formatDate(edu.startDate)} -{" "}
                                {edu.currentlyStudying
                                  ? "Present"
                                  : formatDate(edu.endDate || "")}
                              </Typography>
                            </Box>
                            {edu.grade && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                <strong>Grade:</strong> {edu.grade}
                              </Typography>
                            )}
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ whiteSpace: "pre-line" }}
                            >
                              {edu.description}
                            </Typography>
                            {edu._id !==
                              educations[educations.length - 1]._id && (
                              <Divider sx={{ mt: 2 }} />
                            )}
                          </Paper>
                        </Box>
                      </Grow>
                    ))}
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <Box id="certifications" sx={{ scrollMarginTop: "80px" }}>
                <Card
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      Certifications
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {certifications.map((cert, index) => (
                        <Grow in timeout={500 + index * 100} key={cert._id}>
                          <Box sx={{ flex: "1 1 250px", minWidth: 0 }}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "grey.200",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                  borderColor: "primary.main",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 1,
                                }}
                              >
                                <Star color="primary" sx={{ mr: 1 }} />
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {cert.title}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                color="primary"
                                sx={{ fontWeight: 500 }}
                              >
                                {cert.issuer}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {formatDate(cert.issueDate)}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ whiteSpace: "pre-line" }}
                              >
                                {cert.description}
                              </Typography>
                              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 , mt: 2}}>
                                {cert.skills.map((skill) => (
                                  <Chip
                                    key={skill}
                                    label={skill}
                                    size="small"
                                    variant="outlined"
                                    color="secondary"
                                    sx={{ borderRadius: 2, fontSize: "0.7rem"  }}
                                  />
                                ))}
                              </Box>
                              {cert.credentialLink && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  href={cert.credentialLink}
                                  target="_blank"
                                  sx={{ mt: 1, borderRadius: 2 }}
                                >
                                  View Credential
                                </Button>
                              )}
                            </Paper>
                          </Box>
                        </Grow>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Achievements */}
            {achievements.length > 0 && (
              <Box id="achievements" sx={{ scrollMarginTop: "80px" }}>
                <Card
                  sx={{
                    mb: 4,
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      Achievements
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {achievements.map((achievement, index) => (
                        <Grow
                          in
                          timeout={500 + index * 100}
                          key={achievement._id}
                        >
                          <Box sx={{ flex: "1 1 250px", minWidth: 0 }}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "grey.200",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                  borderColor: "primary.main",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 1,
                                }}
                              >
                                <EmojiEvents color="primary" sx={{ mr: 1 }} />
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {achievement.title}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                color="primary"
                                sx={{ fontWeight: 500 }}
                              >
                                {achievement.issuer}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {formatDate(achievement.dateAchieved)}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ whiteSpace: "pre-line" }}
                              >
                                {achievement.description}
                              </Typography>
                            </Paper>
                          </Box>
                        </Grow>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* Research */}
            {researches.length > 0 && (
              <Box id="research" sx={{ scrollMarginTop: "80px" }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h5"
                      gutterBottom
                      sx={{ fontWeight: 600, color: "primary.main" }}
                    >
                      Research Publications
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                      {researches.map((research, index) => (
                        <Grow in timeout={500 + index * 100} key={research._id}>
                          <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "grey.200",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                                  borderColor: "primary.main",
                                },
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 1,
                                }}
                              >
                                <Science color="primary" sx={{ mr: 1 }} />
                                <Typography
                                  variant="subtitle1"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {research.title}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                color="primary"
                                sx={{ fontWeight: 500 }}
                              >
                                {research.publisher} •{" "}
                                {research.publicationType}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1 }}
                              >
                                {formatDate(research.publicationDate)}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2, whiteSpace: "pre-line" }}
                              >
                                {research.description}
                              </Typography>


                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 2, whiteSpace: "pre-line", fontSize: "0.7rem" }}
                              >
                                <span style={{ fontWeight: "bold" }}>Impact Statement:</span> {research.impactStatement}
                              </Typography>

                              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, my: 2}}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ whiteSpace: "pre-line", fontSize: "0.7rem" }}
                                >
                                  <span style={{ fontWeight: "bold" }}>Co-Authors:</span>
                                </Typography>
                                {research.coAuthors.map((coAuthor, index) => (
                                  <Typography
                                    key={index}
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ whiteSpace: "pre-line", fontSize: "0.7rem" }}
                                >
                                  {coAuthor.name} - {coAuthor.institution}
                                </Typography>
                                ))}
                              </Box>


                              {research.links.pdf && (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  href={research.links.pdf}
                                  target="_blank"
                                  sx={{ borderRadius: 2 }}
                                >
                                  View Paper
                                </Button>
                              )}
                            </Paper>
                          </Box>
                        </Grow>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      {/* Scroll to Top Button */}
      <ScrollTop>
        <Fab
          color="primary"
          size="small"
          aria-label="scroll back to top"
          sx={{
            backgroundColor: "primary.main",
            "&:hover": {
              backgroundColor: "primary.dark",
              transform: "scale(1.1)",
            },
            transition: "all 0.3s ease",
          }}
        >
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </Box>
  );
}

export default PortfolioPage;

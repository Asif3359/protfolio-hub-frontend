"use client";

import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Work,
  TrendingUp,
  Security,
  Speed,
  CheckCircle,
  Star,
  People,
  Analytics,
  Code,
  Palette,
  Business,
  Launch,
} from "@mui/icons-material";
import NavBarComponent from "@/components/NavBarComponent";

function HomePage() {
  return (
    <>
      <NavBarComponent />
      <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
        {/* Hero Section */}
        <Box
          sx={{
            // background:
            //   "linear-gradient(90deg, rgba(46, 125, 50, 0.9) 0%, rgba(76, 175, 80, 0.9) 100%)",
            background: "white",
            color: "black",
            borderBottom: "1px solid #e0e0e0",
            py: 8,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 4,
              }}
            >
              <Box sx={{ flex: "1 1 500px" }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{ fontWeight: 700, mb: 2 }}
                >
                  Showcase Your Talent
                </Typography>
                <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                  Create stunning portfolios, connect with opportunities, and
                  grow your professional network
                </Typography>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: "black",
                      color: "black",
                      "&:hover": {
                        borderColor: "black",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: "black",
                      color: "black",
                      "&:hover": {
                        borderColor: "black",
                        bgcolor: "rgba(255,255,255,0.1)",
                      },
                    }}
                  >
                    View Examples
                  </Button>
                </Box>
              </Box>
              <Box sx={{ flex: "1 1 400px", textAlign: "center" }}>
                <Box
                  sx={{
                    width: { xs: 200, sm: 300, md: 400, lg: 400 },
                    height: { xs: 200, sm: 300, md: 400, lg: 400 },
                    bgcolor: "rgba(0, 0, 0, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                  }}
                >
                  <Work sx={{ fontSize: 120, opacity: 0.8 }} />
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Why Choose Portfolio Hub?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: "auto" }}
            >
              Professional tools designed to help you showcase your work and
              connect with opportunities
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Code sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                  Easy Portfolio Creation
                </Typography>
                <Typography color="text.secondary">
                  Drag-and-drop interface to create stunning portfolios in
                  minutes. No coding required.
                </Typography>
              </Card>
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "secondary.main",
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <Analytics sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                  Analytics & Insights
                </Typography>
                <Typography color="text.secondary">
                  Track your portfolio performance and understand what resonates
                  with your audience.
                </Typography>
              </Card>
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
              <Card sx={{ height: "100%", textAlign: "center", p: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "success.main",
                    width: 80,
                    height: 80,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  <People sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h5" component="h3" sx={{ mb: 2 }}>
                  Network & Connect
                </Typography>
                <Typography color="text.secondary">
                  Connect with other professionals and discover new
                  opportunities in your field.
                </Typography>
              </Card>
            </Box>
          </Box>
        </Container>

        {/* Stats Section */}
        <Box sx={{ bgcolor: "grey.100", py: 8 }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                textAlign: "center",
              }}
            >
              <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "primary.main", mb: 1 }}
                >
                  10K+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Active Portfolios
                </Typography>
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "secondary.main", mb: 1 }}
                >
                  50K+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Users Worldwide
                </Typography>
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "success.main", mb: 1 }}
                >
                  95%
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Success Rate
                </Typography>
              </Box>
              <Box sx={{ flex: "1 1 200px", minWidth: 0 }}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 700, color: "warning.main", mb: 1 }}
                >
                  24/7
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Support
                </Typography>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Testimonials Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              component="h2"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              What Our Users Say
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
              <Card sx={{ p: 3, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main" }} />
                </Box>
                <Typography sx={{ mb: 2, fontStyle: "italic" }}>
                  &ldquo;Portfolio Hub helped me land my dream job. The
                  analytics showed me exactly what employers were looking
                  for.&rdquo;
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ mr: 2 }}>S</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Sarah Johnson
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Frontend Developer
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
              <Card sx={{ p: 3, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main" }} />
                </Box>
                <Typography sx={{ mb: 2, fontStyle: "italic" }}>
                  &ldquo;The networking features are incredible. I&apos;ve
                  connected with so many amazing professionals in my
                  field.&rdquo;
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ mr: 2 }}>M</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Mike Chen
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      UX Designer
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>

            <Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
              <Card sx={{ p: 3, height: "100%" }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main", mr: 1 }} />
                  <Star sx={{ color: "warning.main" }} />
                </Box>
                <Typography sx={{ mb: 2, fontStyle: "italic" }}>
                  &ldquo;Easy to use and professional looking. My portfolio
                  stands out from the competition.&rdquo;
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar sx={{ mr: 2 }}>E</Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Emily Rodriguez
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Full Stack Developer
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>
        </Container>

        {/* CTA Section */}
        <Box
          sx={{
            background: "black",
            color: "white",
            py: 8
          }}
        >
          <Container maxWidth="md">
            <Box sx={{ textAlign: "center" }}>
              <Typography
                variant="h3"
                component="h2"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Ready to Showcase Your Work?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Join thousands of professionals who trust Portfolio Hub to
                showcase their talent
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{
                  bgcolor: "white",
                  color: "primary.main",
                  px: 4,
                  py: 1.5,
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                Start Building Your Portfolio
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default HomePage;

"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Language as LanguageIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Facebook as FacebookIcon,
  Link as LinkIcon,
} from "@mui/icons-material";

interface User {
  _id: string;
  name: string;
  email: string;
  verified: boolean;
  role: string;
  createdAt: string;
  followersCount?: number;
  followingCount?: number;
}

interface Profile {
  _id: string;
  userId: string;
  bio?: string;
  location?: string;
  website?: string;
  profileImage?: string;
  headline?: string;
  phone?: string;
  facebook?: string;
  github?: string;
  linkedin?: string;
  portfolioLink?: string;
  views?: number;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
}

interface UserData {
  user: User;
  profile: Profile | null;
}

function FeedPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/all/users`
      );
      const result = await response.json();

      if (result.success) {
        console.log(result.data);
        setUsers(result.data);
      } else {
        setError("Failed to load users");
      }
    } catch (err) {
      setError("Error connecting to server");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((userData) => {
      const { user, profile } = userData;
      const searchLower = searchTerm.toLowerCase();

      return (
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower) ||
        (profile?.bio && profile.bio.toLowerCase().includes(searchLower)) ||
        (profile?.location &&
          profile.location.toLowerCase().includes(searchLower)) ||
        (profile?.skills &&
          profile.skills.some((skill) =>
            skill.toLowerCase().includes(searchLower)
          ))
      );
    });

    setFilteredUsers(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 600 }}
        >
          Community Feed
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Discover and connect with {users.length} professionals in our
          community
        </Typography>

        {/* Search Bar */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, email, role, skills, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="primary" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "primary.main",
                },
              },
            }}
          />
        </Paper>

        {/* Results Count */}
        <Typography variant="body2" color="text.secondary">
          Showing {filteredUsers.length} of {users.length} users
        </Typography>
      </Box>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No users found matching your search criteria
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {filteredUsers.map((userData) => {
            const { user, profile } = userData;

            return (
              <Card
                key={user._id}
                elevation={2}
                sx={{
                  transition:
                    "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    p: { xs: 2, sm: 3 },
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "center", sm: "flex-start" },
                  }}
                >
                  {/* Left Section - Avatar and Basic Info */}
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      mr: { xs: 0, sm: 3 },
                      mb: { xs: 2, sm: 0 },
                      minWidth: { xs: "auto", sm: 120 },
                    }}
                  >
                    <Avatar
                      src={profile?.profileImage}
                      sx={{
                        width: { xs: 80, sm: 100 },
                        height: { xs: 80, sm: 100 },
                        mb: 2,
                        fontSize: { xs: "1.5rem", sm: "2rem" },
                        bgcolor: "primary.main",
                      }}
                    >
                      {getInitials(user.name)}
                    </Avatar>
                  </Box>

                  {/* Right Section - Detailed Information */}
                  <Box
                    sx={{
                      flexGrow: 1,
                      width: { xs: "100%", sm: "auto" },
                      textAlign: { xs: "center", sm: "left" },
                    }}
                  >
                    {/* Header */}
                    <Box sx={{ mb: 2 }}>
                      <Typography
                        variant="h5"
                        component="h3"
                        gutterBottom
                        sx={{
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexDirection: { xs: "column", sm: "row" },
                          justifyContent: { xs: "center", sm: "flex-start" },
                        }}
                      >
                        {user.name}
                        {user.role === "admin" && (
                          <Chip
                            label={user.role}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {user.verified && (
                          <Tooltip title="Verified User">
                            <VerifiedIcon color="primary" fontSize="small" />
                          </Tooltip>
                        )}
                      </Typography>
                      {profile?.headline && (
                        <Typography
                          variant="h6"
                          color="primary"
                          sx={{
                            mb: 1,
                            fontWeight: 500,
                            textAlign: { xs: "center", sm: "left" },
                          }}
                        >
                          {profile.headline}
                        </Typography>
                      )}
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{
                          mb: 1,
                          textAlign: { xs: "center", sm: "left" },
                        }}
                      >
                        {user.email}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: { xs: 1, sm: 2 },
                          flexWrap: "wrap",
                          justifyContent: { xs: "center", sm: "flex-start" },
                          flexDirection: { xs: "column", sm: "row" },
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CalendarIcon
                            fontSize="small"
                            color="action"
                            sx={{ mr: 0.5 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Joined {formatDate(user.createdAt)}
                          </Typography>
                        </Box>
                        {profile?.location && (
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <PersonIcon
                              fontSize="small"
                              color="action"
                              sx={{ mr: 0.5 }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {profile.location}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      {/* Followers Count */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mt: 1,
                          justifyContent: { xs: "center", sm: "flex-start" },
                        }}
                      >
                        <Chip
                          label={`${user.followersCount || 0} followers`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    {/* Bio */}
                    {profile?.bio && (
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.6,
                            textAlign: { xs: "justify", sm: "justify" },
                            fontSize: { xs: "0.9rem", sm: "1rem" },
                          }}
                        >
                          {profile.bio}
                        </Typography>
                      </Box>
                    )}

                    {/* Skills */}
                    {profile?.skills && profile.skills.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontWeight: 600,
                            textAlign: { xs: "center", sm: "left" },
                          }}
                        >
                          Skills
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            justifyContent: { xs: "center", sm: "flex-start" },
                          }}
                        >
                          {profile.skills.map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="medium"
                              variant="outlined"
                              sx={{ fontSize: "0.8rem" }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}

                    {/* Experience and Education Row */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: { xs: 2, sm: 4 },
                        flexWrap: "wrap",
                        flexDirection: { xs: "column", sm: "row" },
                      }}
                    >
                      {/* Experience */}
                      {profile?.experience && profile.experience.length > 0 && (
                        <Box
                          sx={{
                            flex: 1,
                            minWidth: { xs: "auto", sm: 250 },
                            width: { xs: "100%", sm: "auto" },
                          }}
                        >
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: {
                                xs: "center",
                                sm: "flex-start",
                              },
                            }}
                          >
                            <WorkIcon sx={{ mr: 1 }} />
                            Experience
                          </Typography>
                          {profile.experience.slice(0, 2).map((exp, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                sx={{ textAlign: { xs: "center", sm: "left" } }}
                              >
                                {exp.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textAlign: { xs: "center", sm: "left" } }}
                              >
                                {exp.company} • {exp.duration}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}

                      {/* Education */}
                      {profile?.education && profile.education.length > 0 && (
                        <Box
                          sx={{
                            flex: 1,
                            minWidth: { xs: "auto", sm: 250 },
                            width: { xs: "100%", sm: "auto" },
                          }}
                        >
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              fontWeight: 600,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: {
                                xs: "center",
                                sm: "flex-start",
                              },
                            }}
                          >
                            <SchoolIcon sx={{ mr: 1 }} />
                            Education
                          </Typography>
                          {profile.education.slice(0, 2).map((edu, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                              <Typography
                                variant="body1"
                                fontWeight={600}
                                sx={{ textAlign: { xs: "center", sm: "left" } }}
                              >
                                {edu.degree}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ textAlign: { xs: "center", sm: "left" } }}
                              >
                                {edu.institution} • {edu.year}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>

                    {/* Contact & Social Links */}
                    {(profile?.phone ||
                      profile?.website ||
                      profile?.github ||
                      profile?.linkedin ||
                      profile?.facebook) && (
                      <Box
                        sx={{
                          mt: 3,
                          pt: 2,
                          borderTop: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            fontWeight: 600,
                            textAlign: { xs: "center", sm: "left" },
                          }}
                        >
                          Contact & Links
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: { xs: 1, sm: 2 },
                            justifyContent: { xs: "center", sm: "flex-start" },
                          }}
                        >
                          {profile?.phone && (
                            <Chip
                              icon={<PhoneIcon />}
                              label={profile.phone}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.8rem" }}
                            />
                          )}
                          {profile?.website && (
                            <Chip
                              icon={<LanguageIcon />}
                              label="Website"
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.8rem" }}
                              component="a"
                              href={profile.website}
                              target="_blank"
                              clickable
                            />
                          )}
                          {profile?.github && (
                            <Chip
                              icon={<GitHubIcon />}
                              label="GitHub"
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.8rem" }}
                              component="a"
                              href={profile.github}
                              target="_blank"
                              clickable
                            />
                          )}
                          {profile?.linkedin && (
                            <Chip
                              icon={<LinkedInIcon />}
                              label="LinkedIn"
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.8rem" }}
                              component="a"
                              href={profile.linkedin}
                              target="_blank"
                              clickable
                            />
                          )}
                          {profile?.facebook && (
                            <Chip
                              icon={<FacebookIcon />}
                              label="Facebook"
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.8rem" }}
                              component="a"
                              href={profile.facebook}
                              target="_blank"
                              clickable
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Card>
            );
          })}
        </Box>
      )}
    </Container>
  );
}

export default FeedPage;

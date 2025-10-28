"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, Card, CardContent, Avatar, TextField, Chip, IconButton, Alert, CircularProgress, Stack } from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Facebook as FacebookIcon,
  Language as LanguageIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  PhotoCamera as PhotoCameraIcon,
  Link as LinkIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

interface ProfileData {
  _id?: string;
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

interface ProfileFormData {
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
}

const initialFormData: ProfileFormData = {
  headline: "",
  bio: "",
  location: "",
  phone: "",
  website: "",
  linkedin: "",
  facebook: "",
  github: "",
  portfolioLink: "",
  profileImage: "",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub-backend.onrender.com/api';

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          headline: data.headline || "",
          bio: data.bio || "",
          location: data.location || "",
          phone: data.phone || "",
          website: data.website || "",
          linkedin: data.linkedin || "",
          facebook: data.facebook || "",
          github: data.github || "",
          portfolioLink: data.portfolioLink || "",
          profileImage: data.profileImage || "",
        });
      } else if (response.status === 404) {
        // Profile doesn't exist yet, that's okay
        setProfile(null);
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setFormErrors({});
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        headline: profile.headline || "",
        bio: profile.bio || "",
        location: profile.location || "",
        phone: profile.phone || "",
        website: profile.website || "",
        linkedin: profile.linkedin || "",
        facebook: profile.facebook || "",
        github: profile.github || "",
        portfolioLink: profile.portfolioLink || "",
        profileImage: profile.profileImage || "",
      });
    }
    setFormErrors({});
    // reset selected file preview on cancel
    if (selectedFilePreviewUrl) {
      URL.revokeObjectURL(selectedFilePreviewUrl);
    }
    setSelectedFile(null);
    setSelectedFilePreviewUrl(null);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.headline.trim()) {
      errors.headline = "Headline is required";
    }

    if (formData.bio.length > 1000) {
      errors.bio = "Bio must be less than 1000 characters";
    }

    // URL validations
    const urlFields = [
      "website",
      "linkedin",
      "facebook",
      "github",
      "portfolioLink",
    ];
    urlFields.forEach((field) => {
      const value = formData[field as keyof ProfileFormData] as string;
      if (value && !isValidUrl(value)) {
        errors[field] = "Please enter a valid URL";
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const body = new FormData();
      body.append("headline", formData.headline);
      body.append("bio", formData.bio);
      body.append("location", formData.location);
      body.append("phone", formData.phone);
      body.append("website", formData.website);
      body.append("linkedin", formData.linkedin);
      body.append("facebook", formData.facebook);
      body.append("github", formData.github);
      body.append("portfolioLink", formData.portfolioLink);

      if (selectedFile) {
        body.append("profileImage", selectedFile);
      } else if (formData.profileImage) {
        // Fallback: backend accepts direct URL if provided
        body.append("profileImage", formData.profileImage);
      }

      const response = await fetch(`${API_URL}/profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        } as HeadersInit,
        body,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.msg || "Failed to save profile");
      }

      const savedProfile = await response.json();
      setProfile(savedProfile);
      setIsEditing(false);
      setSelectedFile(null);
      setSelectedFilePreviewUrl(null);
      setSuccess("Profile updated successfully!");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // basic client-side validation for image and size <= 5MB
    if (!file.type.startsWith("image/")) {
      setError("Only image uploads are allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be 5MB or less");
      return;
    }
    if (selectedFilePreviewUrl) {
      URL.revokeObjectURL(selectedFilePreviewUrl);
    }
    setSelectedFile(file);
    setSelectedFilePreviewUrl(URL.createObjectURL(file));
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your profile? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/profile`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete profile");
      }

      setProfile(null);
      setFormData(initialFormData);
      setSuccess("Profile deleted successfully!");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Profile
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your professional profile and personal information
          </Typography>
        </Box>
        {!isEditing && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ borderRadius: 2 }}
          >
            Edit Profile
          </Button>
        )}
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

      {/* Profile Content */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
          gap: 4,
        }}
      >
        {/* Left Column - Profile Image and Basic Info */}
        <Card sx={{ height: "fit-content" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={selectedFilePreviewUrl || formData.profileImage || profile?.profileImage}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: "3rem",
                    border: "4px solid",
                    borderColor: "primary.main",
                  }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Avatar>
                {isEditing && (
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      backgroundColor: "primary.main",
                      color: "white",
                      "&:hover": {
                        backgroundColor: "primary.dark",
                      },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                )}
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                {user?.name || "User Name"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || "user@example.com"}
              </Typography>
            </Box>

            {/* Basic Information */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <PersonIcon />
                Basic Information
              </Typography>

              <TextField
                fullWidth
                label="Professional Headline"
                value={formData.headline}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, headline: e.target.value }))
                }
                error={!!formErrors.headline}
                helperText={formErrors.headline}
                disabled={!isEditing}
                sx={{ mb: 2 }}
                placeholder="e.g., Full Stack Developer, UI/UX Designer"
              />

              <TextField
                fullWidth
                label="Bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                error={!!formErrors.bio}
                helperText={`${formData.bio.length}/1000 ${formErrors.bio || ""}`}
                multiline
                rows={4}
                disabled={!isEditing}
                sx={{ mb: 2 }}
                placeholder="Tell us about yourself, your skills, and experience..."
              />

              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                disabled={!isEditing}
                sx={{ mb: 2 }}
                placeholder="e.g., New York, NY"
                InputProps={{
                  startAdornment: (
                    <LocationIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                disabled={!isEditing}
                sx={{ mb: 2 }}
                placeholder="+1 (555) 123-4567"
                InputProps={{
                  startAdornment: (
                    <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </Box>

            {/* Profile Image URL - optional fallback when not uploading */}
            {isEditing && !selectedFile && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PhotoCameraIcon />
                  Profile Image (URL fallback)
                </Typography>
                <TextField
                  fullWidth
                  label="Profile Image URL"
                  value={formData.profileImage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      profileImage: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/profile-image.jpg"
                  helperText="You can paste a direct image URL or click the camera icon to upload a file"
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Social Links and Actions */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Social Media Links */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <LinkIcon />
                Social Media & Links
              </Typography>

              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, website: e.target.value }))
                }
                error={!!formErrors.website}
                helperText={formErrors.website}
                disabled={!isEditing}
                sx={{ mb: 2 }}
                placeholder="https://your-website.com"
                InputProps={{
                  startAdornment: (
                    <LanguageIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />

              <TextField
                fullWidth
                label="LinkedIn"
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, linkedin: e.target.value }))
                }
                error={!!formErrors.linkedin}
                helperText={formErrors.linkedin}
                disabled={!isEditing}
                sx={{ mb: 2 }}
                placeholder="https://linkedin.com/in/your-profile"
                InputProps={{
                  startAdornment: (
                    <LinkedInIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />

              <TextField
                fullWidth
                label="GitHub"
                value={formData.github}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, github: e.target.value }))
                }
                error={!!formErrors.github}
                helperText={formErrors.github}
                disabled={!isEditing}
                sx={{ mb: 2 }}
                placeholder="https://github.com/your-username"
                InputProps={{
                  startAdornment: (
                    <GitHubIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Facebook"
                value={formData.facebook}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, facebook: e.target.value }))
                }
                error={!!formErrors.facebook}
                helperText={formErrors.facebook}
                disabled={!isEditing}
                sx={{ mb: 2 }}
                placeholder="https://facebook.com/your-profile"
                InputProps={{
                  startAdornment: (
                    <FacebookIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />

              <TextField
                fullWidth
                label="Portfolio Link"
                value={formData.portfolioLink}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    portfolioLink: e.target.value,
                  }))
                }
                error={!!formErrors.portfolioLink}
                helperText={formErrors.portfolioLink}
                disabled={!isEditing}
                placeholder="https://your-portfolio.com"
                InputProps={{
                  startAdornment: (
                    <WorkIcon sx={{ mr: 1, color: "text.secondary" }} />
                  ),
                }}
              />
            </CardContent>
          </Card>

          {/* Quick Links Preview */}
          {!isEditing && profile && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Links
                </Typography>
                <Stack spacing={1}>
                  {profile.website && (
                    <Button
                      variant="outlined"
                      startIcon={<LanguageIcon />}
                      onClick={() => window.open(profile.website, "_blank")}
                      fullWidth
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Website
                    </Button>
                  )}
                  {profile.linkedin && (
                    <Button
                      variant="outlined"
                      startIcon={<LinkedInIcon />}
                      onClick={() => window.open(profile.linkedin, "_blank")}
                      fullWidth
                      sx={{ justifyContent: "flex-start" }}
                    >
                      LinkedIn
                    </Button>
                  )}
                  {profile.github && (
                    <Button
                      variant="outlined"
                      startIcon={<GitHubIcon />}
                      onClick={() => window.open(profile.github, "_blank")}
                      fullWidth
                      sx={{ justifyContent: "flex-start" }}
                    >
                      GitHub
                    </Button>
                  )}
                  {profile.portfolioLink && (
                    <Button
                      variant="outlined"
                      startIcon={<WorkIcon />}
                      onClick={() =>
                        window.open(profile.portfolioLink, "_blank")
                      }
                      fullWidth
                      sx={{ justifyContent: "flex-start" }}
                    >
                      Portfolio
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSubmit}
                    disabled={saving}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    {saving ? <CircularProgress size={20} /> : "Save Profile"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    disabled={saving}
                    fullWidth
                    sx={{ borderRadius: 2 }}
                  >
                    Cancel
                  </Button>
                  {profile && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDelete}
                      disabled={saving}
                      fullWidth
                      sx={{ borderRadius: 2 }}
                    >
                      Delete Profile
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      {/* Profile Preview */}
      {!isEditing && profile && (
        <Card sx={{ mt: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Preview
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 3,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Headline
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {profile.headline || "No headline set"}
                </Typography>

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Bio
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {profile.bio || "No bio provided"}
                </Typography>

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Location
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {profile.location || "No location set"}
                </Typography>

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Phone
                </Typography>
                <Typography variant="body2">
                  {profile.phone || "No phone number provided"}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                >
                  Social Links
                </Typography>
                <Stack spacing={1}>
                  {profile.website && (
                    <Chip
                      icon={<LanguageIcon />}
                      label="Website"
                      variant="outlined"
                      onClick={() => window.open(profile.website, "_blank")}
                      clickable
                    />
                  )}
                  {profile.linkedin && (
                    <Chip
                      icon={<LinkedInIcon />}
                      label="LinkedIn"
                      variant="outlined"
                      onClick={() => window.open(profile.linkedin, "_blank")}
                      clickable
                    />
                  )}
                  {profile.github && (
                    <Chip
                      icon={<GitHubIcon />}
                      label="GitHub"
                      variant="outlined"
                      onClick={() => window.open(profile.github, "_blank")}
                      clickable
                    />
                  )}
                  {profile.facebook && (
                    <Chip
                      icon={<FacebookIcon />}
                      label="Facebook"
                      variant="outlined"
                      onClick={() => window.open(profile.facebook, "_blank")}
                      clickable
                    />
                  )}
                  {profile.portfolioLink && (
                    <Chip
                      icon={<WorkIcon />}
                      label="Portfolio"
                      variant="outlined"
                      onClick={() =>
                        window.open(profile.portfolioLink, "_blank")
                      }
                      clickable
                    />
                  )}
                </Stack>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default Profile;

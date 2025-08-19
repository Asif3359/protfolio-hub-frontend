"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Stack,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  EmojiEvents as TrophyIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Verified as VerifiedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Link as LinkIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  School as SchoolIcon,
  SportsEsports as SportsIcon,
  Palette as ArtsIcon,
  VolunteerActivism as CommunityIcon,
  Leaderboard as LeadershipIcon,
  Science as ResearchIcon,
  MoreHoriz as OtherIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

interface Achievement {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  dateAchieved: string;
  issuer?: string;
  issuerLogo?: string;
  skillsGained: string[];
  evidence?: string;
  verification: {
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
  };
  visibility: string;
  tags: string[];
  impactDescription?: string;
  createdAt: string;
  updatedAt: string;
}

interface AchievementFormData {
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
}

const initialFormData: AchievementFormData = {
  title: "",
  description: "",
  category: "",
  dateAchieved: "",
  issuer: "",
  issuerLogo: "",
  skillsGained: [],
  evidence: "",
  visibility: "Public",
  tags: [],
  impactDescription: "",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub-backend.onrender.com/api';

const categoryIcons: Record<string, React.ReactElement> = {
  Academic: <SchoolIcon />,
  Professional: <WorkIcon />,
  Sports: <SportsIcon />,
  Arts: <ArtsIcon />,
  "Community Service": <CommunityIcon />,
  Leadership: <LeadershipIcon />,
  Research: <ResearchIcon />,
  Other: <OtherIcon />,
};

function AchievementPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] =
    useState<Achievement | null>(null);
  const [formData, setFormData] =
    useState<AchievementFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newSkill, setNewSkill] = useState("");
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/achievement/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch achievements");
      }

      const data = await response.json();
      setAchievements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (achievementItem?: Achievement) => {
    if (achievementItem) {
      setEditingAchievement(achievementItem);
      setFormData({
        title: achievementItem.title,
        description: achievementItem.description,
        category: achievementItem.category,
        dateAchieved: achievementItem.dateAchieved.split("T")[0],
        issuer: achievementItem.issuer || "",
        issuerLogo: achievementItem.issuerLogo || "",
        skillsGained: achievementItem.skillsGained || [],
        evidence: achievementItem.evidence || "",
        visibility: achievementItem.visibility,
        tags: achievementItem.tags || [],
        impactDescription: achievementItem.impactDescription || "",
      });
    } else {
      setEditingAchievement(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAchievement(null);
    setFormData(initialFormData);
    setFormErrors({});
    setNewSkill("");
    setNewTag("");
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Achievement title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (!formData.dateAchieved) {
      errors.dateAchieved = "Date achieved is required";
    }

    if (formData.description.length > 500) {
      errors.description = "Description cannot exceed 500 characters";
    }

    if (formData.impactDescription && formData.impactDescription.length > 300) {
      errors.impactDescription =
        "Impact description cannot exceed 300 characters";
    }

    if (formData.evidence && !isValidUrl(formData.evidence)) {
      errors.evidence = "Please enter a valid URL";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const url = editingAchievement
        ? `${API_URL}/achievement/${editingAchievement._id}`
        : `${API_URL}/achievement`;

      const method = editingAchievement ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to save achievement");
      }

      await fetchAchievements();
      handleCloseDialog();
      setSuccess(
        editingAchievement
          ? "Achievement updated successfully!"
          : "Achievement added successfully!"
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (achievementId: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/achievement/${achievementId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete achievement");
      }

      await fetchAchievements();
      setSuccess("Achievement deleted successfully!");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skillsGained.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skillsGained: [...prev.skillsGained, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      skillsGained: prev.skillsGained.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
            Achievements
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Showcase your accomplishments and milestones
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Achievement
        </Button>
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

      {/* Achievement Cards */}
      {achievements.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <TrophyIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No achievements yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Start building your portfolio by adding your achievements and
            accomplishments
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Achievement
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {achievements.map((achievement) => (
            <Card
              key={achievement._id}
              sx={{
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
                position: "relative",
              }}
            >
              {/* Verification Badge */}
              {achievement.verification.verified && (
                <Box
                  sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}
                >
                  <Tooltip title="Verified Achievement">
                    <VerifiedIcon
                      sx={{ color: "success.main", fontSize: 24 }}
                    />
                  </Tooltip>
                </Box>
              )}

              <CardContent sx={{ pt: 4 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  {/* Category Icon */}
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      flexShrink: 0,
                      bgcolor: "primary.main",
                      color: "white",
                    }}
                  >
                    {categoryIcons[achievement.category] || <TrophyIcon />}
                  </Avatar>

                  {/* Content */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h6"
                          component="h3"
                          sx={{ fontWeight: 600 }}
                        >
                          {achievement.title}
                        </Typography>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Chip
                            label={achievement.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {achievement.issuer && (
                            <Typography variant="body2" color="text.secondary">
                              • {achievement.issuer}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                          position: "absolute",
                          top: 16,
                          right: 16,
                          zIndex: 1,
                        }}
                      >
                        {/* Visibility Badge */}

                        <Tooltip
                          title={`Visible to ${achievement.visibility.toLowerCase()}`}
                        >
                          <VisibilityIcon
                            sx={{
                              color:
                                achievement.visibility === "Public"
                                  ? "primary.main"
                                  : "text.disabled",
                              fontSize: 20,
                            }}
                          />
                        </Tooltip>

                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(achievement)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(achievement._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Date */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 2,
                      }}
                    >
                      <CalendarIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Achieved: {formatDate(achievement.dateAchieved)}
                      </Typography>
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {achievement.description}
                    </Typography>

                    {/* Impact Description */}
                    {achievement.impactDescription && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, fontStyle: "italic" }}
                      >
                        Impact: {achievement.impactDescription}
                      </Typography>
                    )}

                    {/* Skills */}
                    {achievement.skillsGained.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 1 }}
                        >
                          Skills Gained:
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {achievement.skillsGained
                            .slice(0, 5)
                            .map((skill, index) => (
                              <Chip
                                key={index}
                                label={skill}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            ))}
                          {achievement.skillsGained.length > 5 && (
                            <Chip
                              label={`+${achievement.skillsGained.length - 5}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Tags */}
                    {achievement.tags.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {achievement.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              sx={{ fontSize: "0.6rem" }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Evidence Link */}
                    {achievement.evidence && (
                      <Button
                        size="small"
                        startIcon={<LinkIcon />}
                        href={achievement.evidence}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ textTransform: "none" }}
                      >
                        View Evidence
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ backgroundColor: "primary.main", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {editingAchievement ? <EditIcon /> : <AddIcon />}
            {editingAchievement ? "Edit Achievement" : "Add New Achievement"}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Title */}
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label="Achievement Title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              error={!!formErrors.title}
              helperText={formErrors.title}
              required
            />

            {/* Category */}
            <FormControl fullWidth required error={!!formErrors.category}>
              <InputLabel>Achievement Category</InputLabel>
              <Select
                value={formData.category}
                label="Achievement Category"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <MenuItem value="Academic">Academic</MenuItem>
                <MenuItem value="Professional">Professional</MenuItem>
                <MenuItem value="Sports">Sports</MenuItem>
                <MenuItem value="Arts">Arts</MenuItem>
                <MenuItem value="Community Service">Community Service</MenuItem>
                <MenuItem value="Leadership">Leadership</MenuItem>
                <MenuItem value="Research">Research</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {formErrors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.category}
                </Typography>
              )}
            </FormControl>

            {/* Date Achieved */}
            <TextField
              fullWidth
              label="Date Achieved"
              type="date"
              value={formData.dateAchieved}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  dateAchieved: e.target.value,
                }))
              }
              error={!!formErrors.dateAchieved}
              helperText={formErrors.dateAchieved}
              required
              InputLabelProps={{ shrink: true }}
            />

            {/* Issuer */}
            <TextField
              fullWidth
              label="Issuer/Organization"
              value={formData.issuer}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, issuer: e.target.value }))
              }
              placeholder="e.g., University, Company, Organization"
            />

            {/* Issuer Logo */}
            <TextField
              fullWidth
              label="Issuer Logo URL"
              value={formData.issuerLogo}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, issuerLogo: e.target.value }))
              }
              placeholder="https://example.com/logo.png"
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              error={!!formErrors.description}
              helperText={
                formErrors.description ||
                `${formData.description.length}/500 characters`
              }
              multiline
              rows={3}
              inputProps={{ maxLength: 500 }}
              required
            />

            {/* Impact Description */}
            <TextField
              fullWidth
              label="Impact Description (Optional)"
              value={formData.impactDescription}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  impactDescription: e.target.value,
                }))
              }
              error={!!formErrors.impactDescription}
              helperText={
                formErrors.impactDescription ||
                `${formData.impactDescription.length}/300 characters`
              }
              multiline
              rows={2}
              inputProps={{ maxLength: 300 }}
              placeholder="Describe the impact or significance of this achievement"
            />

            {/* Skills Gained */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Skills Gained
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="Add skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddSkill}
                  disabled={!newSkill.trim()}
                >
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formData.skillsGained.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    size="small"
                  />
                ))}
              </Stack>
            </Box>

            {/* Tags */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="Add tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formData.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    color="secondary"
                  />
                ))}
              </Stack>
            </Box>

            {/* Evidence */}
            <TextField
              fullWidth
              label="Evidence URL (Optional)"
              value={formData.evidence}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, evidence: e.target.value }))
              }
              error={!!formErrors.evidence}
              helperText={
                formErrors.evidence || "Link to certificate, photo, or document"
              }
              placeholder="https://example.com/certificate.pdf"
            />

            {/* Visibility */}
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                value={formData.visibility}
                label="Visibility"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    visibility: e.target.value,
                  }))
                }
              >
                <MenuItem value="Public">Public</MenuItem>
                <MenuItem value="Private">Private</MenuItem>
                <MenuItem value="Connections">Connections Only</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving}
            startIcon={editingAchievement ? <EditIcon /> : <AddIcon />}
          >
            {saving ? "Saving..." : editingAchievement ? "Update" : "Add"}{" "}
            Achievement
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AchievementPage;

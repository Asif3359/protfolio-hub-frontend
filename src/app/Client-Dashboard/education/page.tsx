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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Grade as GradeIcon,
  EmojiEvents as EmojiEventsIcon,
  Groups as GroupsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LocationOn as LocationIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

interface Education {
  _id: string;
  userId: string;
  school: string;
  logo: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate?: string;
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

interface EducationFormData {
  school: string;
  logo: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
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
}

const initialFormData: EducationFormData = {
  school: "",
  logo: "",
  degree: "Bachelor",
  fieldOfStudy: "",
  startDate: "",
  endDate: "",
  currentlyStudying: false,
  description: "",
  grade: "",
  activities: "",
  honors: "",
  educationType: "Full-time",
  location: "",
  website: "",
  media: "",
  visible: true,
};

const degreeTypes = [
  "High School",
  "Associate",
  "Bachelor",
  "Master",
  "Doctorate",
  "Professional",
  "Certificate",
  "Diploma",
  "Other",
];

const educationTypes = [
  "Full-time",
  "Part-time",
  "Online",
  "Distance Learning",
  "Executive",
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub-backend.onrender.com/api';

function EducationPage() {
  const { user } = useAuth();
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState<EducationFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/education/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch education");
      }

      const data = await response.json();
      setEducation(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (educationItem?: Education) => {
    if (educationItem) {
      setEditingEducation(educationItem);
      setFormData({
        school: educationItem.school,
        logo: educationItem.logo,
        degree: educationItem.degree,
        fieldOfStudy: educationItem.fieldOfStudy,
        startDate: educationItem.startDate.split("T")[0],
        endDate: educationItem.endDate ? educationItem.endDate.split("T")[0] : "",
        currentlyStudying: educationItem.currentlyStudying,
        description: educationItem.description,
        grade: educationItem.grade,
        activities: educationItem.activities,
        honors: educationItem.honors,
        educationType: educationItem.educationType,
        location: educationItem.location,
        website: educationItem.website,
        media: educationItem.media,
        visible: educationItem.visible,
      });
    } else {
      setEditingEducation(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEducation(null);
    setFormData(initialFormData);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.school.trim()) {
      errors.school = "School name is required";
    }

    if (!formData.fieldOfStudy.trim()) {
      errors.fieldOfStudy = "Field of study is required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!formData.currentlyStudying && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errors.endDate = "End date must be after start date";
      }
    }

    if (formData.description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
    }

    if (formData.activities.length > 500) {
      errors.activities = "Activities description cannot exceed 500 characters";
    }

    if (formData.honors.length > 500) {
      errors.honors = "Honors description cannot exceed 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const url = editingEducation
        ? `${API_URL}/education/${editingEducation._id}`
        : `${API_URL}/education`;

      const method = editingEducation ? "PUT" : "POST";

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
        throw new Error(errorData.msg || "Failed to save education");
      }

      await fetchEducation();
      handleCloseDialog();
      setSuccess(
        editingEducation
          ? "Education updated successfully!"
          : "Education added successfully!"
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (educationId: string) => {
    if (!confirm("Are you sure you want to delete this education record?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/education/${educationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete education");
      }

      await fetchEducation();
      setSuccess("Education deleted successfully!");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
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
            Education
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your educational background and academic achievements
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Education
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Education Cards */}
      {education.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <SchoolIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No education records yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Start building your academic profile by adding your education history
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Education
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {education.map((educationItem) => (
            <Card
              key={educationItem._id}
              sx={{
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  backgroundColor: educationItem.visible ? "primary.main" : "grey.400",
                  borderRadius: "2px 0 0 2px",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                  <Box sx={{ display: "flex", gap: 2, flex: 1 }}>
                    <Avatar
                      src={educationItem.logo}
                      sx={{ 
                        width: 60, 
                        height: 60,
                        backgroundColor: "primary.main",
                      }}
                    >
                      <SchoolIcon />
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                        {educationItem.school}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                        {educationItem.degree} in {educationItem.fieldOfStudy}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <CalendarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(educationItem.startDate)} - {educationItem.currentlyStudying ? "Present" : educationItem.endDate ? formatDate(educationItem.endDate) : "Present"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title={educationItem.visible ? "Visible" : "Hidden"}>
                      <IconButton size="small" disabled>
                        {educationItem.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(educationItem)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(educationItem._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <Chip
                    label={educationItem.degree}
                    size="small"
                    variant="outlined"
                    icon={<SchoolIcon />}
                  />
                  <Chip
                    label={educationItem.educationType}
                    size="small"
                    variant="outlined"
                  />
                  {educationItem.location && (
                    <Chip
                      label={educationItem.location}
                      size="small"
                      variant="outlined"
                      icon={<LocationIcon />}
                    />
                  )}
                </Box>

                {educationItem.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                    {educationItem.description}
                  </Typography>
                )}

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                  {educationItem.grade && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <GradeIcon fontSize="small" />
                        Grade/GPA:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {educationItem.grade}
                      </Typography>
                    </Box>
                  )}

                  {educationItem.activities && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <GroupsIcon fontSize="small" />
                        Activities & Societies:
                      </Typography>
                      <Typography variant="body2">
                        {educationItem.activities}
                      </Typography>
                    </Box>
                  )}

                  {educationItem.honors && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <EmojiEventsIcon fontSize="small" />
                        Honors & Awards:
                      </Typography>
                      <Typography variant="body2">
                        {educationItem.honors}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Education Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: "primary.main", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {editingEducation ? <EditIcon /> : <AddIcon />}
            {editingEducation ? "Edit Education" : "Add New Education"}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
            {/* Basic Information */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                fullWidth
                label="School Name *"
                value={formData.school}
                onChange={(e) => setFormData((prev) => ({ ...prev, school: e.target.value }))}
                error={!!formErrors.school}
                helperText={formErrors.school}
                required
              />

              <TextField
                fullWidth
                label="School Logo URL"
                value={formData.logo}
                onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
                error={!!formErrors.logo}
                helperText={formErrors.logo || "Optional: URL to school logo"}
                placeholder="https://example.com/logo.png"
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Degree Type *</InputLabel>
                <Select
                  value={formData.degree}
                  onChange={(e) => setFormData((prev) => ({ ...prev, degree: e.target.value }))}
                  label="Degree Type *"
                  required
                >
                  {degreeTypes.map((degree) => (
                    <MenuItem key={degree} value={degree}>
                      {degree}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Field of Study *"
                value={formData.fieldOfStudy}
                onChange={(e) => setFormData((prev) => ({ ...prev, fieldOfStudy: e.target.value }))}
                error={!!formErrors.fieldOfStudy}
                helperText={formErrors.fieldOfStudy}
                required
                placeholder="e.g., Computer Science, Business Administration"
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Education Type</InputLabel>
                <Select
                  value={formData.educationType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, educationType: e.target.value }))}
                  label="Education Type"
                >
                  {educationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., New York, NY"
              />
            </Box>

            {/* Dates */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                fullWidth
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                error={!!formErrors.startDate}
                helperText={formErrors.startDate}
                InputLabelProps={{ shrink: true }}
                required
              />

              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                error={!!formErrors.endDate}
                helperText={formErrors.endDate}
                InputLabelProps={{ shrink: true }}
                disabled={formData.currentlyStudying}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.currentlyStudying}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentlyStudying: e.target.checked }))}
                />
              }
              label="I am currently studying here"
            />

            {/* Academic Details */}
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              error={!!formErrors.description}
              helperText={`${formData.description.length}/1000 ${formErrors.description || ""}`}
              multiline
              rows={3}
              placeholder="Describe your academic experience, achievements, or specializations..."
            />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                fullWidth
                label="Grade/GPA"
                value={formData.grade}
                onChange={(e) => setFormData((prev) => ({ ...prev, grade: e.target.value }))}
                placeholder="e.g., 3.8/4.0, A+, First Class"
              />

              <TextField
                fullWidth
                label="Activities & Societies"
                value={formData.activities}
                onChange={(e) => setFormData((prev) => ({ ...prev, activities: e.target.value }))}
                error={!!formErrors.activities}
                helperText={`${formData.activities.length}/500 ${formErrors.activities || ""}`}
                placeholder="e.g., Student Council, Debate Club, Sports Team"
              />
            </Box>

            <TextField
              fullWidth
              label="Honors & Awards"
              value={formData.honors}
              onChange={(e) => setFormData((prev) => ({ ...prev, honors: e.target.value }))}
              error={!!formErrors.honors}
              helperText={`${formData.honors.length}/500 ${formErrors.honors || ""}`}
              placeholder="e.g., Dean's List, Academic Excellence Award, Scholarships"
            />

            {/* Links */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                fullWidth
                label="School Website"
                value={formData.website}
                onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                error={!!formErrors.website}
                helperText={formErrors.website || "Optional: School website URL"}
                placeholder="https://school.edu"
              />

              <TextField
                fullWidth
                label="Media URL (Diploma/Certificate)"
                value={formData.media}
                onChange={(e) => setFormData((prev) => ({ ...prev, media: e.target.value }))}
                error={!!formErrors.media}
                helperText={formErrors.media || "Optional: Link to diploma, certificate, or transcript"}
                placeholder="https://example.com/diploma.pdf"
              />
            </Box>

            {/* Visibility */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.visible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, visible: e.target.checked }))}
                />
              }
              label="Make this education visible on my profile"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ borderRadius: 2 }}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : editingEducation ? "Update Education" : "Add Education"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EducationPage;
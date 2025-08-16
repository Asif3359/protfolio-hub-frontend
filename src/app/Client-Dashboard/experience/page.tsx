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
  Divider,
  Stack,
  Paper,
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
} from "@mui/material";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Code as CodeIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  School as SchoolIcon,
  Computer as ComputerIcon,
  Home as HomeIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

interface Experience {
  _id: string;
  userId: string;
  title: string;
  employmentType: string;
  company: string;
  location: string;
  locationType: string;
  startDate: string;
  endDate?: string;
  currentlyWorking: boolean;
  description: string;
  skills: string[];
  media: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ExperienceFormData {
  title: string;
  employmentType: string;
  company: string;
  location: string;
  locationType: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string;
  skills: string;
  media: string;
  visible: boolean;
}

const initialFormData: ExperienceFormData = {
  title: "",
  employmentType: "Full-time",
  company: "",
  location: "",
  locationType: "On-site",
  startDate: "",
  endDate: "",
  currentlyWorking: false,
  description: "",
  skills: "",
  media: "",
  visible: true,
};

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Self-employed",
  "Freelance",
  "Contract",
  "Internship",
  "Apprenticeship",
  "Seasonal",
];

const locationTypes = ["On-site", "Hybrid", "Remote"];

const employmentTypeIcons = {
  "Full-time": <WorkIcon />,
  "Part-time": <WorkIcon />,
  "Self-employed": <BusinessIcon />,
  "Freelance": <ComputerIcon />,
  "Contract": <WorkIcon />,
  "Internship": <SchoolIcon />,
  "Apprenticeship": <SchoolIcon />,
  "Seasonal": <WorkIcon />,
};

const locationTypeIcons = {
  "On-site": <LocationIcon />,
  "Hybrid": <PublicIcon />,
  "Remote": <HomeIcon />,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub.vercel.app/api';

function ExperiencePage() {
  const { user } = useAuth();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/experience/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch experiences");
      }

      const data = await response.json();
      setExperiences(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (experience?: Experience) => {
    if (experience) {
      setEditingExperience(experience);
      setFormData({
        title: experience.title,
        employmentType: experience.employmentType,
        company: experience.company,
        location: experience.location,
        locationType: experience.locationType,
        startDate: experience.startDate.split("T")[0],
        endDate: experience.endDate ? experience.endDate.split("T")[0] : "",
        currentlyWorking: experience.currentlyWorking,
        description: experience.description,
        skills: experience.skills.join(", "),
        media: experience.media,
        visible: experience.visible,
      });
    } else {
      setEditingExperience(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExperience(null);
    setFormData(initialFormData);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Job title is required";
    }

    if (!formData.company.trim()) {
      errors.company = "Company name is required";
    }

    if (!formData.startDate) {
      errors.startDate = "Start date is required";
    }

    if (!formData.currentlyWorking && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        errors.endDate = "End date must be after start date";
      }
    }

    if (formData.description.length > 2000) {
      errors.description = "Description cannot exceed 2000 characters";
    }

    if (formData.media && !isValidUrl(formData.media)) {
      errors.media = "Please enter a valid URL";
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
      const url = editingExperience
        ? `${API_URL}/experience/${editingExperience._id}`
        : `${API_URL}/experience`;

      const method = editingExperience ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter((skill) => skill.length > 0),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.msg || "Failed to save experience");
      }

      await fetchExperiences();
      handleCloseDialog();
      setSuccess(
        editingExperience
          ? "Experience updated successfully!"
          : "Experience added successfully!"
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (experienceId: string) => {
    if (!confirm("Are you sure you want to delete this experience?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/experience/${experienceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete experience");
      }

      await fetchExperiences();
      setSuccess("Experience deleted successfully!");
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

  const getDuration = (startDate: string, endDate?: string, currentlyWorking?: boolean): string => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : currentlyWorking ? new Date() : null;
    
    if (!end) return `${formatDate(startDate)} - Present`;
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    
    if (diffYears > 0 && diffMonths > 0) {
      return `${diffYears} yr ${diffMonths} mo`;
    } else if (diffYears > 0) {
      return `${diffYears} yr`;
    } else {
      return `${diffMonths} mo`;
    }
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
            Experience
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your work experience and professional history
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Experience
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

      {/* Experiences Timeline */}
      {experiences.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <WorkIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No experience yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Start building your professional profile by adding your work experience
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Experience
          </Button>
        </Box>
             ) : (
         <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
           {experiences.map((experience, index) => (
             <Card
               key={experience._id}
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
                   backgroundColor: experience.visible ? "primary.main" : "grey.400",
                   borderRadius: "2px 0 0 2px",
                 },
               }}
             >
               <CardContent sx={{ p: 3 }}>
                 <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                   <Box sx={{ flex: 1 }}>
                     <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                       {experience.title}
                     </Typography>
                     <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                       {experience.company}
                     </Typography>
                     <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                       <CalendarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                       <Typography variant="body2" color="text.secondary">
                         {formatDate(experience.startDate)} - {experience.currentlyWorking ? "Present" : experience.endDate ? formatDate(experience.endDate) : "Present"}
                         <span style={{ marginLeft: 8, fontWeight: 500 }}>
                           ({getDuration(experience.startDate, experience.endDate, experience.currentlyWorking)})
                         </span>
                       </Typography>
                     </Box>
                   </Box>
                   <Box sx={{ display: "flex", gap: 0.5 }}>
                     <Tooltip title={experience.visible ? "Visible" : "Hidden"}>
                       <IconButton size="small" disabled>
                         {experience.visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
                       </IconButton>
                     </Tooltip>
                     <Tooltip title="Edit">
                       <IconButton
                         size="small"
                         onClick={() => handleOpenDialog(experience)}
                       >
                         <EditIcon fontSize="small" />
                       </IconButton>
                     </Tooltip>
                     <Tooltip title="Delete">
                       <IconButton
                         size="small"
                         color="error"
                         onClick={() => handleDelete(experience._id)}
                       >
                         <DeleteIcon fontSize="small" />
                       </IconButton>
                     </Tooltip>
                   </Box>
                 </Box>

                 <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                   <Chip
                     label={experience.employmentType}
                     size="small"
                     variant="outlined"
                     icon={employmentTypeIcons[experience.employmentType as keyof typeof employmentTypeIcons]}
                   />
                   {experience.location && (
                     <Chip
                       label={experience.location}
                       size="small"
                       variant="outlined"
                       icon={locationTypeIcons[experience.locationType as keyof typeof locationTypeIcons]}
                     />
                   )}
                 </Box>

                 {experience.description && (
                   <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, whiteSpace: "pre-line" }}>
                     {experience.description}
                   </Typography>
                 )}

                 {experience.skills.length > 0 && (
                   <Box>
                     <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                       Skills & Technologies:
                     </Typography>
                     <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                       {experience.skills.map((skill, skillIndex) => (
                         <Chip
                           key={skillIndex}
                           label={skill}
                           size="small"
                           variant="outlined"
                           sx={{ fontSize: "0.8rem" }}
                         />
                       ))}
                     </Box>
                   </Box>
                 )}
               </CardContent>
             </Card>
           ))}
         </Box>
       )}

      {/* Experience Form Dialog */}
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
            {editingExperience ? <EditIcon /> : <AddIcon />}
            {editingExperience ? "Edit Experience" : "Add New Experience"}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkIcon />
                Job Information
              </Typography>
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <TextField
                fullWidth
                label="Job Title *"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />

              <TextField
                fullWidth
                label="Company *"
                value={formData.company}
                onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                error={!!formErrors.company}
                helperText={formErrors.company}
                required
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Employment Type</InputLabel>
                <Select
                  value={formData.employmentType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, employmentType: e.target.value }))}
                  label="Employment Type"
                >
                  {employmentTypes.map((type) => (
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

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Location Type</InputLabel>
                <Select
                  value={formData.locationType}
                  onChange={(e) => setFormData((prev) => ({ ...prev, locationType: e.target.value }))}
                  label="Location Type"
                >
                  {locationTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Dates */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarIcon />
                Duration
              </Typography>
            </Box>

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
                disabled={formData.currentlyWorking}
              />
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.currentlyWorking}
                  onChange={(e) => setFormData((prev) => ({ ...prev, currentlyWorking: e.target.checked }))}
                />
              }
              label="I currently work here"
            />

            {/* Description */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DescriptionIcon />
                Description
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Job Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              error={!!formErrors.description}
              helperText={`${formData.description.length}/2000 ${formErrors.description || ""}`}
              multiline
              rows={4}
              placeholder="Describe your role, responsibilities, and achievements..."
            />

            {/* Skills */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CodeIcon />
                Skills & Technologies
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Skills (comma-separated)"
              value={formData.skills}
              onChange={(e) => setFormData((prev) => ({ ...prev, skills: e.target.value }))}
              placeholder="e.g., JavaScript, React, Node.js, MongoDB"
              helperText="Enter skills separated by commas"
            />

            {/* Media */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Media
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Media URL (optional)"
              value={formData.media}
              onChange={(e) => setFormData((prev) => ({ ...prev, media: e.target.value }))}
              error={!!formErrors.media}
              helperText={formErrors.media || "Link to certificate, document, or image"}
              placeholder="https://example.com/certificate.pdf"
            />

            {/* Visibility */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.visible}
                  onChange={(e) => setFormData((prev) => ({ ...prev, visible: e.target.checked }))}
                />
              }
              label="Make this experience visible on my profile"
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
            {saving ? <CircularProgress size={20} /> : editingExperience ? "Update Experience" : "Add Experience"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ExperiencePage;
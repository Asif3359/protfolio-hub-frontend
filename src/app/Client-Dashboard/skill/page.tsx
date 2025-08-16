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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  LinearProgress,
  Stack,
  Slider,
  Rating,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Code as CodeIcon,
  Brush as DesignIcon,
  Business as BusinessIcon,
  Language as LanguageIcon,
  Psychology as PsychologyIcon,
  MoreHoriz as OtherIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  School as SchoolIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Computer as ComputerIcon,
  Brush as BrushIcon,
  Work as WorkIcon,
  Translate as TranslateIcon,
  Person as PersonIcon,
  Quiz as QuizIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

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

interface SkillFormData {
  name: string;
  category: string;
  proficiency: number;
  learningResources: string[];
  priority: number;
  visibility: string;
}

const initialFormData: SkillFormData = {
  name: "",
  category: "",
  proficiency: 0,
  learningResources: [],
  priority: 3,
  visibility: "Public",
};

const API_URL = "https://protfolio-hub.vercel.app/api";

const categoryIcons: Record<string, React.ReactElement> = {
  Technical: <ComputerIcon />,
  Programming: <CodeIcon />,
  Design: <DesignIcon />,
  Business: <BusinessIcon />,
  Language: <LanguageIcon />,
  "Soft Skills": <PsychologyIcon />,
  Other: <OtherIcon />,
};

const categoryColors: Record<string, string> = {
  Technical: "#1976d2",
  Programming: "#2e7d32",
  Design: "#ed6c02",
  Business: "#9c27b0",
  Language: "#d32f2f",
  "Soft Skills": "#7b1fa2",
  Other: "#757575",
};

function SkillsPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState<SkillFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newResource, setNewResource] = useState("");
  const router = useRouter();
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/skill/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch skills");
      }

      const data = await response.json();
      setSkills(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (skillItem?: Skill) => {
    if (skillItem) {
      setEditingSkill(skillItem);
      setFormData({
        name: skillItem.name,
        category: skillItem.category,
        proficiency: skillItem.proficiency,
        learningResources: skillItem.learningResources || [],
        priority: skillItem.priority,
        visibility: skillItem.visibility,
      });
    } else {
      setEditingSkill(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSkill(null);
    setFormData(initialFormData);
    setFormErrors({});
    setNewResource("");
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Skill name is required";
    }

    if (!formData.category) {
      errors.category = "Category is required";
    }

    if (formData.proficiency < 0 || formData.proficiency > 100) {
      errors.proficiency = "Proficiency must be between 0 and 100";
    }

    if (formData.priority < 1 || formData.priority > 5) {
      errors.priority = "Priority must be between 1 and 5";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const url = editingSkill ? `${API_URL}/skill/${editingSkill._id}`: `${API_URL}/skill`;

      const method = editingSkill ? "PUT" : "POST"; 

      console.log(url);
      console.log(formData);

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
        console.log(errorData);
        throw new Error(errorData.msg || "Failed to save skill");
      }

      await fetchSkills();
      handleCloseDialog();
      setSuccess(
        editingSkill
          ? "Skill updated successfully!"
          : "Skill added successfully!"
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/skill/${skillId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete skill");
      }

      await fetchSkills();
      setSuccess("Skill deleted successfully!");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    }
  };

  const handleAddResource = () => {
    if (
      newResource.trim() &&
      !formData.learningResources.includes(newResource.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        learningResources: [...prev.learningResources, newResource.trim()],
      }));
      setNewResource("");
    }
  };

  const handleRemoveResource = (resourceToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      learningResources: prev.learningResources.filter(
        (resource) => resource !== resourceToRemove
      ),
    }));
  };

  const handleTestSkill = (skill: Skill) => {
    router.push(`/Client-Dashboard/skill/test-skill/${skill._id}`);
  };

  const getProficiencyColor = (proficiency: number): string => {
    if (proficiency >= 80) return "#2e7d32"; // Green
    if (proficiency >= 60) return "#1976d2"; // Blue
    if (proficiency >= 40) return "#ed6c02"; // Orange
    return "#d32f2f"; // Red
  };

  const getProficiencyLabel = (proficiency: number): string => {
    if (proficiency >= 90) return "Expert";
    if (proficiency >= 80) return "Advanced";
    if (proficiency >= 60) return "Intermediate";
    if (proficiency >= 40) return "Beginner";
    return "Novice";
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
            Skills & Expertise
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your technical and professional skills
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Skill
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

      {/* Skills Grid */}
      {skills.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <CodeIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No skills yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Start building your skills profile by adding your technical and
            professional expertise
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Skill
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
              lg: "1fr 1fr 1fr",
            },
            gap: 3,
          }}
        >
          {skills.map((skill) => (
            <Card
              key={skill._id}
              sx={{
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
                position: "relative",
                borderLeft: `4px solid ${categoryColors[skill.category] || "#757575"}`,
              }}
            >
              {/* Visibility Badge */}
              {/* <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
                {skill.visibility === "Public" ? (
                  <Tooltip title="Visible to public">
                    <VisibilityIcon sx={{ color: "primary.main", fontSize: 20 }} />
                  </Tooltip>
                ) : (
                  <Tooltip title={`Visible to ${skill.visibility.toLowerCase()}`}>
                    <VisibilityOffIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                  </Tooltip>
                )}
              </Box> */}

              <CardContent sx={{ pt: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  {/* Category Icon */}
                  <Avatar
                    sx={{
                      width: 50,
                      height: 50,
                      flexShrink: 0,
                      bgcolor: categoryColors[skill.category] || "#757575",
                      color: "white",
                    }}
                  >
                    {categoryIcons[skill.category] || <OtherIcon />}
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
                          {skill.name}
                        </Typography>
                        <Chip
                          label={skill.category}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: "0.7rem",
                            borderColor:
                              categoryColors[skill.category] || "#757575",
                            color: categoryColors[skill.category] || "#757575",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                      >
                        {/* Visibility Badge */}
                        <Tooltip
                          title={`Visible to ${skill.visibility === "Public" ? "public" : "connections only"}`}
                        >
                          <VisibilityIcon
                            sx={{
                              color:
                                skill.visibility === "Public"
                                  ? "primary.main"
                                  : "text.disabled",
                              fontSize: 20,
                            }}
                          />
                        </Tooltip>

                        {/* Edit Button */}
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(skill)}
                        >
                          <EditIcon />
                        </IconButton>
                        {/* Delete Button */}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(skill._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Priority */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 2,
                      }}
                    >
                      <Rating
                        value={skill.priority}
                        max={5}
                        readOnly
                        size="small"
                        icon={<StarIcon />}
                        emptyIcon={<StarBorderIcon />}
                      />
                      <Typography variant="caption" color="text.secondary">
                        Priority {skill.priority}/5
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Proficiency */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Proficiency
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: getProficiencyColor(skill.proficiency),
                      }}
                    >
                      {skill.proficiency}% -{" "}
                      {getProficiencyLabel(skill.proficiency)}
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
                        backgroundColor: getProficiencyColor(skill.proficiency),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>

                {/* Learning Resources */}
                {skill.learningResources.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 1 }}
                    >
                      Learning Resources:
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {skill.learningResources
                        .slice(0, 3)
                        .map((resource, index) => (
                          <Chip
                            key={index}
                            label={resource}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: "0.6rem" }}
                          />
                        ))}
                      {skill.learningResources.length > 3 && (
                        <Chip
                          label={`+${skill.learningResources.length - 3}`}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: "0.6rem" }}
                        />
                      )}
                    </Stack>
                  </Box>
                )}

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleTestSkill(skill)}
                  >
                    Test Skill
                  </Button>
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
            {editingSkill ? <EditIcon /> : <AddIcon />}
            {editingSkill ? "Edit Skill" : "Add New Skill"}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Skill Name */}
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label="Skill Name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              error={!!formErrors.name}
              helperText={formErrors.name}
              required
            />

            {/* Category */}
            <FormControl fullWidth required error={!!formErrors.category}>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <MenuItem value="Technical">Technical</MenuItem>
                <MenuItem value="Programming">Programming</MenuItem>
                <MenuItem value="Design">Design</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
                <MenuItem value="Language">Language</MenuItem>
                <MenuItem value="Soft Skills">Soft Skills</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {formErrors.category && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.category}
                </Typography>
              )}
            </FormControl>

            {/* Proficiency Info */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Proficiency Level: 0% - Novice
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Proficiency will be determined through skill testing. Click the
                &quot;Test&quot; button on the skill card to take a proficiency
                test.
              </Typography>
            </Box>

            {/* Priority */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Priority Level
              </Typography>
              <Rating
                value={formData.priority}
                onChange={(_, value) =>
                  setFormData((prev) => ({ ...prev, priority: value || 3 }))
                }
                max={5}
                icon={<StarIcon />}
                emptyIcon={<StarBorderIcon />}
                sx={{ "& .MuiRating-iconFilled": { color: "primary.main" } }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ ml: 1 }}
              >
                {formData.priority}/5
              </Typography>
            </Box>

            {/* Learning Resources */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Learning Resources
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="Add resource"
                  value={newResource}
                  onChange={(e) => setNewResource(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddResource()}
                  sx={{ flex: 1 }}
                  placeholder="e.g., Udemy course, documentation, etc."
                />
                <Button
                  variant="outlined"
                  onClick={handleAddResource}
                  disabled={!newResource.trim()}
                >
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formData.learningResources.map((resource, index) => (
                  <Chip
                    key={index}
                    label={resource}
                    onDelete={() => handleRemoveResource(resource)}
                    size="small"
                    color="secondary"
                  />
                ))}
              </Stack>
            </Box>

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
            startIcon={editingSkill ? <EditIcon /> : <AddIcon />}
          >
            {saving ? "Saving..." : editingSkill ? "Update" : "Add"} Skill
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SkillsPage;

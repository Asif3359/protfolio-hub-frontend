'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Avatar,
  Tooltip,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  CalendarToday as CalendarIcon,
  Code as CodeIcon,
  Star as StarIcon,
  Archive as ArchiveIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

interface Project {
  _id: string;
  title: string;
  description: string;
  images: { url: string }[];
  keyFeatures: string[];
  technologies: string[];
  repositoryUrl?: string;
  liveUrl?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'archived' | 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  images: string[];
  keyFeatures: string[];
  technologies: string[];
  repositoryUrl: string;
  liveUrl: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'archived' | 'draft' | 'completed';
}

const initialFormData: ProjectFormData = {
  title: '',
  description: '',
  images: [''],
  keyFeatures: [''],
  technologies: [''],
  repositoryUrl: '',
  liveUrl: '',
  startDate: '',
  endDate: '',
  status: 'active',
};

const statusColors = {
  active: 'success',
  completed: 'primary',
  draft: 'warning',
  archived: 'default',
} as const;

const statusIcons = {
  active: <CheckCircleIcon />,
  completed: <StarIcon />,
  draft: <ScheduleIcon />,
  archived: <ArchiveIcon />,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub-backend.onrender.com/api';

function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        images: project.images.map(img => img.url),
        keyFeatures: project.keyFeatures,
        technologies: project.technologies,
        repositoryUrl: project.repositoryUrl || '',
        liveUrl: project.liveUrl || '',
        startDate: project.startDate.split('T')[0],
        endDate: project.endDate ? project.endDate.split('T')[0] : '',
        status: project.status,
      });
    } else {
      setEditingProject(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setFormData(initialFormData);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    
    if (formData.images.length === 0 || !formData.images[0].trim()) {
      errors.images = 'At least one image URL is required';
    }
    
    if (formData.keyFeatures.length === 0 || !formData.keyFeatures[0].trim()) {
      errors.keyFeatures = 'At least one key feature is required';
    }
    
    if (formData.technologies.length === 0 || !formData.technologies[0].trim()) {
      errors.technologies = 'At least one technology is required';
    }

    if (formData.repositoryUrl && !formData.repositoryUrl.match(/^(https?:\/\/)?(www\.)?github\.com\/.+/i)) {
      errors.repositoryUrl = 'Please enter a valid GitHub URL';
    }

    if (formData.liveUrl && !formData.liveUrl.match(/^(https?:\/\/)/i)) {
      errors.liveUrl = 'Please enter a valid URL with http:// or https://';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('handleSubmit');
    if (!validateForm()) return;

    try {
      const token = localStorage.getItem('token');
      const url = editingProject 
        ? `${API_URL}/projects/${editingProject._id}`
        : `${API_URL}/projects`;
      
      const method = editingProject ? 'PUT' : 'POST';
      console.log(url, method);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          images: formData.images.filter(url => url.trim()).map(url => ({ url: url.trim() })),
          keyFeatures: formData.keyFeatures.filter(feature => feature.trim()),
          technologies: formData.technologies.filter(tech => tech.trim()),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save project');
      }

      await fetchProjects();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      await fetchProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const addArrayField = (field: keyof ProjectFormData) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ''],
    }));
  };

  const removeArrayField = (field: keyof ProjectFormData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const updateArrayField = (field: keyof ProjectFormData, index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) => i === index ? value : item),
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 0 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            My Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and showcase your portfolio projects
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Project
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <CodeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No projects yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Start building your portfolio by adding your first project
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Your First Project
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {projects.map((project) => (
            <Card 
              key={project._id}
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              {/* Project Image */}
              {project.images.length > 0 && (
                <Box
                  sx={{
                    height: 200,
                    backgroundImage: `url(${project.images[0].url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                  }}
                />
              )}

              <CardContent sx={{ flexGrow: 1 }}>
                {/* Title and Status */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 600, flex: 1 }}>
                    {project.title}
                  </Typography>
                  <Chip
                    icon={statusIcons[project.status]}
                    label={project.status}
                    color={statusColors[project.status]}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                  {project.description.length > 100
                    ? `${project.description.substring(0, 100)}...`
                    : project.description}
                </Typography>

                {/* Key Features */}
                <Box color="text.primary" sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.primary" sx={{ mb: 1, display: 'block', fontSize: '0.8rem' }}>
                    Key Features:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {project.keyFeatures.slice(0, 3).map((tech, index) => (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }} key={index}>{tech}</Typography>
                    ))}
                    {project.keyFeatures.length > 3 && (
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                        {`+${project.keyFeatures.length - 3}`}
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Technologies */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.primary" sx={{ mb: 1, display: 'block', fontSize: '0.8rem' }}>
                    Technologies:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {project.technologies.slice(0, 3).map((tech, index) => (
                      <Chip
                        key={index}
                        label={tech}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    ))}
                    {project.technologies.length > 3 && (
                      <Chip
                        label={`+${project.technologies.length - 3}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Dates */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(project.startDate).toLocaleDateString()}
                    {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Box>
                  {project.repositoryUrl && (
                    <Tooltip title="View Repository">
                      <IconButton
                        size="small"
                        onClick={() => window.open(project.repositoryUrl, '_blank')}
                      >
                        <GitHubIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  {project.liveUrl && (
                    <Tooltip title="View Live">
                      <IconButton
                        size="small"
                        onClick={() => window.open(project.liveUrl, '_blank')}
                      >
                        <LanguageIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Box>
                  <Tooltip title="Edit Project">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(project)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Project">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(project._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Project Form Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {editingProject ? <EditIcon /> : <AddIcon />}
            {editingProject ? 'Edit Project' : 'Create New Project'}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Box>
            
            <Box>
              <TextField
                fullWidth
                label="Project Title *"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />
            </Box>

            <Box>
              <TextField
                fullWidth
                label="Description *"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                error={!!formErrors.description}
                helperText={formErrors.description}
                multiline
                rows={4}
                required
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="Start Date *"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'archived' | 'draft' | 'completed' }))}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* URLs */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Project Links
              </Typography>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                fullWidth
                label="GitHub Repository URL"
                value={formData.repositoryUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, repositoryUrl: e.target.value }))}
                error={!!formErrors.repositoryUrl}
                helperText={formErrors.repositoryUrl || 'Optional: Link to your GitHub repository'}
                placeholder="https://github.com/username/repo"
              />

              <TextField
                fullWidth
                label="Live Demo URL"
                value={formData.liveUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, liveUrl: e.target.value }))}
                error={!!formErrors.liveUrl}
                helperText={formErrors.liveUrl || 'Optional: Link to live demo'}
                placeholder="https://your-project.com"
              />
            </Box>

            {/* Images */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Project Images *
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Add image URLs to showcase your project
              </Typography>
              {formData.images.map((url, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Image URL ${index + 1}`}
                    value={url}
                    onChange={(e) => updateArrayField('images', index, e.target.value)}
                    error={index === 0 && !!formErrors.images}
                    helperText={index === 0 && formErrors.images}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.images.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeArrayField('images', index)}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={() => addArrayField('images')}
                sx={{ mt: 1 }}
              >
                Add Another Image
              </Button>
            </Box>

            {/* Key Features */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Key Features *
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Describe the main features of your project
              </Typography>
              {formData.keyFeatures.map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Feature ${index + 1}`}
                    value={feature}
                    onChange={(e) => updateArrayField('keyFeatures', index, e.target.value)}
                    error={index === 0 && !!formErrors.keyFeatures}
                    helperText={index === 0 && formErrors.keyFeatures}
                    placeholder="e.g., User authentication, Real-time chat"
                  />
                  {formData.keyFeatures.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeArrayField('keyFeatures', index)}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={() => addArrayField('keyFeatures')}
                sx={{ mt: 1 }}
              >
                Add Another Feature
              </Button>
            </Box>

            {/* Technologies */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Technologies Used *
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                List the technologies, frameworks, and tools used
              </Typography>
              {formData.technologies.map((tech, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    label={`Technology ${index + 1}`}
                    value={tech}
                    onChange={(e) => updateArrayField('technologies', index, e.target.value)}
                    error={index === 0 && !!formErrors.technologies}
                    helperText={index === 0 && formErrors.technologies}
                    placeholder="e.g., React, Node.js, MongoDB"
                  />
                  {formData.technologies.length > 1 && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeArrayField('technologies', index)}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button
                variant="outlined"
                onClick={() => addArrayField('technologies')}
                sx={{ mt: 1 }}
              >
                Add Another Technology
              </Button>
            </Box>
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
          >
            {editingProject ? 'Update Project' : 'Create Project'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Projects;
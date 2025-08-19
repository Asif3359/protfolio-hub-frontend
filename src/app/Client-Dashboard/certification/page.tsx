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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  Description as DescriptionIcon,
  Verified as VerifiedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Link as LinkIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

interface Certification {
  _id: string;
  userId: string;
  title: string;
  issuer: string;
  issuerLogo?: string;
  issueDate: string;
  expirationDate?: string;
  credentialID?: string;
  credentialLink?: string;
  description?: string;
  skills: string[];
  doesNotExpire: boolean;
  media?: string;
  visible: boolean;
  verification: {
    verified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CertificationFormData {
  title: string;
  issuer: string;
  issuerLogo: string;
  issueDate: string;
  expirationDate: string;
  credentialID: string;
  credentialLink: string;
  description: string;
  skills: string[];
  doesNotExpire: boolean;
  media: string;
  visible: boolean;
}

const initialFormData: CertificationFormData = {
  title: "",
  issuer: "",
  issuerLogo: "",
  issueDate: "",
  expirationDate: "",
  credentialID: "",
  credentialLink: "",
  description: "",
  skills: [],
  doesNotExpire: false,
  media: "",
  visible: true,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub-backend.onrender.com/api';

function CertificationPage() {
  const { user } = useAuth();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [formData, setFormData] = useState<CertificationFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/certification/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch certifications");
      }

      const data = await response.json();
      setCertifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (certificationItem?: Certification) => {
    if (certificationItem) {
      setEditingCertification(certificationItem);
      setFormData({
        title: certificationItem.title,
        issuer: certificationItem.issuer,
        issuerLogo: certificationItem.issuerLogo || "",
        issueDate: certificationItem.issueDate.split("T")[0],
        expirationDate: certificationItem.expirationDate ? certificationItem.expirationDate.split("T")[0] : "",
        credentialID: certificationItem.credentialID || "",
        credentialLink: certificationItem.credentialLink || "",
        description: certificationItem.description || "",
        skills: certificationItem.skills || [],
        doesNotExpire: certificationItem.doesNotExpire,
        media: certificationItem.media || "",
        visible: certificationItem.visible,
      });
    } else {
      setEditingCertification(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCertification(null);
    setFormData(initialFormData);
    setFormErrors({});
    setNewSkill("");
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Certification title is required";
    }

    if (!formData.issuer.trim()) {
      errors.issuer = "Issuing organization is required";
    }

    if (!formData.issueDate) {
      errors.issueDate = "Issue date is required";
    }

    if (!formData.doesNotExpire && formData.expirationDate) {
      if (new Date(formData.expirationDate) <= new Date(formData.issueDate)) {
        errors.expirationDate = "Expiration date must be after issue date";
      }
    }

    if (formData.credentialLink && !isValidUrl(formData.credentialLink)) {
      errors.credentialLink = "Please enter a valid URL";
    }

    if (formData.description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
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
      const url = editingCertification
        ? `${API_URL}/certification/${editingCertification._id}`
        : `${API_URL}/certification`;

      const method = editingCertification ? "PUT" : "POST";

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
        throw new Error(errorData.msg || "Failed to save certification");
      }

      await fetchCertifications();
      handleCloseDialog();
      setSuccess(
        editingCertification
          ? "Certification updated successfully!"
          : "Certification added successfully!"
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (certificationId: string) => {
    if (!confirm("Are you sure you want to delete this certification?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/certification/${certificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete certification");
      }

      await fetchCertifications();
      setSuccess("Certification deleted successfully!");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (expirationDate: string) => {
    return new Date(expirationDate) < new Date();
  };

  const isExpiringSoon = (expirationDate: string) => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return new Date(expirationDate) <= thirtyDaysFromNow && new Date(expirationDate) > new Date();
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
            Certifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your professional certifications and credentials
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Certification
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

      {/* Certification Cards */}
      {certifications.length === 0 ? (
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
            No certifications yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Start building your professional profile by adding your certifications
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Certification
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {certifications.map((certification) => (
            <Card
              key={certification._id}
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
              {certification.verification.verified && (
                <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
                  <Tooltip title="Verified Certification">
                    <VerifiedIcon sx={{ color: "success.main", fontSize: 24 }} />
                  </Tooltip>
                </Box>
              )}

              <CardContent sx={{ pt: 4 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  {/* Logo */}
                  {certification.issuerLogo && (
                    <Avatar
                      src={certification.issuerLogo}
                      alt={certification.issuer}
                      sx={{ width: 60, height: 60, flexShrink: 0 }}
                    >
                      <WorkIcon />
                    </Avatar>
                  )}

                  {/* Content */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Box>
                        <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                          {certification.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {certification.issuer}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                        {/* Visibility Badge */}
                        <Tooltip title={`Visible to ${certification.visible ? "public" : "connections only"}`}>
                          <VisibilityIcon sx={{ color: certification.visible ? "primary.main" : "text.disabled", fontSize: 20 }} />
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(certification)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(certification._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Dates */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <CalendarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          Issued: {formatDate(certification.issueDate)}
                        </Typography>
                      </Box>
                      
                      {!certification.doesNotExpire && certification.expirationDate && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography 
                            variant="caption" 
                            color={
                              isExpired(certification.expirationDate) 
                                ? "error.main" 
                                : isExpiringSoon(certification.expirationDate) 
                                  ? "warning.main" 
                                  : "text.secondary"
                            }
                            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                          >
                            Expires: {formatDate(certification.expirationDate)}
                            {isExpired(certification.expirationDate) && (
                              <WarningIcon sx={{ fontSize: 14 }} />
                            )}
                            {isExpiringSoon(certification.expirationDate) && (
                              <CheckCircleIcon sx={{ fontSize: 14 }} />
                            )}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Skills */}
                    {certification.skills.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {certification.skills.slice(0, 5).map((skill, index) => (
                            <Chip
                              key={index}
                              label={skill}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          ))}
                          {certification.skills.length > 5 && (
                            <Chip
                              label={`+${certification.skills.length - 5}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Description */}
                    {certification.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {certification.description}
                      </Typography>
                    )}

                    {/* Credential Info */}
                    {(certification.credentialID || certification.credentialLink) && (
                      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        {certification.credentialID && (
                          <Typography variant="caption" color="text.secondary">
                            ID: {certification.credentialID}
                          </Typography>
                        )}
                        {certification.credentialLink && (
                          <Button
                            size="small"
                            startIcon={<LinkIcon />}
                            href={certification.credentialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textTransform: "none" }}
                          >
                            Verify Credential
                          </Button>
                        )}
                      </Box>
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
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ backgroundColor: "primary.main", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {editingCertification ? <EditIcon /> : <AddIcon />}
            {editingCertification ? "Edit Certification" : "Add New Certification"}
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3 ,mt:2}}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Title */}
            <TextField
              sx={{mt:2}} 
              fullWidth
              label="Certification Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              error={!!formErrors.title}
              helperText={formErrors.title}
              required
            />

            {/* Issuer */}
            <TextField
              fullWidth
              label="Issuing Organization"
              value={formData.issuer}
              onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
              error={!!formErrors.issuer}
              helperText={formErrors.issuer}
              required
            />

            {/* Issuer Logo */}
            <TextField
              fullWidth
              label="Issuer Logo URL"
              value={formData.issuerLogo}
              onChange={(e) => setFormData(prev => ({ ...prev, issuerLogo: e.target.value }))}
              placeholder="https://example.com/logo.png"
            />

            {/* Issue Date */}
            <TextField
              fullWidth
              label="Issue Date"
              type="date"
              value={formData.issueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
              error={!!formErrors.issueDate}
              helperText={formErrors.issueDate}
              required
              InputLabelProps={{ shrink: true }}
            />

            {/* Does Not Expire */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.doesNotExpire}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    doesNotExpire: e.target.checked,
                    expirationDate: e.target.checked ? "" : prev.expirationDate
                  }))}
                />
              }
              label="This certification does not expire"
            />

            {/* Expiration Date */}
            <TextField
              fullWidth
              label="Expiration Date"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))}
              error={!!formErrors.expirationDate}
              helperText={formErrors.expirationDate}
              disabled={formData.doesNotExpire}
              InputLabelProps={{ shrink: true }}
            />

            {/* Credential ID */}
            <TextField
              fullWidth
              label="Credential ID"
              value={formData.credentialID}
              onChange={(e) => setFormData(prev => ({ ...prev, credentialID: e.target.value }))}
              placeholder="e.g., CERT-12345"
            />

            {/* Credential Link */}
            <TextField
              fullWidth
              label="Credential Link"
              value={formData.credentialLink}
              onChange={(e) => setFormData(prev => ({ ...prev, credentialLink: e.target.value }))}
              error={!!formErrors.credentialLink}
              helperText={formErrors.credentialLink}
              placeholder="https://example.com/verify"
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              error={!!formErrors.description}
              helperText={formErrors.description || `${formData.description.length}/1000 characters`}
              multiline
              rows={3}
              inputProps={{ maxLength: 1000 }}
            />

            {/* Skills */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Skills & Technologies
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
                {formData.skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    onDelete={() => handleRemoveSkill(skill)}
                    size="small"
                  />
                ))}
              </Stack>
            </Box>

            {/* Media */}
            <TextField
              fullWidth
              label="Certificate Image/Document URL"
              value={formData.media}
              onChange={(e) => setFormData(prev => ({ ...prev, media: e.target.value }))}
              placeholder="https://example.com/certificate.pdf"
            />

            {/* Visibility */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.visible}
                  onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                />
              }
              label="Make this certification visible to the public"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving}
            startIcon={editingCertification ? <EditIcon /> : <AddIcon />}
          >
            {saving ? "Saving..." : editingCertification ? "Update" : "Add"} Certification
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CertificationPage;
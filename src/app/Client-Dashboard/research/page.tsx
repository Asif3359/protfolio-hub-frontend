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
  Science as ScienceIcon,
  CalendarToday as CalendarIcon,
  Verified as VerifiedIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Link as LinkIcon,
  Article as ArticleIcon,
  Book as BookIcon,
  Assignment as ThesisIcon,
  Description as PreprintIcon,
  Assessment as ReportIcon,
  MoreHoriz as OtherIcon,
  PictureAsPdf as PdfIcon,
  Language as ProjectIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

interface CoAuthor {
  name: string;
  institution: string;
}

interface ResearchLinks {
  pdf?: string;
  projectPage?: string;
  codeRepository?: string;
}

interface Research {
  _id: string;
  userId: string;
  title: string;
  description: string;
  researchField: string;
  publicationDate: string;
  publisher?: string;
  publicationType: string;
  doi?: string;
  coAuthors: CoAuthor[];
  institution?: string;
  fundingAgency?: string;
  grantNumber?: string;
  keywords: string[];
  citations: number;
  links: ResearchLinks;
  isPublished: boolean;
  peerReviewed: boolean;
  impactStatement?: string;
  createdAt: string;
  updatedAt: string;
}

interface ResearchFormData {
  title: string;
  description: string;
  researchField: string;
  publicationDate: string;
  publisher: string;
  publicationType: string;
  doi: string;
  coAuthors: CoAuthor[];
  institution: string;
  fundingAgency: string;
  grantNumber: string;
  keywords: string[];
  links: ResearchLinks;
  isPublished: boolean;
  peerReviewed: boolean;
  impactStatement: string;
}

const initialFormData: ResearchFormData = {
  title: "",
  description: "",
  researchField: "",
  publicationDate: "",
  publisher: "",
  publicationType: "",
  doi: "",
  coAuthors: [],
  institution: "",
  fundingAgency: "",
  grantNumber: "",
  keywords: [],
  links: {},
  isPublished: true,
  peerReviewed: false,
  impactStatement: "",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub-backend.onrender.com/api';

const publicationTypeIcons: Record<string, React.ReactElement> = {
  "Journal Article": <ArticleIcon />,
  "Conference Paper": <PreprintIcon />,
  "Book Chapter": <BookIcon />,
  Thesis: <ThesisIcon />,
  Preprint: <PreprintIcon />,
  "Technical Report": <ReportIcon />,
  Other: <OtherIcon />,
};

function ResearchPage() {
  const { user } = useAuth();
  const [research, setResearch] = useState<Research[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResearch, setEditingResearch] = useState<Research | null>(null);
  const [formData, setFormData] = useState<ResearchFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [newKeyword, setNewKeyword] = useState("");
  const [newCoAuthor, setNewCoAuthor] = useState({ name: "", institution: "" });

  useEffect(() => {
    fetchResearch();
  }, []);

  const fetchResearch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/research/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch research");
      }

      const data = await response.json();
      setResearch(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (researchItem?: Research) => {
    if (researchItem) {
      setEditingResearch(researchItem);
      setFormData({
        title: researchItem.title,
        description: researchItem.description,
        researchField: researchItem.researchField,
        publicationDate: researchItem.publicationDate.split("T")[0],
        publisher: researchItem.publisher || "",
        publicationType: researchItem.publicationType,
        doi: researchItem.doi || "",
        coAuthors: researchItem.coAuthors || [],
        institution: researchItem.institution || "",
        fundingAgency: researchItem.fundingAgency || "",
        grantNumber: researchItem.grantNumber || "",
        keywords: researchItem.keywords || [],
        links: researchItem.links || {},
        isPublished: researchItem.isPublished,
        peerReviewed: researchItem.peerReviewed,
        impactStatement: researchItem.impactStatement || "",
      });
    } else {
      setEditingResearch(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingResearch(null);
    setFormData(initialFormData);
    setFormErrors({});
    setNewKeyword("");
    setNewCoAuthor({ name: "", institution: "" });
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Research title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Description is required";
    }

    if (!formData.researchField.trim()) {
      errors.researchField = "Research field is required";
    }

    if (!formData.publicationDate) {
      errors.publicationDate = "Publication date is required";
    }

    if (!formData.publicationType) {
      errors.publicationType = "Publication type is required";
    }

    if (formData.description.length > 1000) {
      errors.description = "Description cannot exceed 1000 characters";
    }

    if (formData.impactStatement && formData.impactStatement.length > 500) {
      errors.impactStatement = "Impact statement cannot exceed 500 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      const url = editingResearch
        ? `${API_URL}/research/${editingResearch._id}`
        : `${API_URL}/research`;

      const method = editingResearch ? "PUT" : "POST";

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
        throw new Error(errorData.msg || "Failed to save research");
      }

      await fetchResearch();
      handleCloseDialog();
      setSuccess(
        editingResearch
          ? "Research updated successfully!"
          : "Research added successfully!"
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (researchId: string) => {
    if (!confirm("Are you sure you want to delete this research?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/research/${researchId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete research");
      }

      await fetchResearch();
      setSuccess("Research deleted successfully!");
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setSuccess(null);
    }
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((keyword) => keyword !== keywordToRemove),
    }));
  };

  const handleAddCoAuthor = () => {
    if (newCoAuthor.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        coAuthors: [...prev.coAuthors, { ...newCoAuthor }],
      }));
      setNewCoAuthor({ name: "", institution: "" });
    }
  };

  const handleRemoveCoAuthor = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      coAuthors: prev.coAuthors.filter((_, index) => index !== indexToRemove),
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
            Research Publications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your research publications and academic work
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add Research
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

      {/* Research Cards */}
      {research.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            border: "2px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <ScienceIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No research publications yet
          </Typography>
          <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
            Start building your academic profile by adding your research
            publications
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Publication
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {research.map((researchItem) => (
            <Card
              key={researchItem._id}
              sx={{
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: 3,
                },
                position: "relative",
              }}
            >
              {/* Peer Review Badge */}
              {/* {researchItem.peerReviewed && (
                <Box sx={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
                  <Tooltip title="Peer Reviewed">
                    <VerifiedIcon sx={{ color: "success.main", fontSize: 24 }} />
                  </Tooltip>
                </Box>
              )} */}

              {/* Publication Status Badge */}
              {/* <Box sx={{ position: "absolute", top: 16, left: 16, zIndex: 1 }}>
                {researchItem.isPublished ? (
                  <Tooltip title="Published">
                    <VisibilityIcon sx={{ color: "primary.main", fontSize: 20 }} />
                  </Tooltip>
                ) : (
                  <Tooltip title="Draft/Unpublished">
                    <VisibilityOffIcon sx={{ color: "text.disabled", fontSize: 20 }} />
                  </Tooltip>
                )}
              </Box> */}

              <CardContent sx={{ pt: 4 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                  {/* Publication Type Icon */}
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      flexShrink: 0,
                      bgcolor: "primary.main",
                      color: "white",
                    }}
                  >
                    {publicationTypeIcons[researchItem.publicationType] || (
                      <ScienceIcon />
                    )}
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
                          {researchItem.title}
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
                            label={researchItem.publicationType}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          {researchItem.researchField && (
                            <Typography variant="body2" color="text.secondary">
                              • {researchItem.researchField}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                          position: "absolute",
                          top: 16,
                          right: 16,
                          zIndex: 1,
                        }}
                      >
                        {/* Visibility Badge */}
                        {researchItem.peerReviewed && (
                          <Tooltip title="Peer Reviewed">
                            <VerifiedIcon
                              sx={{ color: "success.main", fontSize: 24 }}
                            />
                          </Tooltip>
                        )}
                        <Tooltip
                          title={`Visible to ${researchItem.isPublished ? "public" : "connections only"}`}
                        >
                          <VisibilityIcon
                            sx={{
                              color: researchItem.isPublished
                                ? "primary.main"
                                : "text.disabled",
                              fontSize: 20,
                            }}
                          />
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(researchItem)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(researchItem._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Publication Info */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <CalendarIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(researchItem.publicationDate)}
                        </Typography>
                      </Box>

                      {researchItem.publisher && (
                        <Typography variant="caption" color="text.secondary">
                          • {researchItem.publisher}
                        </Typography>
                      )}

                      {researchItem.citations > 0 && (
                        <Typography
                          variant="caption"
                          color="primary.main"
                          sx={{ fontWeight: 600 }}
                        >
                          • {researchItem.citations} citations
                        </Typography>
                      )}
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {researchItem.description}
                    </Typography>

                    {/* Impact Statement */}
                    {researchItem.impactStatement && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, fontStyle: "italic" }}
                      >
                        Impact: {researchItem.impactStatement}
                      </Typography>
                    )}

                    {/* Co-Authors */}
                    {researchItem.coAuthors.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 1 }}
                        >
                          Co-Authors:
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {researchItem.coAuthors
                            .slice(0, 3)
                            .map((author, index) => (
                              <Chip
                                key={index}
                                label={author.name}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: "0.7rem" }}
                              />
                            ))}
                          {researchItem.coAuthors.length > 3 && (
                            <Chip
                              label={`+${researchItem.coAuthors.length - 3} more`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Keywords */}
                    {researchItem.keywords.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {researchItem.keywords
                            .slice(0, 5)
                            .map((keyword, index) => (
                              <Chip
                                key={index}
                                label={keyword}
                                size="small"
                                variant="outlined"
                                color="secondary"
                                sx={{ fontSize: "0.6rem" }}
                              />
                            ))}
                          {researchItem.keywords.length > 5 && (
                            <Chip
                              label={`+${researchItem.keywords.length - 5}`}
                              size="small"
                              variant="outlined"
                              color="secondary"
                              sx={{ fontSize: "0.6rem" }}
                            />
                          )}
                        </Stack>
                      </Box>
                    )}

                    {/* Links */}
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {researchItem.doi && (
                        <Button
                          size="small"
                          startIcon={<LinkIcon />}
                          href={`https://doi.org/${researchItem.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textTransform: "none" }}
                        >
                          DOI
                        </Button>
                      )}
                      {researchItem.links.pdf && (
                        <Button
                          size="small"
                          startIcon={<PdfIcon />}
                          href={researchItem.links.pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textTransform: "none" }}
                        >
                          PDF
                        </Button>
                      )}
                      {researchItem.links.projectPage && (
                        <Button
                          size="small"
                          startIcon={<ProjectIcon />}
                          href={researchItem.links.projectPage}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textTransform: "none" }}
                        >
                          Project
                        </Button>
                      )}
                      {researchItem.links.codeRepository && (
                        <Button
                          size="small"
                          startIcon={<CodeIcon />}
                          href={researchItem.links.codeRepository}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ textTransform: "none" }}
                        >
                          Code
                        </Button>
                      )}
                    </Box>
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
            {editingResearch ? <EditIcon /> : <AddIcon />}
            {editingResearch ? "Edit Research" : "Add New Research"}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, mt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Title */}
            <TextField
              sx={{ mt: 2 }}
              fullWidth
              label="Research Title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              error={!!formErrors.title}
              helperText={formErrors.title}
              required
            />

            {/* Research Field */}
            <TextField
              fullWidth
              label="Research Field"
              value={formData.researchField}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  researchField: e.target.value,
                }))
              }
              error={!!formErrors.researchField}
              helperText={formErrors.researchField}
              required
            />

            {/* Publication Type */}
            <FormControl
              fullWidth
              required
              error={!!formErrors.publicationType}
            >
              <InputLabel>Publication Type</InputLabel>
              <Select
                value={formData.publicationType}
                label="Publication Type"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    publicationType: e.target.value,
                  }))
                }
              >
                <MenuItem value="Journal Article">Journal Article</MenuItem>
                <MenuItem value="Conference Paper">Conference Paper</MenuItem>
                <MenuItem value="Book Chapter">Book Chapter</MenuItem>
                <MenuItem value="Thesis">Thesis</MenuItem>
                <MenuItem value="Preprint">Preprint</MenuItem>
                <MenuItem value="Technical Report">Technical Report</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
              {formErrors.publicationType && (
                <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                  {formErrors.publicationType}
                </Typography>
              )}
            </FormControl>

            {/* Publication Date */}
            <TextField
              fullWidth
              label="Publication Date"
              type="date"
              value={formData.publicationDate}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  publicationDate: e.target.value,
                }))
              }
              error={!!formErrors.publicationDate}
              helperText={formErrors.publicationDate}
              required
              InputLabelProps={{ shrink: true }}
            />

            {/* Publisher */}
            <TextField
              fullWidth
              label="Publisher"
              value={formData.publisher}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, publisher: e.target.value }))
              }
              placeholder="e.g., Nature, IEEE, ACM"
            />

            {/* DOI */}
            <TextField
              fullWidth
              label="DOI"
              value={formData.doi}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, doi: e.target.value }))
              }
              placeholder="10.1000/182"
            />

            {/* Institution */}
            <TextField
              fullWidth
              label="Institution"
              value={formData.institution}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  institution: e.target.value,
                }))
              }
              placeholder="e.g., University of Technology"
            />

            {/* Funding Information */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                label="Funding Agency"
                value={formData.fundingAgency}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    fundingAgency: e.target.value,
                  }))
                }
                placeholder="e.g., NSF, NIH"
              />
              <TextField
                fullWidth
                label="Grant Number"
                value={formData.grantNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    grantNumber: e.target.value,
                  }))
                }
                placeholder="e.g., NSF-1234567"
              />
            </Box>

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
                `${formData.description.length}/1000 characters`
              }
              multiline
              rows={4}
              inputProps={{ maxLength: 1000 }}
              required
            />

            {/* Impact Statement */}
            <TextField
              fullWidth
              label="Impact Statement (Optional)"
              value={formData.impactStatement}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  impactStatement: e.target.value,
                }))
              }
              error={!!formErrors.impactStatement}
              helperText={
                formErrors.impactStatement ||
                `${formData.impactStatement.length}/500 characters`
              }
              multiline
              rows={2}
              inputProps={{ maxLength: 500 }}
              placeholder="Describe the impact and significance of this research"
            />

            {/* Co-Authors */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Co-Authors
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="Name"
                  value={newCoAuthor.name}
                  onChange={(e) =>
                    setNewCoAuthor((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Institution"
                  value={newCoAuthor.institution}
                  onChange={(e) =>
                    setNewCoAuthor((prev) => ({
                      ...prev,
                      institution: e.target.value,
                    }))
                  }
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddCoAuthor}
                  disabled={!newCoAuthor.name.trim()}
                >
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formData.coAuthors.map((author, index) => (
                  <Chip
                    key={index}
                    label={`${author.name}${author.institution ? ` (${author.institution})` : ""}`}
                    onDelete={() => handleRemoveCoAuthor(index)}
                    size="small"
                    color="primary"
                  />
                ))}
              </Stack>
            </Box>

            {/* Keywords */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Keywords
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="Add keyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddKeyword()}
                  sx={{ flex: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddKeyword}
                  disabled={!newKeyword.trim()}
                >
                  Add
                </Button>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {formData.keywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    onDelete={() => handleRemoveKeyword(keyword)}
                    size="small"
                    color="secondary"
                  />
                ))}
              </Stack>
            </Box>

            {/* Links */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Links
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="PDF URL"
                  value={formData.links.pdf || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      links: { ...prev.links, pdf: e.target.value },
                    }))
                  }
                  placeholder="https://example.com/paper.pdf"
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Project Page URL"
                  value={formData.links.projectPage || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      links: { ...prev.links, projectPage: e.target.value },
                    }))
                  }
                  placeholder="https://example.com/project"
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Code Repository URL"
                  value={formData.links.codeRepository || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      links: { ...prev.links, codeRepository: e.target.value },
                    }))
                  }
                  placeholder="https://github.com/username/repo"
                />
              </Box>
            </Box>

            {/* Publication Status */}
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPublished: e.target.checked,
                    }))
                  }
                />
              }
              label="This research is published"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.peerReviewed}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      peerReviewed: e.target.checked,
                    }))
                  }
                />
              }
              label="This research is peer-reviewed"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving}
            startIcon={editingResearch ? <EditIcon /> : <AddIcon />}
          >
            {saving ? "Saving..." : editingResearch ? "Update" : "Add"} Research
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ResearchPage;

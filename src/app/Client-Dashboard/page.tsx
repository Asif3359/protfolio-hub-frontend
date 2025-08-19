'use client';

import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Work,
  Assessment,
  TrendingUp,
  Notifications,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Portfolio data interfaces
interface PortfolioData {
  user: {
    id: string;
    name: string;
    email: string;
    verified: boolean;
    role: string;
    createdAt: string;
  };
  profile: {
    _id: string;
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
  };
  projects: Array<{
    _id: string;
    userId: string;
    title: string;
    description: string;
    keyFeatures: string[];
    technologies: string[];
    startDate: string;
    status: string;
    images: { url: string; _id: string }[];
    createdAt: string;
    updatedAt: string;
    liveUrl: string;
    repositoryUrl: string;
  }>;
  experiences: Array<{
    _id: string;
    userId: string;
    title: string;
    employmentType: string;
    company: string;
    location: string;
    locationType: string;
    startDate: string;
    endDate: string;
    currentlyWorking: boolean;
    description: string;
    skills: string[];
    media: string;
    visible: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
  educations: Array<{
    _id: string;
    userId: string;
    school: string;
    logo: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string | null;
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
  }>;
  certifications: Array<{
    _id: string;
    userId: string;
    title: string;
    issuer: string;
    issuerLogo: string;
    issueDate: string;
    expirationDate: string | null;
    credentialID: string;
    credentialLink: string;
    description: string;
    skills: string[];
    doesNotExpire: boolean;
    media: string;
    visible: boolean;
    createdAt: string;
    updatedAt: string;
    verification: {
      verified: boolean;
    };
  }>;
  achievements: Array<{
    _id: string;
    userId: string;
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
    createdAt: string;
    updatedAt: string;
    verification: {
      verified: boolean;
    };
  }>;
  researches: Array<{
    _id: string;
    userId: string;
    title: string;
    description: string;
    researchField: string;
    publicationDate: string;
    publisher: string;
    publicationType: string;
    doi: string;
    coAuthors: {
      name: string;
      institution: string;
    }[];
    institution: string;
    fundingAgency: string;
    grantNumber: string;
    keywords: string[];
    citations: number;
    isPublished: boolean;
    peerReviewed: boolean;
    impactStatement: string;
    createdAt: string;
    updatedAt: string;
    links: {
      pdf: string;
      projectPage: string;
      codeRepository: string;
    };
  }>;
  skills: Array<{
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
  }>;
}

export default function ClientDashboardPage() {
  const { user, profileData } = useAuth();
  const router = useRouter();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `https://protfolio-hub-backend.onrender.com/api/portfolio/email/${user.email}`
        );
        const result = await response.json();

        if (result.success) {
          setPortfolioData(result.data);
        } else {
          setError("Failed to fetch portfolio data");
        }
      } catch (err) {
        setError("Error fetching portfolio data");
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, [user?.email]);

  // Calculate statistics
  const stats = {
    projects: portfolioData?.projects?.length || 0,
    skills: portfolioData?.skills?.length || 0,
    experiences: portfolioData?.experiences?.length || 0,
    certifications: portfolioData?.certifications?.length || 0,
    achievements: portfolioData?.achievements?.length || 0,
    researches: portfolioData?.researches?.length || 0,
  };

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!portfolioData) return 0;
    
    const sections = [
      portfolioData.profile?.headline ? 1 : 0,
      portfolioData.profile?.bio ? 1 : 0,
      portfolioData.profile?.location ? 1 : 0,
      portfolioData.projects?.length > 0 ? 1 : 0,
      portfolioData.skills?.length > 0 ? 1 : 0,
      portfolioData.experiences?.length > 0 ? 1 : 0,
      portfolioData.educations?.length > 0 ? 1 : 0,
      portfolioData.certifications?.length > 0 ? 1 : 0,
      portfolioData.achievements?.length > 0 ? 1 : 0,
      portfolioData.researches?.length > 0 ? 1 : 0,
    ];
    
    return Math.round((sections.reduce((a, b) => a + b, 0) / sections.length) * 100);
  };

  // Navigation functions
  const handleBasicInfoClick = () => {
    router.push('/Client-Dashboard/profile');
  };

  const handleProjectsClick = () => {
    router.push('/Client-Dashboard/projects');
  };

  const handleSkillsClick = () => {
    router.push('/Client-Dashboard/skill');
  };

  const handleExperienceClick = () => {
    router.push('/Client-Dashboard/experience');
  };

  const handleEducationClick = () => {
    router.push('/Client-Dashboard/education');
  };

  const handleCertificationsClick = () => {
    router.push('/Client-Dashboard/certification');
  };

  const handleAchievementsClick = () => {
    router.push('/Client-Dashboard/achievement');
  };

  const handleCompletePortfolioClick = () => {
    // Find the first incomplete section and redirect there
    if (!portfolioData?.profile?.headline || !portfolioData?.profile?.bio || !portfolioData?.profile?.location) {
      router.push('/Client-Dashboard/profile');
    } else if (stats.projects === 0) {
      router.push('/Client-Dashboard/projects');
    } else if (stats.skills === 0) {
      router.push('/Client-Dashboard/skill');
    } else if (stats.experiences === 0) {
      router.push('/Client-Dashboard/experience');
    } else if ((portfolioData?.educations?.length || 0) === 0) {
      router.push('/Client-Dashboard/education');
    } else if (stats.certifications === 0) {
      router.push('/Client-Dashboard/certification');
    } else if (stats.achievements === 0) {
      router.push('/Client-Dashboard/achievement');
    } else {
      // All sections complete, redirect to profile to add more details
      router.push('/Client-Dashboard');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Your Dashboard {user?.name}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your portfolio and track your progress
        </Typography> 
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Person sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div">
                    Profile Views
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                    {profileData?.views || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total profile views
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Work sx={{ mr: 1, color: 'secondary.main' }} />
                  <Typography variant="h6" component="div">
                    Projects
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {stats.projects}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.projects > 0 ? `${stats.projects} project${stats.projects > 1 ? 's' : ''} created` : 'No projects yet'}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Assessment sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6" component="div">
                    Skills
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {stats.skills}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.skills > 0 ? `${stats.skills} skill${stats.skills > 1 ? 's' : ''} added` : 'No skills yet'}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUp sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6" component="div">
                    Experience
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  {stats.experiences}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stats.experiences > 0 ? `${stats.experiences} experience${stats.experiences > 1 ? 's' : ''} listed` : 'No experience yet'}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '2 1 600px', minWidth: 0 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Portfolio Completion
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h3" component="div" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
                  {calculateProfileCompletion()}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateProfileCompletion()} 
                  sx={{ height: 12, borderRadius: 6, mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Complete your portfolio to increase your visibility
                </Typography>
              </Box>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 3 }}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'grey.200', 
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(46, 125, 50, 0.04)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                  onClick={handleBasicInfoClick}
                >
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Basic Info
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {portfolioData?.profile?.headline ? '✓' : '✗'} Headline
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {portfolioData?.profile?.bio ? '✓' : '✗'} Bio
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {portfolioData?.profile?.location ? '✓' : '✗'} Location
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'grey.200', 
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(46, 125, 50, 0.04)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Content
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={handleProjectsClick}
                  >
                    {stats.projects > 0 ? '✓' : '✗'} Projects ({stats.projects})
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={handleSkillsClick}
                  >
                    {stats.skills > 0 ? '✓' : '✗'} Skills ({stats.skills})
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={handleExperienceClick}
                  >
                    {stats.experiences > 0 ? '✓' : '✗'} Experience ({stats.experiences})
                  </Typography>
                </Box>
                
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'grey.200', 
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'rgba(46, 125, 50, 0.04)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    Credentials
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={handleEducationClick}
                  >
                    {(portfolioData?.educations?.length || 0) > 0 ? '✓' : '✗'} Education ({portfolioData?.educations?.length || 0})
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={handleCertificationsClick}
                  >
                    {stats.certifications > 0 ? '✓' : '✗'} Certifications ({stats.certifications})
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                    onClick={handleAchievementsClick}
                  >
                    {stats.achievements > 0 ? '✓' : '✗'} Achievements ({stats.achievements})
                  </Typography>
                </Box>
              </Box>

              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={handleCompletePortfolioClick}
                sx={{
                  background: 'linear-gradient(135deg, #2E7D32, #4CAF50)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 20px rgba(46, 125, 50, 0.4)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Complete Portfolio
              </Button>
            </Paper>
          </Box>

          {/* <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<Notifications />}
                  fullWidth
                >
                  View Notifications
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Work />}
                  fullWidth
                >
                  Add Project
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  fullWidth
                >
                  Update Skills
                </Button>
              </Box>
            </Paper>
          </Box> */}
        </Box>
      </Box>
    </>
  );
}
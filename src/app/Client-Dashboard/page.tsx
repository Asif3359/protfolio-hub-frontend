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
} from '@mui/material';
import {
  Person,
  Work,
  Assessment,
  TrendingUp,
  Notifications,
} from '@mui/icons-material';

export default function ClientDashboardPage() {
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Your Dashboard
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
                  1,234
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +12% from last month
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
                  8
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  3 completed this month
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
                  15
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  5 new skills added
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
                    Rating
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  4.8
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Based on 45 reviews
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
                Recent Activity
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Profile Completion
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  75% complete
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label="React" color="primary" />
                <Chip label="TypeScript" color="primary" />
                <Chip label="Node.js" color="primary" />
                <Chip label="MongoDB" color="primary" />
                <Chip label="Next.js" color="primary" />
              </Box>

              <Button variant="contained" color="primary">
                Update Profile
              </Button>
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
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
          </Box>
        </Box>
      </Box>
    </>
  );
}
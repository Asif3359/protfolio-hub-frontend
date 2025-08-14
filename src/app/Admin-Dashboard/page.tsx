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
  People,
  Work,
  Analytics,
  Security,
  TrendingUp,
  Notifications,
  AdminPanelSettings,
  Assessment,
} from '@mui/icons-material';

export default function AdminDashboardPage() {
  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage users, portfolios, and system settings with comprehensive admin tools
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Stats Cards */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <People sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6" component="div">
                    Total Users
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  1,247
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +23 new users this month
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
                    Active Portfolios
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  892
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  156 portfolios created this week
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Analytics sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h6" component="div">
                    System Health
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  98.5%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  All systems operational
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Security sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="h6" component="div">
                    Security Score
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" sx={{ mb: 1 }}>
                  95.2
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  High security level maintained
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
                System Overview
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Server Performance
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={87} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  87% CPU utilization
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Database Performance
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={92} 
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  92% efficiency
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip label="Users Online: 156" color="primary" />
                <Chip label="Active Sessions: 89" color="primary" />
                <Chip label="API Calls: 1.2K/min" color="primary" />
                <Chip label="Storage: 78%" color="primary" />
              </Box>

              <Button variant="contained" color="primary">
                View Detailed Analytics
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
                  startIcon={<People />}
                  fullWidth
                >
                  Manage Users
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Work />}
                  fullWidth
                >
                  Review Portfolios
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Analytics />}
                  fullWidth
                >
                  View Analytics
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Security />}
                  fullWidth
                >
                  Security Settings
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AdminPanelSettings />}
                  fullWidth
                >
                  System Settings
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  );
}
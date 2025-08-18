"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Alert,
  Stack,
  useTheme,
  useMediaQuery,
  Skeleton,
  Theme,
  SxProps,
} from "@mui/material";
import {
  People,
  Analytics,
  Security,
  AdminPanelSettings,
  Refresh,
  Folder,
  Wifi,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { fetchSystemMetrics, SystemMetrics, formatBytes, formatUptime, calculateCpuUsage, calculateMemoryUsage } from "@/utils/systemMetrics";
import { getFrontendMetrics, PerformanceMonitor, FrontendMetrics } from "@/utils/frontendMetrics";

interface BasicUserInfo {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
}

interface BasicProfileInfo {
  headline?: string;
  profileImage?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://protfolio-hub.vercel.app/api";


export default function AdminDashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  const [onlineUsersCount, setOnlineUsersCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [systemHealth, setSystemHealth] = useState<number>(0);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [frontendMetrics, setFrontendMetrics] = useState<FrontendMetrics | null>(null);
  const [performanceMonitor, setPerformanceMonitor] = useState<PerformanceMonitor | null>(null);
  const [backendCpuMetrics, setBackendCpuMetrics] = useState<{
    usage: number;
    cores: number;
    loadAverage: { '1min': number; '5min': number; '15min': number };
    model: string;
    speed: number;
  } | null>(null);
  const [backendMemoryMetrics, setBackendMemoryMetrics] = useState<{
    total: number;
    used: number;
    free: number;
    usage: number;
    formatted: { total: string; used: string; free: string };
  } | null>(null);

  // Calculate system health on frontend (alternative to backend API)
  const calculateFrontendSystemHealth = useCallback(() => {
    // Simple health calculation based on available data
    let healthScore = 100;
    
    // Deduct points if no users are online (might indicate issues)
    if (onlineUsersCount === 0 && usersCount > 0) {
      healthScore -= 20;
    }
    
    // Deduct points if user count is very low (might indicate issues)
    if (usersCount < 5) {
      healthScore -= 10;
    }
    
    // Add points for good user engagement
    if (onlineUsersCount > 0 && onlineUsersCount / usersCount > 0.1) {
      healthScore += 10;
    }
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, healthScore));
  }, [onlineUsersCount, usersCount]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      // Fetch users data
      const usersResponse = await fetch(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!usersResponse.ok) {
        throw new Error("Failed to fetch users data");
      }
      const usersData = await usersResponse.json();
      setUsersCount(usersData.data.length);

      

      // Fetch online users count from the online status API
      try {
        const onlineUsersResponse = await fetch(
          `${API_URL}/auth/online-users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (onlineUsersResponse.ok) {
          const onlineUsersData = await onlineUsersResponse.json();
          setOnlineUsersCount(onlineUsersData.count || 0);
        } else {
          console.warn("Failed to fetch online users count");
          setOnlineUsersCount(0);
        }
      } catch (err) {
        console.warn("Error fetching online users count:", err);
        setOnlineUsersCount(0);
      }

      // Fetch system health from backend
      try {
        const systemHealthResponse = await fetch(
          `${API_URL}/system/health`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (systemHealthResponse.ok) {
          const healthData = await systemHealthResponse.json();
          setSystemHealth(healthData.health || 0);
        } else {
          console.warn("Failed to fetch system health from backend, using frontend calculation");
          setSystemHealth(calculateFrontendSystemHealth());
        }
      } catch (err) {
        console.warn("Error fetching system health from backend, using frontend calculation:", err);
        setSystemHealth(calculateFrontendSystemHealth());
      }

      // Fetch CPU metrics from backend
      try {
        const cpuResponse = await fetch(`${API_URL}/system/cpu`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (cpuResponse.ok) {
          const cpuData = await cpuResponse.json();
          if (cpuData.success && cpuData.data) {
            setBackendCpuMetrics(cpuData.data);
            console.log("CPU metrics from backend:", cpuData.data);
          }
        } else {
          console.warn("Failed to fetch CPU metrics from backend");
        }
      } catch (err) {
        console.warn("Error fetching CPU metrics:", err);
      }

      // Fetch Memory metrics from backend
      try {
        const memoryResponse = await fetch(`${API_URL}/system/memory`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (memoryResponse.ok) {
          const memoryData = await memoryResponse.json();
          if (memoryData.success && memoryData.data) {
            setBackendMemoryMetrics(memoryData.data);
            console.log("Memory metrics from backend:", memoryData.data);
          }
        } else {
          console.warn("Failed to fetch Memory metrics from backend");
        }
      } catch (err) {
        console.warn("Error fetching Memory metrics:", err);
      }

      // Fetch system metrics from backend (fallback to general metrics)
      try {
        const metrics = await fetchSystemMetrics();
        if (metrics) {
          setSystemMetrics(metrics);
        } else {
          console.warn("Failed to fetch system metrics from backend, using frontend metrics");
          // Fallback to frontend metrics
          const frontendMetricsData = getFrontendMetrics();
          setFrontendMetrics(frontendMetricsData);
        }
      } catch (err) {
        console.warn("Error fetching system metrics, using frontend metrics:", err);
        const frontendMetricsData = getFrontendMetrics();
        setFrontendMetrics(frontendMetricsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Initialize performance monitoring
  useEffect(() => {
    const monitor = new PerformanceMonitor();
    monitor.startMonitoring(10000); // Update every 10 seconds
    setPerformanceMonitor(monitor);

    return () => {
      monitor.stopMonitoring();
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case "users":
        router.push("/Admin-Dashboard/users");
        break;
      case "portfolios":
        router.push("/Admin-Dashboard/portfolios");
        break;
      case "analytics":
        router.push("/Admin-Dashboard/analytics");
        break;
      default:
        break;
    }
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "primary.main",
    loading = false,
  }: {
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ComponentType<{ sx?: SxProps<Theme> }>;
    color?: string;
    loading?: boolean;
  }) => (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: `${color}15`,
              mr: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color, fontSize: 28 }} />
          </Box>
          <Typography
            variant="h6"
            component="div"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {title}
          </Typography>
        </Box>
        {loading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography
            variant="h3"
            component="div"
            sx={{
              mb: 1,
              fontWeight: 700,
              color: color,
              textAlign: "center",
            }}
          >
            {value}
          </Typography>
        )}
        {loading ? (
          <Skeleton variant="text" width="80%" />
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton variant="text" width="80%" />
        </Box>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box key={i} sx={{ flex: "1 1 200px", minWidth: 0 }}>
              <StatCard
                title="Loading..."
                value="0"
                subtitle="Loading..."
                icon={People}
                loading={true}
              />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Stack
          direction={isMobile ? "column" : "row"}
          justifyContent="space-between"
          alignItems={isMobile ? "stretch" : "center"}
          gap={2}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage users, portfolios, and system settings with comprehensive
              admin tools
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={refreshing}
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            {refreshing ? "Refreshing..." : "Refresh Data"}
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Stats Cards */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 3,
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 12px)",
                md: "1 1 calc(20% - 14.4px)",
              },
              minWidth: { xs: "100%", sm: "200px" },
            }}
          >
            <StatCard
              title="Total Users"
              value={usersCount||0}
              subtitle="Registered users"
              icon={People}
              color="primary.main"
            />
          </Box>

          <Box
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 12px)",
                md: "1 1 calc(20% - 14.4px)",
              },
              minWidth: { xs: "100%", sm: "200px" },
            }}
          >
            <StatCard
              title="Online Users"
              value={onlineUsersCount}
              subtitle="Currently active"
              icon={Wifi}
              color="success.main"
            />
          </Box>

          <Box
            sx={{
              flex: {
                xs: "1 1 100%",
                sm: "1 1 calc(50% - 12px)",
                md: "1 1 calc(20% - 14.4px)",
              },
              minWidth: { xs: "100%", sm: "200px" },
            }}
          >
            <StatCard
              title="System Health"
              value={`${systemHealth}%`}
              subtitle={"System status"}
              icon={Analytics}
              color="info.main"
            />
          </Box>
        </Box>

        {/* Main Content */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 3,
          }}
        >
          <Box
            sx={{
              flex: { lg: "2 1 600px" },
              minWidth: 0,
            }}
          >
            <Paper
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 3,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  mb: 3,
                }}
              >
                System Overview
              </Typography>

              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    CPU Usage
                  </Typography>
                  <Typography
                    variant="body2"
                    color="primary.main"
                    fontWeight={600}
                  >
                    {backendCpuMetrics 
                      ? `${backendCpuMetrics.usage}%`
                      : systemMetrics 
                      ? `${calculateCpuUsage(systemMetrics)}%`
                      : frontendMetrics && !isNaN(frontendMetrics.cpu.usage)
                      ? `${Math.min(100, Math.max(0, frontendMetrics.cpu.usage))}%`
                      : "0%"
                    }
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={backendCpuMetrics 
                    ? backendCpuMetrics.usage
                    : systemMetrics 
                    ? calculateCpuUsage(systemMetrics)
                    : frontendMetrics && !isNaN(frontendMetrics.cpu.usage)
                    ? Math.min(100, Math.max(0, frontendMetrics.cpu.usage))
                    : 0
                  }
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "rgba(25, 118, 210, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      background:
                        "linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)",
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {backendCpuMetrics 
                    ? `CPU utilization (${backendCpuMetrics.cores} cores) - Load: ${backendCpuMetrics.loadAverage['1min']}`
                    : systemMetrics 
                    ? `CPU utilization (${systemMetrics.cpu.cores} cores)`
                    : frontendMetrics 
                    ? `CPU utilization (${frontendMetrics.cpu.cores} cores)`
                    : "CPU utilization"
                  }
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Typography variant="body1" fontWeight={500}>
                    Memory Usage
                  </Typography>
                  <Typography
                    variant="body2"
                    color="success.main"
                    fontWeight={600}
                  >
                    {backendMemoryMetrics 
                      ? `${backendMemoryMetrics.usage}%`
                      : systemMetrics 
                      ? `${calculateMemoryUsage(systemMetrics)}%`
                      : frontendMetrics && !isNaN(frontendMetrics.memory.usage)
                      ? `${Math.min(100, Math.max(0, frontendMetrics.memory.usage))}%`
                      : "0%"
                    }
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={backendMemoryMetrics 
                    ? backendMemoryMetrics.usage
                    : systemMetrics 
                    ? calculateMemoryUsage(systemMetrics)
                    : frontendMetrics && !isNaN(frontendMetrics.memory.usage)
                    ? Math.min(100, Math.max(0, frontendMetrics.memory.usage))
                    : 0
                  }
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 5,
                      background:
                        "linear-gradient(90deg, #4caf50 0%, #81c784 100%)",
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  {backendMemoryMetrics 
                    ? `Memory utilization (${backendMemoryMetrics.formatted.used} / ${backendMemoryMetrics.formatted.total})`
                    : systemMetrics 
                    ? `Memory utilization (${formatBytes(systemMetrics.memory.used)} / ${formatBytes(systemMetrics.memory.total)})`
                    : frontendMetrics && frontendMetrics.memory.total > 0 && !isNaN(frontendMetrics.memory.used)
                    ? `Memory utilization (${formatBytes(frontendMetrics.memory.used)} / ${formatBytes(frontendMetrics.memory.total)})`
                    : "Memory utilization"
                  }
                </Typography>
              </Box>
            </Paper>
          </Box>

          <Box
            sx={{
              flex: { lg: "1 1 350px" },
              minWidth: 0,
            }}
          >
            <Stack spacing={3}>
              {/* Quick Actions */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
                }}
              >
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: 600,
                    color: "primary.main",
                    mb: 3,
                  }}
                >
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<People />}
                    fullWidth
                    onClick={() => handleQuickAction("users")}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 500,
                      textTransform: "none",
                      borderColor: "primary.main",
                      color: "primary.main",
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.05)",
                        borderColor: "primary.dark",
                      },
                    }}
                  >
                    Manage Users
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Folder />}
                    fullWidth
                    onClick={() => handleQuickAction("portfolios")}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 500,
                      textTransform: "none",
                      borderColor: "secondary.main",
                      color: "secondary.main",
                      "&:hover": {
                        backgroundColor: "rgba(156, 39, 176, 0.05)",
                        borderColor: "secondary.dark",
                      },
                    }}
                  >
                    Review Portfolios
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Analytics />}
                    fullWidth
                    onClick={() => handleQuickAction("analytics")}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 500,
                      textTransform: "none",
                      borderColor: "success.main",
                      color: "success.main",
                      "&:hover": {
                        backgroundColor: "rgba(76, 175, 80, 0.05)",
                        borderColor: "success.dark",
                      },
                    }}
                  >
                    View Analytics
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Security />}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 500,
                      textTransform: "none",
                      borderColor: "warning.main",
                      color: "warning.main",
                      "&:hover": {
                        backgroundColor: "rgba(255, 152, 0, 0.05)",
                        borderColor: "warning.dark",
                      },
                    }}
                  >
                    Security Settings
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AdminPanelSettings />}
                    fullWidth
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 500,
                      textTransform: "none",
                      borderColor: "info.main",
                      color: "info.main",
                      "&:hover": {
                        backgroundColor: "rgba(3, 169, 244, 0.05)",
                        borderColor: "info.dark",
                      },
                    }}
                  >
                    System Settings
                  </Button>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Box>
      </Box>
    </>
  );
}

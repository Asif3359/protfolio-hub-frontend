// Backend: /health
const express = require('express');
const os = require('os');
const { exec } = require('child_process');
const authenticate = require('../middleware/authenticate');
const router = express.Router();

router.get('/health', authenticate, async (req, res) => {
  try {
    // Calculate system health based on multiple factors
    const healthMetrics = await calculateSystemHealth();
    
    res.json({
      success: true,
      health: healthMetrics.overallHealth,
      status: getHealthStatus(healthMetrics.overallHealth),
      details: {
        cpu: healthMetrics.cpu,
        memory: healthMetrics.memory,
        disk: healthMetrics.disk,
        uptime: healthMetrics.uptime,
        responseTime: healthMetrics.responseTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('System health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system health',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get detailed system information
router.get('/info', authenticate, async (req, res) => {
  try {
    const systemInfo = await getSystemInfo();
    
    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system information'
    });
  }
});

// Get system metrics for monitoring
router.get('/metrics', authenticate, async (req, res) => {
  try {
    const metrics = await getSystemMetrics();
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('System metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get system metrics'
    });
  }
});

// Get CPU usage specifically
router.get('/cpu', authenticate, async (req, res) => {
  try {
    const cpuMetrics = await getCpuMetrics();
    
    res.json({
      success: true,
      data: cpuMetrics
    });
  } catch (error) {
    console.error('CPU metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get CPU metrics'
    });
  }
});

// Get Memory usage specifically
router.get('/memory', authenticate, async (req, res) => {
  try {
    const memoryMetrics = await getMemoryMetrics();
    
    res.json({
      success: true,
      data: memoryMetrics
    });
  } catch (error) {
    console.error('Memory metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get memory metrics'
    });
  }
});

// Get online users count
router.get('/online-users', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Count users who are online (last seen within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await User.countDocuments({
      isOnline: true,
      lastSeenAt: { $gte: fiveMinutesAgo }
    });

    res.json({
      success: true,
      data: {
        count: onlineUsers,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Online users count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get online users count'
    });
  }
});

async function calculateSystemHealth() {
  // CPU Usage
  const cpuUsage = os.loadavg()[0] * 100; // 1-minute load average
  
  // Memory Usage
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
  
  // Disk Usage (you might need a library like 'diskusage')
  const diskUsage = await getDiskUsage();
  
  // Uptime
  const uptime = os.uptime();
  const uptimeHours = uptime / 3600;
  
  // Response Time (simulate API response time)
  const responseTime = await measureResponseTime();
  
  // Calculate overall health score (0-100)
  let healthScore = 100;
  
  // Deduct points for high resource usage
  if (cpuUsage > 80) healthScore -= 20;
  else if (cpuUsage > 60) healthScore -= 10;
  
  if (memoryUsage > 90) healthScore -= 25;
  else if (memoryUsage > 75) healthScore -= 15;
  
  if (diskUsage > 90) healthScore -= 20;
  else if (diskUsage > 80) healthScore -= 10;
  
  // Deduct points for slow response time
  if (responseTime > 1000) healthScore -= 15;
  else if (responseTime > 500) healthScore -= 8;
  
  // Bonus for good uptime
  if (uptimeHours > 24) healthScore += 5;
  
  return {
    overallHealth: Math.max(0, Math.min(100, Math.round(healthScore))),
    cpu: Math.round(cpuUsage),
    memory: Math.round(memoryUsage),
    disk: Math.round(diskUsage),
    uptime: Math.round(uptimeHours),
    responseTime: Math.round(responseTime)
  };
}

async function getDiskUsage() {
  // This is a simplified version - you might want to use a library
  return new Promise((resolve) => {
    exec('df -h / | tail -1 | awk \'{print $5}\' | sed \'s/%//\'', (error, stdout) => {
      if (error) {
        resolve(0);
      } else {
        resolve(parseInt(stdout.trim()) || 0);
      }
    });
  });
}

async function measureResponseTime() {
  const start = Date.now();
  // Simulate a database query or API call
  await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
  return Date.now() - start;
}

function getHealthStatus(healthScore) {
  if (healthScore >= 90) return 'excellent';
  if (healthScore >= 75) return 'good';
  if (healthScore >= 50) return 'fair';
  if (healthScore >= 25) return 'poor';
  return 'critical';
}

async function getSystemInfo() {
  return {
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    type: os.type(),
    release: os.release(),
    cpus: os.cpus().length,
    totalMemory: formatBytes(os.totalmem()),
    freeMemory: formatBytes(os.freemem()),
    networkInterfaces: os.networkInterfaces(),
    userInfo: os.userInfo(),
    version: process.version,
    pid: process.pid,
    uptime: formatUptime(os.uptime()),
    loadAverage: os.loadavg()
  };
}

async function getSystemMetrics() {
  const cpuUsage = os.loadavg()[0] * 100;
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;
  const diskUsage = await getDiskUsage();
  
  return {
    timestamp: new Date().toISOString(),
    cpu: {
      usage: Math.round(cpuUsage),
      loadAverage: os.loadavg(),
      cores: os.cpus().length
    },
    memory: {
      total: formatBytes(totalMem),
      free: formatBytes(freeMem),
      used: formatBytes(totalMem - freeMem),
      usage: Math.round(memoryUsage)
    },
    disk: {
      usage: Math.round(diskUsage)
    },
    uptime: {
      seconds: os.uptime(),
      formatted: formatUptime(os.uptime())
    },
    process: {
      pid: process.pid,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };
}

// Get detailed CPU metrics
async function getCpuMetrics() {
  const cpus = os.cpus();
  const loadAvg = os.loadavg();
  const cpuUsage = loadAvg[0] * 100; // 1-minute load average
  
  return {
    timestamp: new Date().toISOString(),
    usage: Math.min(100, Math.max(0, Math.round(cpuUsage))),
    cores: cpus.length,
    loadAverage: {
      '1min': Math.round(loadAvg[0] * 100) / 100,
      '5min': Math.round(loadAvg[1] * 100) / 100,
      '15min': Math.round(loadAvg[2] * 100) / 100
    },
    model: cpus[0]?.model || 'Unknown',
    speed: cpus[0]?.speed || 0,
    architecture: os.arch(),
    platform: os.platform()
  };
}

// Get detailed Memory metrics
async function getMemoryMetrics() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memoryUsage = (usedMem / totalMem) * 100;
  
  return {
    timestamp: new Date().toISOString(),
    total: totalMem,
    used: usedMem,
    free: freeMem,
    usage: Math.min(100, Math.max(0, Math.round(memoryUsage))),
    formatted: {
      total: formatBytes(totalMem),
      used: formatBytes(usedMem),
      free: formatBytes(freeMem)
    },
    processMemory: process.memoryUsage()
  };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

module.exports = router;
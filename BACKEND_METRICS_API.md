# Backend System Metrics API

This document outlines the backend API endpoints needed to provide real system metrics for the Admin Dashboard.

## Required Endpoints

### 1. System Metrics Endpoint

**Endpoint:** `GET /api/system/metrics`  
**Description:** Get comprehensive system metrics including CPU, memory, disk, and uptime  
**Access:** Private (Admin only)

**Request:**
```http
GET /api/system/metrics
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "System metrics retrieved successfully",
  "data": {
    "cpu": {
      "usage": 0.25,
      "cores": 8,
      "loadAverage": [1.2, 1.1, 0.9]
    },
    "memory": {
      "total": 17179869184,
      "used": 8589934592,
      "free": 8589934592,
      "usage": 0.5
    },
    "disk": {
      "total": 107374182400,
      "used": 53687091200,
      "free": 53687091200,
      "usage": 0.5
    },
    "uptime": 86400,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Online Users Count Endpoint

**Endpoint:** `GET /api/auth/online-users`  
**Description:** Get count of currently online users  
**Access:** Private (Admin only)

**Request:**
```http
GET /api/auth/online-users
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Online users count retrieved successfully",
  "data": {
    "count": 15,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Backend Implementation Examples

### Node.js with Express

```javascript
const os = require('os');
const fs = require('fs').promises;

// System metrics endpoint
router.get('/system/metrics', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Get CPU usage
    const cpus = os.cpus();
    const cpuUsage = os.loadavg()[0] / cpus.length; // Normalize by CPU cores
    
    // Get memory info
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = usedMem / totalMem;

    // Get disk usage (example for root directory)
    const diskStats = await getDiskUsage('/');
    
    // Get uptime
    const uptime = os.uptime();

    const metrics = {
      cpu: {
        usage: Math.min(1, cpuUsage), // Normalize to 0-1
        cores: cpus.length,
        loadAverage: os.loadavg()
      },
      memory: {
        total: totalMem,
        used: usedMem,
        free: freeMem,
        usage: memoryUsage
      },
      disk: {
        total: diskStats.total,
        used: diskStats.used,
        free: diskStats.free,
        usage: diskStats.usage
      },
      uptime: uptime,
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'System metrics retrieved successfully',
      data: metrics
    });
  } catch (error) {
    console.error('Error getting system metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve system metrics'
    });
  }
});

// Helper function to get disk usage
async function getDiskUsage(path) {
  try {
    const stats = await fs.statfs(path);
    const total = stats.blocks * stats.bsize;
    const free = stats.bavail * stats.bsize;
    const used = total - free;
    
    return {
      total,
      used,
      free,
      usage: used / total
    };
  } catch (error) {
    console.error('Error getting disk usage:', error);
    return {
      total: 0,
      used: 0,
      free: 0,
      usage: 0
    };
  }
}

// Online users count endpoint
router.get('/auth/online-users', authenticate, async (req, res) => {
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
      message: 'Online users count retrieved successfully',
      data: {
        count: onlineUsers,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error getting online users count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve online users count'
    });
  }
});
```

### Python with FastAPI

```python
import psutil
import os
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

router = APIRouter()

@router.get("/system/metrics")
async def get_system_metrics(current_user: User = Depends(get_current_admin_user)):
    try:
        # CPU metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        load_avg = psutil.getloadavg()
        
        # Memory metrics
        memory = psutil.virtual_memory()
        
        # Disk metrics
        disk = psutil.disk_usage('/')
        
        # Uptime
        uptime = time.time() - psutil.boot_time()
        
        metrics = {
            "cpu": {
                "usage": cpu_percent / 100,  # Normalize to 0-1
                "cores": cpu_count,
                "loadAverage": list(load_avg)
            },
            "memory": {
                "total": memory.total,
                "used": memory.used,
                "free": memory.available,
                "usage": memory.percent / 100
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "usage": disk.percent / 100
            },
            "uptime": uptime,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        return {
            "success": True,
            "message": "System metrics retrieved successfully",
            "data": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve system metrics")

@router.get("/auth/online-users")
async def get_online_users(current_user: User = Depends(get_current_admin_user)):
    try:
        # Count online users (last seen within 5 minutes)
        five_minutes_ago = datetime.utcnow() - timedelta(minutes=5)
        online_count = await User.objects.filter(
            is_online=True,
            last_seen_at__gte=five_minutes_ago
        ).count()
        
        return {
            "success": True,
            "message": "Online users count retrieved successfully",
            "data": {
                "count": online_count,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to retrieve online users count")
```

## Required Dependencies

### Node.js
```bash
npm install os-utils
# or
npm install systeminformation
```

### Python
```bash
pip install psutil
```

## Security Considerations

1. **Admin-only access**: Ensure only admin users can access these endpoints
2. **Rate limiting**: Implement rate limiting to prevent abuse
3. **Input validation**: Validate all inputs and sanitize data
4. **Error handling**: Don't expose sensitive system information in error messages
5. **Caching**: Consider caching metrics for a short period to reduce system load

## Monitoring and Logging

1. **Log access**: Log all requests to these endpoints
2. **Monitor performance**: Track response times and error rates
3. **Alerting**: Set up alerts for high resource usage
4. **Metrics storage**: Consider storing historical metrics for trend analysis

## Frontend Integration

The frontend is already set up to use these endpoints. It will:

1. Try to fetch metrics from the backend first
2. Fall back to frontend-only metrics if backend fails
3. Display real-time data with automatic refresh
4. Show formatted values (bytes, percentages, etc.)

## Testing

Test the endpoints with:

```bash
# Test system metrics
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/system/metrics

# Test online users
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3000/api/auth/online-users
```

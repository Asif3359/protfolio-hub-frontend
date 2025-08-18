const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub.vercel.app/api';

export interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usage: number;
  };
  uptime: number;
  timestamp: string;
}

export interface MetricsResponse {
  success: boolean;
  message: string;
  data: SystemMetrics;
}

export const fetchSystemMetrics = async (): Promise<SystemMetrics | null> => {
  try {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/system/metrics`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: MetricsResponse = await response.json();
    
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    return null;
  }
};

// Format bytes to human readable format
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Format uptime to human readable format
export const formatUptime = (seconds: number): string => {
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
};

// Calculate CPU usage percentage
export const calculateCpuUsage = (metrics: SystemMetrics): number => {
  const percentage = metrics.cpu.usage * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
};

// Calculate memory usage percentage
export const calculateMemoryUsage = (metrics: SystemMetrics): number => {
  const percentage = metrics.memory.usage * 100;
  return Math.min(100, Math.max(0, Math.round(percentage)));
};

// Calculate disk usage percentage
export const calculateDiskUsage = (metrics: SystemMetrics): number => {
  return Math.round(metrics.disk.usage * 100);
};

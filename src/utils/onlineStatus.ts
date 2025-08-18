const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://protfolio-hub.vercel.app/api';

interface UpdateStatusResponse {
  success: boolean;
  message: string;
  data?: {
    isOnline: boolean;
    lastSeenAt: string;
  };
}

export class OnlineStatusManager {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;

  constructor(private token: string) {}

  startHeartbeat(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    
    // Send initial heartbeat
    this.updateStatus();
    
    // Set up periodic heartbeat every 5 minutes (300000 ms)
    this.intervalId = setInterval(() => {
      this.updateStatus();
    }, 5 * 60 * 1000);
  }

  stopHeartbeat(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
  }

  private async updateStatus(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data: UpdateStatusResponse = await response.json();
      
      if (!data.success) {
        console.warn('Failed to update online status:', data.message);
      }
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  // Method to manually update status (can be called on user activity)
  async manualUpdate(): Promise<void> {
    await this.updateStatus();
  }
}

// Global instance to manage online status
let onlineStatusManager: OnlineStatusManager | null = null;

export const initializeOnlineStatus = (token: string): void => {
  // Stop existing heartbeat if any
  if (onlineStatusManager) {
    onlineStatusManager.stopHeartbeat();
  }
  
  // Create new manager and start heartbeat
  onlineStatusManager = new OnlineStatusManager(token);
  onlineStatusManager.startHeartbeat();
};

export const stopOnlineStatus = (): void => {
  if (onlineStatusManager) {
    onlineStatusManager.stopHeartbeat();
    onlineStatusManager = null;
  }
};

export const updateOnlineStatus = async (): Promise<void> => {
  if (onlineStatusManager) {
    await onlineStatusManager.manualUpdate();
  }
};

// Handle page visibility changes
export const setupVisibilityListener = (): void => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // Page became visible, update status
      updateOnlineStatus();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Handle beforeunload to stop heartbeat
  const handleBeforeUnload = () => {
    stopOnlineStatus();
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Handle user activity (mouse movement, clicks, etc.)
  const handleUserActivity = () => {
    updateOnlineStatus();
  };

  // Throttle user activity to avoid too many requests
  let activityTimeout: NodeJS.Timeout | null = null;
  const throttledActivityHandler = () => {
    if (activityTimeout) {
      clearTimeout(activityTimeout);
    }
    activityTimeout = setTimeout(handleUserActivity, 30000); // 30 seconds throttle
  };

  document.addEventListener('mousemove', throttledActivityHandler);
  document.addEventListener('click', throttledActivityHandler);
  document.addEventListener('keypress', throttledActivityHandler);
};

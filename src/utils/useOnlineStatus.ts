import { useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { initializeOnlineStatus, stopOnlineStatus, updateOnlineStatus } from './onlineStatus';

export const useOnlineStatus = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Only initialize if user is authenticated
    if (user) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        initializeOnlineStatus(token);
      }
    } else {
      // Stop heartbeat if user is not authenticated
      stopOnlineStatus();
    }

    // Cleanup on unmount
    return () => {
      if (!user) {
        stopOnlineStatus();
      }
    };
  }, [user]);

  // Function to manually update online status
  const updateStatus = async () => {
    await updateOnlineStatus();
  };

  return {
    updateStatus,
    isAuthenticated: !!user,
  };
};

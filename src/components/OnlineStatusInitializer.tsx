'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { initializeOnlineStatus, stopOnlineStatus, setupVisibilityListener } from '@/utils/onlineStatus';

const OnlineStatusInitializer: React.FC = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Set up visibility listener only once when component mounts
    setupVisibilityListener();

    // Initialize online status if user is authenticated
    if (user) {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        initializeOnlineStatus(token);
      }
    }

    // Cleanup function
    return () => {
      if (!user) {
        stopOnlineStatus();
      }
    };
  }, [user]);

  // This component doesn't render anything
  return null;
};

export default OnlineStatusInitializer;

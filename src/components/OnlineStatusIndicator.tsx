'use client';

import React, { useState, useEffect } from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { useAuth } from '@/app/contexts/AuthContext';
import { updateOnlineStatus } from '@/utils/onlineStatus';

const OnlineStatusIndicator: React.FC = () => {
  const { user } = useAuth();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleManualUpdate = async () => {
    if (!user) return;
    
    setIsUpdating(true);
    try {
      await updateOnlineStatus();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to update online status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (user) {
      setLastUpdate(new Date());
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
      <Chip 
        label="Online" 
        color="success" 
        size="small"
        variant="outlined"
      />
      <Typography variant="body2" color="text.secondary">
        Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
      </Typography>
      <Chip 
        label={isUpdating ? "Updating..." : "Update Now"}
        onClick={handleManualUpdate}
        disabled={isUpdating}
        size="small"
        variant="outlined"
      />
    </Box>
  );
};

export default OnlineStatusIndicator; 

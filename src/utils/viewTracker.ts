/**
 * View Tracking Utility
 * 
 * This utility provides device-based view tracking to ensure one view per device per day.
 * It uses a combination of browser fingerprinting and localStorage to prevent duplicate views.
 */

// Device fingerprint utility
export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
  }
  
  // Get device memory safely
  const deviceMemory = 'deviceMemory' in navigator ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory : 'unknown';
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 'unknown',
    deviceMemory || 'unknown',
    canvas.toDataURL(),
  ].join('|');
  
  // Create a simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Track a view for a specific user/portfolio
 * @param userId - The user ID to track views for
 * @param apiEndpoint - The API endpoint to call (optional, defaults to the standard endpoint)
 * @returns Promise<void>
 */
export const trackView = async (
  userId: string, 
  apiEndpoint?: string
): Promise<void> => {
  try {
    // Generate a unique device fingerprint based on browser characteristics
    const deviceId = generateDeviceFingerprint();
    const viewKey = `portfolio_view_${userId}_${deviceId}`;
    
    // Check if this device has already viewed this portfolio today
    let lastView: string | null = null;
    try {
      lastView = localStorage.getItem(viewKey);
    } catch (e) {
      // localStorage might not be available in private browsing mode
      console.log('localStorage not available, proceeding with view tracking');
    }
    
    const today = new Date().toDateString();
    
    if (lastView === today) {
      console.log('View already tracked for this device today');
      return;
    }
    
    // Call the API to increment views
    const endpoint = apiEndpoint || `https://protfolio-hub.vercel.app/api/profile/views/${userId}`;
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      // Store the view timestamp for this device to prevent duplicate views
      try {
        localStorage.setItem(viewKey, today);
      } catch (e) {
        // localStorage might not be available, but view was still tracked
        console.log('Could not save to localStorage, but view was tracked');
      }
      console.log('View tracked successfully for user:', userId);
    } else {
      console.error('Failed to track view:', response.statusText);
    }
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};

/**
 * Check if a view has already been tracked for today
 * @param userId - The user ID to check
 * @returns boolean - true if view was already tracked today
 */
export const hasViewedToday = (userId: string): boolean => {
  try {
    const deviceId = generateDeviceFingerprint();
    const viewKey = `portfolio_view_${userId}_${deviceId}`;
    const lastView = localStorage.getItem(viewKey);
    const today = new Date().toDateString();
    
    return lastView === today;
  } catch (error) {
    console.error('Error checking view status:', error);
    return false;
  }
};

/**
 * Clear view tracking data for a specific user (useful for testing)
 * @param userId - The user ID to clear tracking for
 */
export const clearViewTracking = (userId: string): void => {
  try {
    const deviceId = generateDeviceFingerprint();
    const viewKey = `portfolio_view_${userId}_${deviceId}`;
    localStorage.removeItem(viewKey);
    console.log('View tracking cleared for user:', userId);
  } catch (error) {
    console.error('Error clearing view tracking:', error);
  }
};

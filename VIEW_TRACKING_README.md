# View Tracking System

This document explains how the view tracking system works in the Portfolio Hub application.

## Overview

The view tracking system ensures that each device can only increment the view count once per day for a specific portfolio. This prevents artificial inflation of view counts from repeated visits or page refreshes.

## How It Works

### 1. Device Fingerprinting
The system generates a unique device fingerprint using the following browser characteristics:
- User Agent string
- Browser language
- Screen resolution
- Timezone offset
- Hardware concurrency (CPU cores)
- Device memory (if available)
- Canvas fingerprint

This fingerprint is hashed to create a unique device identifier.

### 2. View Tracking Logic
When a user visits a portfolio page:

1. **Device Check**: The system checks if this device has already viewed this portfolio today
2. **API Call**: If not viewed today, it calls the API to increment the view count
3. **Storage**: It stores a timestamp in localStorage to prevent duplicate views

### 3. API Endpoint
The system calls the following API endpoint:
```
PUT /api/profile/views/:user_id
```

## Implementation

### Usage in Portfolio Page
```typescript
import { trackView } from "@/utils/viewTracker";

// In your component's useEffect
useEffect(() => {
  const fetchPortfolioData = async () => {
    // ... fetch portfolio data
    if (result.success && result.data?.user?.id) {
      trackView(result.data.user.id);
    }
  };
}, []);
```

### Utility Functions

#### `trackView(userId: string, apiEndpoint?: string)`
Tracks a view for a specific user. Optionally accepts a custom API endpoint.

#### `hasViewedToday(userId: string): boolean`
Checks if the current device has already viewed the portfolio today.

#### `clearViewTracking(userId: string): void`
Clears the view tracking data for a specific user (useful for testing).

#### `generateDeviceFingerprint(): string`
Generates a unique device fingerprint (internal use).

## Security Considerations

### Privacy
- The device fingerprint is only used locally to prevent duplicate views
- No personal information is collected or transmitted
- The fingerprint is not stored on the server

### Limitations
- Users in private browsing mode may have view tracking reset when they close the browser
- Users who clear their browser data will be able to increment views again
- Multiple devices from the same user will each count as separate views

## Testing

To test the view tracking system:

1. Visit a portfolio page
2. Check the browser console for "View tracked successfully" message
3. Refresh the page - you should see "View already tracked for this device today"
4. Use `clearViewTracking(userId)` in the console to reset tracking for testing

## API Response

The API returns:
```json
{
  "views": 123
}
```

Where `views` is the updated view count for the profile.

## Error Handling

The system gracefully handles:
- Network errors
- localStorage not being available (private browsing)
- API failures
- Invalid user IDs

All errors are logged to the console but don't break the user experience.

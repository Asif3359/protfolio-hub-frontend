# Online Status Heartbeat System

This document describes the online status heartbeat system implemented in the Portfolio Hub frontend application.

## Overview

The online status system automatically keeps users' online status updated by sending periodic heartbeat requests to the backend API. This ensures that users appear as "online" while they are actively using the application.

## Features

- **Automatic Heartbeat**: Sends status updates every 5 minutes
- **User Activity Detection**: Updates status on user interactions (mouse movement, clicks, keypresses)
- **Page Visibility Handling**: Updates status when page becomes visible
- **Cleanup on Logout**: Stops heartbeat when user logs out
- **Error Handling**: Gracefully handles network errors

## Implementation Details

### Core Files

1. **`src/utils/onlineStatus.ts`** - Main utility for managing online status
2. **`src/components/OnlineStatusInitializer.tsx`** - Component that initializes the system
3. **`src/app/contexts/AuthContext.tsx`** - Updated to integrate online status
4. **`src/utils/useOnlineStatus.ts`** - Custom hook for components

### API Endpoint

The system uses the following backend endpoint:

```http
POST /api/auth/update-status
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Response:**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "isOnline": true,
    "lastSeenAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### How It Works

1. **Initialization**: When a user logs in or the app loads with an existing token, the online status system is initialized
2. **Heartbeat**: Every 5 minutes, a request is sent to update the user's online status
3. **Activity Detection**: User interactions trigger immediate status updates (throttled to 30 seconds)
4. **Page Visibility**: When the page becomes visible (user switches back to the tab), status is updated
5. **Cleanup**: When the user logs out or the page is closed, the heartbeat is stopped

### Usage in Components

To use the online status functionality in a component:

```tsx
import { useOnlineStatus } from '@/utils/useOnlineStatus';

const MyComponent = () => {
  const { updateStatus, isAuthenticated } = useOnlineStatus();
  
  // Manual status update
  const handleActivity = async () => {
    await updateStatus();
  };
  
  return (
    <div>
      {isAuthenticated && <p>User is online</p>}
    </div>
  );
};
```

### Testing

You can test the online status functionality using the `OnlineStatusIndicator` component:

```tsx
import OnlineStatusIndicator from '@/components/OnlineStatusIndicator';

// Add this to any page to see the online status
<OnlineStatusIndicator />
```

## Configuration

### Heartbeat Interval

The heartbeat interval is set to 5 minutes (300,000 ms) in `src/utils/onlineStatus.ts`:

```typescript
this.intervalId = setInterval(() => {
  this.updateStatus();
}, 5 * 60 * 1000); // 5 minutes
```

### Activity Throttling

User activity updates are throttled to 30 seconds to prevent excessive API calls:

```typescript
activityTimeout = setTimeout(handleUserActivity, 30000); // 30 seconds
```

## Error Handling

The system includes comprehensive error handling:

- Network errors are logged but don't stop the heartbeat
- Failed status updates are logged as warnings
- The system continues to function even if individual updates fail

## Browser Compatibility

The system uses standard web APIs:
- `setInterval` for periodic updates
- `addEventListener` for user activity detection
- `document.visibilityState` for page visibility
- `beforeunload` event for cleanup

## Security Considerations

- Only authenticated users can update their online status
- JWT tokens are used for authentication
- Status updates are sent over HTTPS
- No sensitive data is transmitted in status updates

## Monitoring

To monitor the online status system:

1. Check browser console for any error messages
2. Monitor network requests to `/api/auth/update-status`
3. Verify that status updates are being sent every 5 minutes
4. Check that status updates stop when user logs out

## Troubleshooting

### Common Issues

1. **Status not updating**: Check if user is authenticated and token is valid
2. **Too many requests**: Verify activity throttling is working
3. **Heartbeat not starting**: Check if `initializeOnlineStatus` is being called
4. **Heartbeat not stopping**: Verify `stopOnlineStatus` is called on logout

### Debug Mode

To enable debug logging, add this to the browser console:

```javascript
localStorage.setItem('debugOnlineStatus', 'true');
```

This will log all online status activities to the console.

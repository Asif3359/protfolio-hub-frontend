# Backend Portfolio Follow API Endpoints

This document contains the backend API endpoints that need to be added to support the follow functionality in the portfolio page.

## Required Backend Endpoints

### 1. Get User Data by ID (for followers count)

Add this endpoint to your user routes file (e.g., `routes/user.js` or similar):

```javascript
// @route   GET /api/user/:userId
// @desc    Get user data by ID with followers count
// @access  Private
router.get("/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user with followers and following data
    const user = await User.findById(userId)
      .select('name email verified role profilePicture createdAt followers following')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate followers and following counts
    const followersCount = user.followers ? user.followers.length : 0;
    const followingCount = user.following ? user.following.length : 0;

    // Return user data with counts
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        role: user.role,
        profilePicture: user.profilePicture,
        followersCount,
        followingCount,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
```

### 2. Alternative Implementation (Using Virtuals)

If you prefer to use the virtual properties that are already defined in your User schema:

```javascript
// @route   GET /api/user/:userId
// @desc    Get user data by ID with followers count
// @access  Private
router.get("/:userId", authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user with virtuals enabled
    const user = await User.findById(userId)
      .select('name email verified role profilePicture createdAt')
      .lean({ virtuals: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Return user data with virtual counts
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        verified: user.verified,
        role: user.role,
        profilePicture: user.profilePicture,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
```

## Existing Endpoints (Already Provided)

The following endpoints should already exist in your backend based on the code you provided:

### 3. Follow User
```javascript
// @route   POST /api/user/follow/:userId
// @desc    Follow a user
// @access  Private
```

### 4. Unfollow User
```javascript
// @route   DELETE /api/user/unfollow/:userId
// @desc    Unfollow a user
// @access  Private
```

### 5. Check Follow Status
```javascript
// @route   GET /api/user/follow-status/:userId
// @desc    Check if current user is following a specific user
// @access  Private
```

## Testing the Endpoints

You can test the endpoints using curl or Postman:

### Test Get User Data
```bash
curl -X GET \
  https://your-backend-url.com/api/user/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "verified": true,
    "role": "customer",
    "profilePicture": "https://example.com/image.jpg",
    "followersCount": 5,
    "followingCount": 3,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Test Follow User
```bash
curl -X POST \
  https://your-backend-url.com/api/user/follow/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Unfollow User
```bash
curl -X DELETE \
  https://your-backend-url.com/api/user/unfollow/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Test Follow Status
```bash
curl -X GET \
  https://your-backend-url.com/api/user/follow-status/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Frontend Integration

The frontend is now set up to:

1. **Display Follow Button**: Shows "Follow" or "Following" based on current status
2. **Show Followers Count**: Displays the number of followers in the hero section
3. **Handle Follow/Unfollow**: Toggles follow status with loading states
4. **Redirect to Login**: If user is not authenticated, redirects to login page
5. **Real-time Updates**: Updates the UI immediately after follow/unfollow actions

## Features Implemented

### Follow Button
- **Visual States**: 
  - "Follow" button (blue background) when not following
  - "Following" button (outlined) when already following
- **Loading State**: Shows spinner during API calls
- **Hover Effects**: Smooth animations and visual feedback

### Followers Count Display
- **Location**: Displayed in the hero section next to social links
- **Styling**: Semi-transparent background with people icon
- **Real-time Updates**: Updates immediately after follow/unfollow

### Error Handling
- **Authentication**: Redirects to login if not authenticated
- **API Errors**: Graceful error handling with console logging
- **Loading States**: Prevents multiple clicks during API calls

## Security Considerations

- All endpoints require authentication
- Users cannot follow themselves (handled in backend)
- Proper error handling for invalid user IDs
- Rate limiting should be implemented for follow/unfollow actions

## Performance Considerations

- Uses lean queries for better performance
- Virtual properties for efficient count calculations
- Minimal data transfer (only necessary fields selected)
- Caching can be implemented for frequently accessed user data

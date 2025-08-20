# Backend User API Endpoint for Followers Count

This document contains the backend API endpoint code that needs to be added to your backend to support the followers count functionality in the client dashboard.

## Required Backend Endpoint

Add this endpoint to your user routes file (e.g., `routes/user.js` or similar):

```javascript
// @route   GET /api/user/me
// @desc    Get current user data with followers count
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get current user with followers and following data
    const user = await User.findById(currentUserId)
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

## Alternative Implementation (Using Virtuals)

If you prefer to use the virtual properties that are already defined in your User schema, you can use this alternative implementation:

```javascript
// @route   GET /api/user/me
// @desc    Get current user data with followers count
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Get current user with virtuals enabled
    const user = await User.findById(currentUserId)
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

## User Schema Requirements

Make sure your User schema has the following fields and methods (which you already have):

```javascript
const UserSchema = new mongoose.Schema(
  {
    // ... existing fields ...
    
    // Follow/Followers functionality
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for followers count
UserSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
UserSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});
```

## Testing the Endpoint

You can test the endpoint using curl or Postman:

```bash
curl -X GET \
  https://your-backend-url.com/api/user/me \
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

## Integration with Frontend

The frontend is already set up to call this endpoint and display the followers count in the dashboard. The endpoint will be called automatically when the dashboard loads, and the followers count will be displayed in a new card alongside the other statistics.

## Error Handling

The endpoint includes proper error handling for:
- User not found (404)
- Server errors (500)
- Authentication errors (handled by the `authenticate` middleware)

## Security Considerations

- The endpoint requires authentication
- Only returns data for the authenticated user
- No sensitive information is exposed
- Follows the same security patterns as your existing endpoints

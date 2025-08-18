# User Online Status API Documentation

## Overview
This document provides comprehensive API documentation for the User Online Status system implemented in the Portfolio Hub application. The system tracks user login status, activity, and provides real-time status information.

## Base URL
```
http://localhost:3000/api/auth
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## API Endpoints

### 1. Get Current User's Status
**Endpoint:** `GET /user-status/me`  
**Description:** Get the current authenticated user's online status and activity information  
**Access:** Private (Authenticated users)

**Request:**
```http
GET /api/auth/user-status/me
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "isOnline": true,
    "status": "online",
    "statusText": "Online",
    "lastSeenAt": "2024-01-15T10:30:00.000Z",
    "lastLoginAt": "2024-01-15T09:00:00.000Z",
    "minutesSinceLastSeen": 0
  }
}
```

**Status Values:**
- `online`: User active within last 5 minutes
- `away`: User active within last 15 minutes
- `offline`: User inactive for more than 15 minutes

**Error Response:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 2. Get Specific User's Status
**Endpoint:** `GET /user-status/:userId`  
**Description:** Get online status and activity information for a specific user  
**Access:** Private (Authenticated users)

**Request:**
```http
GET /api/auth/user-status/507f1f77bcf86cd799439011
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "isOnline": true,
    "status": "online",
    "statusText": "Online",
    "lastSeenAt": "2024-01-15T10:30:00.000Z",
    "lastLoginAt": "2024-01-15T09:00:00.000Z",
    "minutesSinceLastSeen": 0
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 3. Update User Status (Heartbeat)
**Endpoint:** `POST /update-status`  
**Description:** Update user's last seen timestamp (heartbeat mechanism)  
**Access:** Private (Authenticated users)

**Request:**
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

**Error Response:**
```json
{
  "success": false,
  "message": "User not found"
}
```

---

### 4. Get Online Users (Admin Only)
**Endpoint:** `GET /online-users`  
**Description:** Get list of all currently online users  
**Access:** Private (Admin users only)

**Request:**
```http
GET /api/auth/online-users
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "isOnline": true,
      "status": "online",
      "statusText": "Online",
      "lastSeenAt": "2024-01-15T10:30:00.000Z",
      "lastLoginAt": "2024-01-15T09:00:00.000Z",
      "minutesSinceLastSeen": 0
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "isOnline": true,
      "status": "away",
      "statusText": "Away",
      "lastSeenAt": "2024-01-15T10:25:00.000Z",
      "lastLoginAt": "2024-01-15T08:30:00.000Z",
      "minutesSinceLastSeen": 5
    }
  ]
}
```

**Error Response (Non-Admin):**
```json
{
  "success": false,
  "message": "Access denied. Admin only."
}
```

---

### 5. Get All Users Status (Admin Only)
**Endpoint:** `GET /all-users-status`  
**Description:** Get status information for all users in the system  
**Access:** Private (Admin users only)

**Request:**
```http
GET /api/auth/all-users-status
Authorization: Bearer ADMIN_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "isOnline": true,
      "status": "online",
      "statusText": "Online",
      "lastSeenAt": "2024-01-15T10:30:00.000Z",
      "lastLoginAt": "2024-01-15T09:00:00.000Z",
      "minutesSinceLastSeen": 0
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "isOnline": false,
      "status": "offline",
      "statusText": "Offline",
      "lastSeenAt": "2024-01-15T09:45:00.000Z",
      "lastLoginAt": "2024-01-15T08:00:00.000Z",
      "minutesSinceLastSeen": 45
    }
  ]
}
```

**Error Response (Non-Admin):**
```json
{
  "success": false,
  "message": "Access denied. Admin only."
}
```

---

### 6. Enhanced Login
**Endpoint:** `POST /login`  
**Description:** User login with automatic online status setting  
**Access:** Public

**Request:**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "customer",
    "isOnline": true,
    "lastLoginAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 7. Enhanced Logout
**Endpoint:** `POST /logout`  
**Description:** User logout with automatic offline status setting  
**Access:** Private (Authenticated users)

**Request:**
```http
POST /api/auth/logout
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Server error during logout"
}
```

---

## Status Indicators

### Status Types
| Status | Description | Color | Time Threshold |
|--------|-------------|-------|----------------|
| `online` | User is actively using the application | Green | < 5 minutes |
| `away` | User is inactive but recently seen | Yellow | 5-15 minutes |
| `offline` | User is not active | Gray | > 15 minutes |

### Status Display
```javascript
// Frontend status indicator
const statusColors = {
  'online': '#28a745',   // Green
  'away': '#ffc107',     // Yellow
  'offline': '#6c757d'   // Gray
};

const statusIndicator = `<span style="color: ${statusColors[status]}">●</span>`;
```

---

## Usage Examples

### JavaScript/Fetch Examples

#### Get Current User Status
```javascript
async function getMyStatus() {
  const response = await fetch('/api/auth/user-status/me', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.data;
}
```

#### Update Status (Heartbeat)
```javascript
async function updateStatus() {
  const response = await fetch('/api/auth/update-status', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.success;
}
```

#### Get Online Users (Admin)
```javascript
async function getOnlineUsers() {
  const response = await fetch('/api/auth/online-users', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  
  const data = await response.json();
  return data.data;
}
```

### cURL Examples

#### Get Current User Status
```bash
curl -X GET \
  http://localhost:3000/api/auth/user-status/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Update Status
```bash
curl -X POST \
  http://localhost:3000/api/auth/update-status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

#### Get Online Users (Admin)
```bash
curl -X GET \
  http://localhost:3000/api/auth/online-users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Error Codes

| HTTP Status | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "User not found" | User ID is invalid or user doesn't exist |
| 401 | "No token provided" | Missing or invalid JWT token |
| 403 | "Access denied. Admin only." | User doesn't have admin privileges |
| 500 | "Server error" | Internal server error |

---

## Rate Limiting
- Status update endpoint: 1 request per 10 seconds per user
- Status retrieval endpoints: 10 requests per minute per user
- Admin endpoints: 5 requests per minute per admin

---

## WebSocket Support (Future)
Real-time status updates via WebSocket will be available in future versions:
```javascript
// Future WebSocket implementation
const ws = new WebSocket('ws://localhost:3000/ws/status');
ws.onmessage = (event) => {
  const statusUpdate = JSON.parse(event.data);
  updateUserStatus(statusUpdate);
};
```

---

## Notes
- All timestamps are in ISO 8601 format (UTC)
- Status updates are automatic on login/logout
- Inactive users are automatically marked offline after 15 minutes
- Admin endpoints require admin role in user profile
- JWT tokens expire based on configuration (default: 1 hour)

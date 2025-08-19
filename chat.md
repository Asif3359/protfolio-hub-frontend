# Chat API Documentation

## Overview
The chat system provides real-time messaging capabilities using WebSocket for instant communication and REST API for chat management. Users can send direct messages and create group chats.

## Authentication
All endpoints require authentication using JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

For WebSocket connections, pass the token in the auth object:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

---

## REST API Endpoints

### 1. Get All Chats
**GET** `/api/chat`

Get all chats for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "chat_id",
      "participants": [
        {
          "_id": "user_id",
          "name": "John Doe",
          "email": "john@example.com",
          "isOnline": true,
          "lastSeenAt": "2024-01-01T12:00:00.000Z"
        }
      ],
      "messages": [
        {
          "_id": "message_id",
          "sender": {
            "_id": "user_id",
            "name": "John Doe",
            "email": "john@example.com"
          },
          "content": "Hello!",
          "messageType": "text",
          "read": false,
          "readAt": null,
          "timestamp": "2024-01-01T12:00:00.000Z"
        }
      ],
      "lastMessage": "2024-01-01T12:00:00.000Z",
      "isGroupChat": false,
      "groupName": null,
      "groupAdmin": null,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

### 2. Get Specific Chat
**GET** `/api/chat/:chatId`

Get a specific chat by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "chat_id",
    "participants": [...],
    "messages": [...],
    "lastMessage": "2024-01-01T12:00:00.000Z",
    "isGroupChat": false,
    "groupName": null,
    "groupAdmin": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 3. Create Direct Chat
**POST** `/api/chat/direct`

Create a new direct message chat with another user.

**Request Body:**
```json
{
  "participantId": "user_id_to_chat_with"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_chat_id",
    "participants": [...],
    "messages": [],
    "lastMessage": "2024-01-01T12:00:00.000Z",
    "isGroupChat": false,
    "groupName": null,
    "groupAdmin": null,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 4. Create Group Chat
**POST** `/api/chat/group`

Create a new group chat.

**Request Body:**
```json
{
  "name": "Group Name",
  "participants": ["user_id_1", "user_id_2", "user_id_3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_group_chat_id",
    "participants": [...],
    "messages": [],
    "lastMessage": "2024-01-01T12:00:00.000Z",
    "isGroupChat": true,
    "groupName": "Group Name",
    "groupAdmin": "creator_user_id",
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 5. Mark Messages as Read
**PUT** `/api/chat/:chatId/read`

Mark all unread messages in a chat as read.

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

### 6. Get Unread Message Count
**GET** `/api/chat/unread/count`

Get the total number of unread messages and breakdown by chat.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUnread": 5,
    "unreadByChat": {
      "chat_id_1": 2,
      "chat_id_2": 3
    }
  }
}
```

### 7. Delete Chat
**DELETE** `/api/chat/:chatId`

Delete a chat (only group admin can delete group chats).

**Response:**
```json
{
  "success": true,
  "message": "Chat deleted successfully"
}
```

---

## WebSocket Events

### Connection
Connect to WebSocket server with authentication:
```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Emitted Events (Client → Server)

#### 1. Send Message
**Event:** `send_message`

**Data:**
```json
{
  "chatId": "chat_id",
  "content": "Hello, how are you?",
  "messageType": "text" // optional, default: "text"
}
```

#### 2. Mark Messages as Read
**Event:** `mark_as_read`

**Data:**
```json
{
  "chatId": "chat_id"
}
```

#### 3. Typing Indicator Start
**Event:** `typing_start`

**Data:**
```json
{
  "chatId": "chat_id"
}
```

#### 4. Typing Indicator Stop
**Event:** `typing_stop`

**Data:**
```json
{
  "chatId": "chat_id"
}
```

### Received Events (Server → Client)

#### 1. New Message
**Event:** `new_message`

**Data:**
```json
{
  "chatId": "chat_id",
  "message": {
    "_id": "message_id",
    "sender": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "content": "Hello!",
    "messageType": "text",
    "read": false,
    "readAt": null,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

#### 2. Message Sent Confirmation
**Event:** `message_sent`

**Data:**
```json
{
  "chatId": "chat_id",
  "message": {
    "_id": "message_id",
    "sender": {...},
    "content": "Hello!",
    "messageType": "text",
    "read": false,
    "readAt": null,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

#### 3. Messages Read Notification
**Event:** `messages_read`

**Data:**
```json
{
  "chatId": "chat_id",
  "readBy": "user_id",
  "readAt": "2024-01-01T12:00:00.000Z"
}
```

#### 4. User Typing Indicator
**Event:** `user_typing`

**Data:**
```json
{
  "chatId": "chat_id",
  "userId": "user_id",
  "userName": "John Doe"
}
```

#### 5. User Stopped Typing
**Event:** `user_stopped_typing`

**Data:**
```json
{
  "chatId": "chat_id",
  "userId": "user_id"
}
```

#### 6. User Status Change
**Event:** `user_status_change`

**Data:**
```json
{
  "userId": "user_id",
  "isOnline": true,
  "lastSeenAt": "2024-01-01T12:00:00.000Z"
}
```

#### 7. Error
**Event:** `error`

**Data:**
```json
{
  "message": "Error description"
}
```

---

## Error Responses

### HTTP Errors
```json
{
  "success": false,
  "message": "Error description"
}
```

### WebSocket Errors
```json
{
  "message": "Error description"
}
```

---

## Usage Examples

### JavaScript Client Example
```javascript
// Connect to WebSocket
const socket = io('http://localhost:3000', {
  auth: {
    token: localStorage.getItem('jwt-token')
  }
});

// Listen for new messages
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  // Update UI with new message
});

// Listen for user status changes
socket.on('user_status_change', (data) => {
  console.log('User status changed:', data);
  // Update user online status in UI
});

// Send a message
function sendMessage(chatId, content) {
  socket.emit('send_message', {
    chatId: chatId,
    content: content
  });
}

// Mark messages as read
function markAsRead(chatId) {
  socket.emit('mark_as_read', {
    chatId: chatId
  });
}

// Show typing indicator
function startTyping(chatId) {
  socket.emit('typing_start', {
    chatId: chatId
  });
}

function stopTyping(chatId) {
  socket.emit('typing_stop', {
    chatId: chatId
  });
}
```

### Fetch API Example
```javascript
// Get all chats
async function getChats() {
  const response = await fetch('/api/chat', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    }
  });
  const data = await response.json();
  return data.data;
}

// Create direct chat
async function createDirectChat(participantId) {
  const response = await fetch('/api/chat/direct', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    },
    body: JSON.stringify({
      participantId: participantId
    })
  });
  const data = await response.json();
  return data.data;
}

// Create group chat
async function createGroupChat(name, participants) {
  const response = await fetch('/api/chat/group', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
    },
    body: JSON.stringify({
      name: name,
      participants: participants
    })
  });
  const data = await response.json();
  return data.data;
}
```

---

## Features

### ✅ Implemented Features
- Real-time messaging using WebSocket
- Direct messages between users
- Group chat functionality
- Message read status tracking
- Typing indicators
- User online/offline status
- Message persistence in database
- Authentication and authorization
- Unread message counting
- Chat management (create, delete)

### 🔄 Real-time Features
- Instant message delivery
- Live typing indicators
- Real-time user status updates
- Message read receipts
- Online/offline status synchronization

### 📱 Message Types
- Text messages (default)
- Image messages (structure ready)
- File messages (structure ready)

### 🔒 Security Features
- JWT authentication for both HTTP and WebSocket
- User authorization for chat access
- Input validation and sanitization
- Rate limiting ready (can be added)

---

## Database Schema

### Chat Collection
```javascript
{
  _id: ObjectId,
  participants: [ObjectId], // User IDs
  messages: [MessageSchema],
  lastMessage: Date,
  isGroupChat: Boolean,
  groupName: String, // Only for group chats
  groupAdmin: ObjectId, // Only for group chats
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  _id: ObjectId,
  sender: ObjectId, // User ID
  content: String,
  messageType: String, // 'text', 'image', 'file'
  read: Boolean,
  readAt: Date,
  timestamp: Date
}
```

---

## Environment Variables

Make sure to set these environment variables:
```env
JWT_SECRET=your-jwt-secret-key
CLIENT_URL=http://localhost:3000 # For CORS
```

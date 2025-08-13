# Authentication System Setup

This document explains the authentication system implemented in the Portfolio Hub frontend.

## Overview

The authentication system includes:
- User registration with email verification
- User login with remember me functionality
- Password reset functionality
- Role-based access control (Admin/Customer)
- Protected routes
- JWT token management

## File Structure

```
src/app/
├── contexts/
│   └── AuthContext.tsx          # Authentication context and provider
├── components/
│   ├── ProtectedRoute.tsx       # Route protection component
│   └── HomeContent.tsx          # Home page content
├── auth/
│   ├── login/
│   │   ├── page.tsx            # Login page (server component)
│   │   └── LoginForm.tsx       # Login form (client component)
│   ├── signup/
│   │   ├── page.tsx            # Signup page (server component)
│   │   └── SignupForm.tsx      # Signup form (client component)
│   ├── logout/
│   │   └── page.tsx            # Logout page
│   ├── forgot-password/
│   │   ├── page.tsx            # Forgot password page
│   │   └── ForgotPasswordForm.tsx
│   └── reset-password/
│       ├── page.tsx            # Reset password page
│       └── ResetPasswordForm.tsx
├── Admin-Dashboard/
│   ├── layout.tsx              # Protected admin layout
│   ├── AdminDashboardLayout.tsx
│   └── page.tsx                # Admin dashboard
├── Client-Dashboard/
│   ├── layout.tsx              # Protected client layout
│   ├── ClientDashboardLayout.tsx
│   └── page.tsx                # Client dashboard
└── unauthorized/
    └── page.tsx                # 403 unauthorized page
```

## Features

### 1. Authentication Context (AuthContext.tsx)
- Manages authentication state
- Provides login, logout, signup functions
- Handles token storage (localStorage/sessionStorage)
- Email verification support
- Password reset functionality

### 2. Protected Routes (ProtectedRoute.tsx)
- Redirects unauthenticated users to login
- Supports role-based access control
- Shows loading state during authentication check

### 3. User Registration
- Email verification required
- Role selection (Admin/Customer)
- Password confirmation
- Form validation

### 4. User Login
- Email and password authentication
- Remember me functionality
- Email verification check
- Resend verification email option

### 5. Password Reset
- Forgot password with email code
- Reset password with code verification
- Secure password reset flow

### 6. Role-Based Access
- Admin dashboard (admin role required)
- Client dashboard (customer role required)
- Unauthorized page for invalid access

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Backend Integration

The frontend expects the following API endpoints from your Express.js backend:

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/resend-verification` - Resend verification email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with code

## Usage

### 1. Using the Auth Context
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, login, logout } = useAuth();
  
  // Use authentication functions
}
```

### 2. Protecting Routes
```tsx
import { ProtectedRoute } from '../components/ProtectedRoute';

function MyPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <AdminContent />
    </ProtectedRoute>
  );
}
```

### 3. Checking Authentication Status
```tsx
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <LoginPrompt />;
```

## Security Features

1. **JWT Token Management**: Tokens stored in localStorage/sessionStorage
2. **Role-Based Access**: Different dashboards for different user roles
3. **Email Verification**: Required before login
4. **Password Reset**: Secure code-based reset
5. **Protected Routes**: Automatic redirection for unauthorized access
6. **Remember Me**: Optional persistent login

## Styling

The authentication system uses Tailwind CSS for styling and includes:
- Responsive design
- Loading states
- Error/success messages
- Modern UI components
- Consistent color scheme

## Next Steps

1. Set up your backend API endpoints
2. Configure environment variables
3. Test the authentication flow
4. Customize styling as needed
5. Add additional security features if required

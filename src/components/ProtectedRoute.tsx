'use client';

import { useAuth } from '../app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallback 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  // TODO: if user is admin then admin can redirect any page .
  // Admin users have universal access to all pages

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && requiredRole && user.role !== requiredRole) {
      // Allow admin users to access any page
      if (user.role === 'admin') {
        return; // Admin can access any page, no redirect needed
      }
      router.push('/unauthorized');
    }
  }, [user, loading, requiredRole, router]);

  if (loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  if (requiredRole && user.role !== requiredRole) {
    // Allow admin users to access any page
    if (user.role === 'admin') {
      return <>{children}</>; // Admin can access any page
    }
    return null; // Will redirect to unauthorized
  }

  return <>{children}</>;
};

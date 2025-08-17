'use client';

import { useEffect } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard = ({ children, redirectTo = '/' }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && user.verified) {
      // Only redirect if user is logged in AND verified
      // Redirect to appropriate dashboard based on role
      if (user.role === 'admin') {
        router.push('/Admin-Dashboard');
      } else if (user.role === 'customer') {
        router.push('/Client-Dashboard');
      } else {
        router.push(redirectTo); // Fallback to default redirect
      }
    }
  }, [user, loading, router, redirectTo]);

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in and verified, don't render the auth pages
  if (user && user.verified) {
    return null;
  }

  // If user is not logged in, render the auth pages
  return <>{children}</>;
};

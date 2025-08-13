'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationCountdown, setVerificationCountdown] = useState(0);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  

  const { signup } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Verification email sent successfully! Please check your inbox.');
        setShowResendButton(false);
        setVerifying(true);
        setVerificationCountdown(180); // Restart 3-minute countdown
        
        // Restart polling
        const pollInterval = setInterval(async () => {
          try {
            const response = await fetch('http://localhost:3000/api/auth/check-verification', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email: formData.email }),
            });
            
            const data = await response.json();
            
            if (data.verified) {
              clearInterval(pollInterval);
              setVerifying(false);
              setVerificationCountdown(0);
              if (data.role === 'admin') {
                router.push('/Admin-Dashboard');
              } else {
                router.push('/Client-Dashboard');
              }
            }
          } catch (err) {
            console.error('Error checking verification status:', err);
          }
        }, 10000);
        
        // Restart countdown
        const countdownInterval = setInterval(() => {
          setVerificationCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              clearInterval(pollInterval);
              setVerifying(false);
              setShowResendButton(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.message || 'Failed to resend verification email');
      }
    } catch (err) {
      setError('An unexpected error occurred while resending verification email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const result = await signup(formData.name, formData.email, formData.password, formData.role);
      
      if (result.success) {
        // Check if user is verified
        if (result.data?.verified) {
          // User is verified, redirect to appropriate dashboard
          if (result.data.role === 'admin') {
            router.push('/Admin-Dashboard');
          } else {
            router.push('/Client-Dashboard');
          }
        } else {
          // User needs email verification
          setSuccess('Account created successfully! Please check your email to verify your account.');
          setVerifying(true);
          setVerificationCountdown(180); // 3 minutes countdown
          
          // Start polling for verification status
          const pollInterval = setInterval(async () => {
            try {
              // You'll need to implement this API endpoint to check verification status
              const response = await fetch('http://localhost:3000/api/auth/check-verification', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email }),
              });
              
              const data = await response.json();
              
              if (data.verified) {
                clearInterval(pollInterval);
                setVerifying(false);
                setVerificationCountdown(0);
                // Redirect based on role
                if (data.role === 'admin') {
                  router.push('/Admin-Dashboard');
                } else {
                  router.push('/Client-Dashboard');
                }
              }
            } catch (err) {
              console.error('Error checking verification status:', err);
            }
          }, 10000); // Check every 10 seconds
          
          // Countdown timer
          const countdownInterval = setInterval(() => {
            setVerificationCountdown(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                clearInterval(pollInterval);
                setVerifying(false);
                setShowResendButton(true); // Show resend button when countdown ends
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      } else {
        setError(result.message || 'Signup failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="role" className="sr-only">
                Role
              </label>
              <select
                id="role"
                name="role"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="text-sm text-green-700">{success}</div>
              {verifying && (
                <div className="mt-2 text-sm text-blue-600">
                  <div>Waiting for email verification...</div>
                  <div className="mt-1">
                    Time remaining: {Math.floor(verificationCountdown / 60)}:{(verificationCountdown % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Checking verification status every 10 seconds...
                  </div>
                </div>
              )}
              {showResendButton && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resendLoading}
                    className="w-full sm:w-1/2 mx-auto flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                  <p className="mt-2 text-xs text-gray-500 text-center">
                    Didn&apos;t receive the email? Click the button above to resend.
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

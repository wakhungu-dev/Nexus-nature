'use client';

import { signIn, getProviders, ClientSafeProvider, LiteralUnion } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BuiltInProviderType } from 'next-auth/providers/index';

// Define proper types
type ProvidersType = Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider> | null;

export default function SignInPage() {
  const [providers, setProviders] = useState<ProvidersType>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await getProviders();
        setProviders(res);
      } catch (error) {
        console.error('Error fetching providers:', error);
        setError('Failed to load authentication providers');
      }
    };
    
    fetchProviders();
  }, []);

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred during sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (providerId: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      await signIn(providerId, { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error('Google sign in error:', error);
      setError('Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="hero-gradient min-h-screen flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="bg-card p-8 rounded-3xl shadow-2xl max-w-md w-full relative z-10">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 animate-pulse-nature">🌿</div>
          <h2 className="text-gradient text-3xl font-bold mb-2">
            Welcome Back
          </h2>
          <p className="text-gradient-alt text-sm">
            Continue your nature journey
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100/80 backdrop-blur-sm border border-red-300 rounded-xl">
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* OAuth Providers */}
        {providers && Object.values(providers).map((provider) => {
          // Skip credentials provider for OAuth section
          if (provider.id === 'credentials') return null;
          
          return (
            <button
              key={provider.name}
              onClick={() => handleGoogleSignIn(provider.id)}
              disabled={isLoading}
              className="btn-nature w-full mb-6 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                `Continue with ${provider.name}`
              )}
            </button>
          );
        })}

        {/* Show fallback if no OAuth providers */}
        {!providers && (
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            disabled={isLoading}
            className="btn-nature w-full mb-6 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            </svg>
            Continue with Google
          </button>
        )}

        {/* Divider - Only show if we have credentials provider or for demo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-4 text-gray-500">or continue with email</span>
          </div>
        </div>

        {/* Email Form - This will work with Google OAuth for now */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div>
            <label className="text-gradient-nature font-medium mb-2 block">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-glass border border-white/20 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500/50 backdrop-blur-sm transition-all duration-200"
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="text-gradient-nature font-medium mb-2 block">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-glass border border-white/20 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500/50 backdrop-blur-sm transition-all duration-200"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <div className="bg-yellow-100/80 backdrop-blur-sm border border-yellow-300 rounded-xl p-3">
            <p className="text-yellow-700 text-sm">
              💡 <strong>Note:</strong> Email/password sign-in requires credentials provider setup. Use Google sign-in above for now.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError('Credentials provider not configured. Please use Google sign-in.')}
            className="btn-nature-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign In with Email (Coming Soon)
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-gradient-nature font-medium hover:underline">
              Sign up here
            </Link>
          </p>
          <Link href="/" className="text-sm text-gradient-alt hover:underline block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

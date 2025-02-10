import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useQuizStore } from '../store/quizStore';
import { LogIn, X } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setLoggedIn = useQuizStore((state) => state.setLoggedIn);
  const setShowAuth = useQuizStore((state) => state.setShowAuth);

  const handleAuthCallback = useCallback(async () => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (session) {
          setLoggedIn(true);
          setShowAuth(false);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    }
  }, [setLoggedIn, setShowAuth]);

  useEffect(() => {
    handleAuthCallback();
  }, [handleAuthCallback]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setLoading(true);
      const redirectTo = window.location.hostname === 'localhost'
        ? `${window.location.origin}/auth/callback`
        : `https://bamquiz.com/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }

      if (data) {
        setLoggedIn(true);
        setShowAuth(false);
      }
    } catch (error) {
      const message = error?.message || 'An error occurred during Google sign in';
      console.error('Google sign in error:', message);
      alert(message);
    } finally {
      setLoading(false);
    }
  }, [setLoggedIn, setShowAuth]);

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!supabase.auth) {
        throw new Error('Authentication service not available');
      }

      if (!email || !password) {
        throw new Error('Please provide both email and password');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.hostname === 'localhost'
            ? `${window.location.origin}`
            : 'https://bamquiz.com',
        },
      });

      if (error) throw error;

      if (data?.user) {
        alert('Successfully signed up! You can now sign in with your credentials.');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      alert(error?.message || 'An error occurred during sign up');
    } finally {
      setLoading(false);
    }
  }, [email, password]);

  const handleSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!supabase.auth) {
        throw new Error('Authentication service not available');
      }

      if (!email || !password) {
        throw new Error('Please provide both email and password');
      }

      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setLoggedIn(true);
      setShowAuth(false);
    } catch (error) {
      alert(error?.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  }, [email, password, setLoggedIn, setShowAuth]);

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <LogIn className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold">Join Bam Quiz!</h2>
        </div>
        <button
          onClick={() => setShowAuth(false)}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Why Join?</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center">
            <span className="mr-2">🏆</span>
            Compete with friends and track your progress
          </li>
          <li className="flex items-center">
            <span className="mr-2">🌟</span>
            Unlock unlimited questions and topics
          </li>
          <li className="flex items-center">
            <span className="mr-2">🎯</span>
            Share your knowledge and challenge others
          </li>
        </ul>
      </div>
      <div className="space-y-4 mb-6">
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={email}
            required
            minLength={3}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            value={password}
            required
            minLength={6}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign In
          </button>
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="flex-1 bg-gray-50 text-gray-900 py-2 px-4 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default Auth;

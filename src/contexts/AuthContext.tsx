/**
 * Authentication context for Supabase auth
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      // Supabase not configured, skip auth check
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((error) => {
      console.error('Failed to get session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, { 
        userId: session?.user?.id, 
        email: session?.user?.email 
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      console.log('🔐 Attempting signup for:', email);
      
      // Get the correct redirect URL (account for base path if any)
      const basePath = import.meta.env.BASE_URL || '/';
      const redirectUrl = `${window.location.origin}${basePath}auth/callback`;
      console.log('📍 Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          },
          emailRedirectTo: redirectUrl,
        },
      });

      console.log('Signup response:', { 
        user: data?.user?.id, 
        session: !!data?.session,
        error: error?.message 
      });

      // Supabase may not return a session if email confirmation is required
      if (data.user && data.session) {
        // User is immediately signed in (email confirmation disabled)
        setUser(data.user);
        setSession(data.session);
        console.log('✅ User signed up and logged in');
      } else if (data.user && !data.session) {
        // User created but needs email confirmation
        console.log('⚠️ User created but email confirmation required');
        // Don't set user/session yet - they need to confirm email first
      }

      return { error };
    } catch (err: any) {
      console.error('Signup error:', err);
      return { error: err as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user && !error) {
      setUser(data.user);
      setSession(data.session);
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


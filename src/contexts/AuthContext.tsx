import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, checkSupabaseConfig } from '../supabase';
import { User } from '@supabase/supabase-js';
import { createAuthSessionGuard } from './authSessionGuard';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signUp: (email: string, pass: string, metadata?: any) => Promise<any>;
  signInWithOtp: (email: string, metadata?: any) => Promise<any>;
  verifyOtp: (email: string, token: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInAnonymously: () => Promise<any>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!checkSupabaseConfig()) {
      setLoading(false);
      return;
    }

    let isActive = true;
    const sessionGuard = createAuthSessionGuard();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!sessionGuard.recordAuthEvent(event)) return;
      if (!isActive) return;

      setUser(session?.user ?? null);
      setLoading(false);
    });

    const loadInitialSession = async () => {
      const requestVersion = sessionGuard.captureVersion();

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        // A newer auth event (for example, SIGNED_IN) owns the state. Never let
        // this older request overwrite it with a stale session.
        if (!isActive || !sessionGuard.canApplyInitialSession(requestVersion)) return;

        if (error) {
          console.error('Supabase session error:', error);
        }

        setUser(session?.user ?? null);
      } catch (err) {
        if (isActive && sessionGuard.canApplyInitialSession(requestVersion)) {
          console.error('Supabase session error:', err);
        }
      } finally {
        if (isActive && sessionGuard.canApplyInitialSession(requestVersion)) {
          setLoading(false);
        }
      }
    };

    void loadInitialSession();

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (!checkSupabaseConfig()) return;
    await supabase.auth.signOut();
  };

  const value = {
    user,
    loading,
    signIn: async (email: string, pass: string) => {
      if (!checkSupabaseConfig()) {
        throw new Error('Supabase is not configured. Please set the environment variables.');
      }
      return supabase.auth.signInWithPassword({ email, password: pass });
    },
    signUp: async (email: string, pass: string, metadata?: any) => {
      if (!checkSupabaseConfig()) {
        throw new Error('Supabase is not configured. Please set the environment variables.');
      }
      return supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: metadata
        }
      });
    },
    signInWithOtp: async (email: string, metadata?: any) => {
      if (!checkSupabaseConfig()) {
        throw new Error('Supabase is not configured. Please set the environment variables.');
      }
      return supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          data: metadata,
          // Setting this to false forces Supabase to send a 6-digit OTP code
          // instead of a magic link
          shouldCreateUser: true,
          emailRedirectTo: undefined,
        }
      });
    },
    verifyOtp: async (email: string, token: string) => {
      if (!checkSupabaseConfig()) {
        throw new Error('Supabase is not configured. Please set the environment variables.');
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanToken = token.trim();

      // Try 'email' type first
      let result = await supabase.auth.verifyOtp({ email: cleanEmail, token: cleanToken, type: 'email' });

      // If failed with invalid token, try 'magiclink'
      if (result.error && result.error.message.includes('expired or is invalid')) {
        result = await supabase.auth.verifyOtp({ email: cleanEmail, token: cleanToken, type: 'magiclink' });
      }

      // If still failed, try 'signup'
      if (result.error && result.error.message.includes('expired or is invalid')) {
        result = await supabase.auth.verifyOtp({ email: cleanEmail, token: cleanToken, type: 'signup' });
      }

      return result;
    },
    signInWithGoogle: async () => {
      if (!checkSupabaseConfig()) {
        throw new Error('Supabase is not configured. Please set the environment variables.');
      }
      return supabase.auth.signInWithOAuth({ provider: 'google' });
    },
    signInAnonymously: async () => {
      if (!checkSupabaseConfig()) {
        throw new Error('Supabase is not configured. Please set the environment variables.');
      }
      return supabase.auth.signInAnonymously();
    },
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

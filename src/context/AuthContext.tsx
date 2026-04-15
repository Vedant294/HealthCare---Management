import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  hospital: string;
  avatar?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: SignupData) => Promise<SignupResult>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  loading: boolean;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  role?: string;
  hospital?: string;
  phone?: string;
}

interface SignupResult {
  success: boolean;
  needsEmailConfirmation?: boolean;
  error?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const mapSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      role: supabaseUser.user_metadata?.role || 'User',
      hospital: supabaseUser.user_metadata?.hospital || 'Not Assigned',
      avatar: supabaseUser.user_metadata?.avatar,
      phone: supabaseUser.user_metadata?.phone,
    };
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return false;
      if (data.user) { setUser(mapSupabaseUser(data.user)); return true; }
      return false;
    } catch {
      return false;
    }
  };

  const signup = async (signupData: SignupData): Promise<SignupResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          data: {
            name: signupData.name,
            role: signupData.role || 'User',
            hospital: signupData.hospital || '',
            phone: signupData.phone || '',
          },
        },
      });

      if (error) {
        console.error('Signup error:', error.message);
        return {
          success: false,
          error: error.message,
        };
      }

      if (data.user) {
        // Check if email confirmation is required
        const needsConfirmation = data.user.identities?.length === 0;
        
        if (!needsConfirmation && data.session) {
          // User is auto-confirmed, set user data
          setUser(mapSupabaseUser(data.user));
        }

        return {
          success: true,
          needsEmailConfirmation: needsConfirmation,
        };
      }

      return {
        success: false,
        error: 'Failed to create account',
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          role: data.role,
          hospital: data.hospital,
          avatar: data.avatar,
          phone: data.phone,
        },
      });

      if (!error && user) {
        setUser({ ...user, ...data });
      }
    } catch (error) {
      console.error('Update profile error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AppRole = 'client' | 'staff' | null;
type AccessTier = 'demo' | 'full' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole;
  accessTier: AccessTier;
  loading: boolean;
  roleLoading: boolean; // New: tracks role fetch specifically
  disclaimerAccepted: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshDisclaimerStatus: () => Promise<void>;
  isClient: boolean;
  isStaff: boolean;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [accessTier, setAccessTier] = useState<AccessTier>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true); // New state

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role fetching with setTimeout to prevent deadlock
        if (session?.user) {
          setRoleLoading(true); // Start role loading
          setTimeout(() => {
            Promise.all([
              fetchUserRole(session.user.id),
              fetchAccessTier(session.user.id),
              fetchDisclaimerStatus(session.user.id),
            ]).finally(() => {
              setRoleLoading(false); // Role loading complete
            });
          }, 0);
        } else {
          setRole(null);
          setAccessTier(null);
          setDisclaimerAccepted(false);
          setRoleLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setRoleLoading(true);
        Promise.all([
          fetchUserRole(session.user.id),
          fetchAccessTier(session.user.id),
          fetchDisclaimerStatus(session.user.id),
        ]).finally(() => {
          setRoleLoading(false);
          setLoading(false);
        });
      } else {
        setRoleLoading(false);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) {
        setRole(null);
      } else {
        setRole(data?.role as AppRole || null);
      }
    } catch {
      setRole(null);
    }
  };

  const fetchAccessTier = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('access_tier')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        setAccessTier(null);
      } else {
        setAccessTier((data?.access_tier as AccessTier) || 'full');
      }
    } catch {
      setAccessTier(null);
    }
  };

  const fetchDisclaimerStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('disclaimer_accepted_at')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        setDisclaimerAccepted(false);
      } else {
        setDisclaimerAccepted(!!data?.disclaimer_accepted_at);
      }
    } catch {
      setDisclaimerAccepted(false);
    }
  };

  const refreshDisclaimerStatus = async () => {
    if (user) {
      await fetchDisclaimerStatus(user.id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setAccessTier(null);
    setDisclaimerAccepted(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        accessTier,
        loading,
        roleLoading, // Expose new state
        disclaimerAccepted,
        signIn,
        signUp,
        signOut,
        refreshDisclaimerStatus,
        isClient: role === 'client',
        isStaff: role === 'staff',
        isDemoUser: accessTier === 'demo',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

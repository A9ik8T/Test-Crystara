import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isOnboarded: boolean | null;
  setIsOnboarded: (val: boolean) => void;
  checkOnboardingStatus: (accessToken?: string) => Promise<boolean>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: unknown; session: Session | null }>;
  signUp: (
    email: string,
    password: string,
  ) => Promise<{ error: unknown; session: Session | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);

  const checkOnboardingStatus = async (
    accessToken?: string,
  ): Promise<boolean> => {
    const token = accessToken || session?.access_token;
    if (!token) return false;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/onboarding/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!response.ok) return false;
      const data = await response.json();
      console.log("Onboarding status response:", data);
      setIsOnboarded(data.isOnboarded);
      return data.isOnboarded;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        setIsOnboarded(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check onboarding status whenever session changes
  useEffect(() => {
    if (session?.access_token) {
      checkOnboardingStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return { error, session: data?.session ?? null };
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (data?.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return { error, session: data?.session ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsOnboarded(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isOnboarded,
        setIsOnboarded,
        checkOnboardingStatus,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

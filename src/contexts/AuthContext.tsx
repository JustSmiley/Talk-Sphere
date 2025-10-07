import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  userId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userId: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('lastActivity');
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const checkSessionTimeout = () => {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity) {
      const timeSinceActivity = Date.now() - parseInt(lastActivity);
      if (timeSinceActivity > SESSION_TIMEOUT_MS) {
        signOut();
        return true;
      }
    }
    return false;
  };

  const updateActivity = () => {
    localStorage.setItem('lastActivity', Date.now().toString());
  };

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // Check if session timed out
      if (session && checkSessionTimeout()) {
        setLoading(false);
        return;
      }

      setUser(session?.user ?? null);
      
      // If no session exists, sign in anonymously
      if (!session) {
        supabase.auth.signInAnonymously().then(({ data, error }) => {
          if (error) {
            console.error("Error signing in anonymously:", error);
          } else {
            setUser(data.user);
            updateActivity();
          }
          setLoading(false);
        });
      } else {
        updateActivity();
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        updateActivity();
      }
    });

    // Track user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => updateActivity();
    
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      subscription.unsubscribe();
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userId: user?.id ?? null,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

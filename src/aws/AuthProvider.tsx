import { createContext, useContext, useEffect, useState, useRef } from "react";
import { getCurrentUser } from "@aws-amplify/auth";
import { toast } from "sonner"
type AuthContextType = {
  user: string | null;
  userLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<string | null>(null);
  const [userLoading, setLoading] = useState(true);
  const hasWelcomed = useRef(false);

  useEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser.username);
        if (!hasWelcomed.current) {
          toast(`Welcome back, ${currentUser.username}!`, {
            description: "It's great to see you again.",
            icon: <span>👋</span>,
            className: "rounded-xl bg-slate-900 border-slate-800 text-white",
          });
          hasWelcomed.current = true;
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, userLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

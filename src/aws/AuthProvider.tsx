import { createContext, useContext, useEffect, useState, useRef } from "react";
import { fetchUserAttributes, getCurrentUser } from "@aws-amplify/auth";
import { toast } from "sonner"
type AuthContextType = {
  user: string | null;
  userLoading: boolean;
  attributes: any;
  setAttributes: (attr: any) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<string | null>(null);
  const [userLoading, setLoading] = useState(true); 
  const [attributes, setAttributes] = useState<any>(null);
  const hasWelcomed = useRef(false);

  useEffect(() => {
    async function initAuth() {
      try {
        const currentUser = await getCurrentUser();
        const userAttrs = await fetchUserAttributes();
        setUser(currentUser.username);
        setAttributes(userAttrs);

        if (!hasWelcomed.current) {
          toast(`Welcome back, ${currentUser.username}!`, {
            description: "It's great to see you again.",
            icon: <span>👋</span>,
            className: "rounded-xl bg-slate-900 border-slate-800 text-white",
          });
          hasWelcomed.current = true
        }
      } catch (error) {
        setUser(null);
        setAttributes(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, []);

  return (
    <AuthContext.Provider value={{ user, userLoading, attributes, setAttributes }}>
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

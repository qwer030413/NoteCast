import { createContext, useContext, useEffect, useState, useRef } from "react";
import { getCurrentUser } from "@aws-amplify/auth";
import toast from "react-hot-toast";

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

        // Show toast only ONCE per app load
        if (!hasWelcomed.current) {
          toast(`Welcome ${currentUser.username}!`, {
            icon: "👋",
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
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

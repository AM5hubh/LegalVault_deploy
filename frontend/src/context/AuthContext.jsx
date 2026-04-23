import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * AuthContext centralizes user + token state so components do not read localStorage directly.
 * It exposes helpers for login/logout and keeps localStorage in sync.
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch (err) {
      console.error("Failed to parse stored user", err);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const login = (nextUser, nextToken) => {
    if (!nextUser || !nextToken) return;
    setUser(nextUser);
    setToken(nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
    localStorage.setItem("token", nextToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userWallet");
  };

  const updateUser = (updater) => {
    setUser((prev) => {
      const updated =
        typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      updateUser,
    }),
    [user, token, isReady],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

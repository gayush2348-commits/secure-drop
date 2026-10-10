import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = () => {
    setUser(null);
    setAccessToken(null);
  };

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const data = await apiFetch("/auth/refresh", {
          method: "POST",
        });

        setAccessToken(data.accessToken);

        const profileData = await apiFetch("/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        });

        setUser(profileData.user);
      } catch (error) {
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

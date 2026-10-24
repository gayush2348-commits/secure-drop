import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { apiFetch } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setAccessToken(null);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    setAccessToken(token);
  };

  const logout = useCallback(async () => {
    try {
      // Revoke the refresh token on the backend and clear its cookie.
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // Always clear local authentication, even if the API fails.
      clearAuth();

      // Notify other tabs in the same origin.
      try {
        localStorage.setItem("secure-drop-logout", Date.now().toString());
      } catch (error) {
        console.error("Could not notify other tabs:", error);
      }
    }
  }, [clearAuth]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "secure-drop-logout") {
        clearAuth();
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [clearAuth]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const data = await apiFetch("/auth/refresh", {
          method: "POST",
        });

        if (!data?.accessToken) {
          throw new Error("Refresh response did not contain an access token");
        }

        const profileData = await apiFetch("/user/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        });

        if (!cancelled) {
          setAccessToken(data.accessToken);
          setUser(profileData.user);
        }
      } catch (error) {
        if (!cancelled) {
          clearAuth();
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [clearAuth]);

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

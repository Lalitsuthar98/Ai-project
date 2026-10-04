import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  getProfile,
  loginUser,
  logoutUser,
} from "../services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authActionRef = useRef(false);

  // Check whether user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
  try {
    const data = await getProfile();

    if (!authActionRef.current) {
      setUser(data.user || data);
    }
  } catch (error) {
    if (!authActionRef.current) {
      setUser(null);
    }
  } finally {
    setLoading(false);
  }
};

    checkAuth();
  }, []);

  // Login
  const login = async (credentials) => {
  authActionRef.current = true;

  const response = await loginUser(credentials);

  setUser(response.data);
  setLoading(false);

  return response;
};

  // Logout
  const logout = async () => {
    authActionRef.current = true;

    try {
      await logoutUser();
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("iqrat_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      return null;
    }
  });

  // NEW: Also retrieve the token from storage
  const [token, setToken] = useState(() => {
    return localStorage.getItem("iqrat_token") || null;
  });

  // NEW: Accept token as a second parameter
  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("iqrat_user", JSON.stringify(userData));
    localStorage.setItem("iqrat_token", accessToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("iqrat_user");
    localStorage.removeItem("iqrat_token");
  };

  const value = {
    user,
    token, // Expose token to other components
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
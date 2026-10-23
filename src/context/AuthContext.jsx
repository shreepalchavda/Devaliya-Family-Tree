import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  loginAdmin, 
  logoutAdmin, 
  subscribeToAuth 
} from "../services/authService";
import { isFirebaseConfigured } from "../services/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user, adminStatus) => {
      setCurrentUser(user);
      setIsAdmin(adminStatus);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const result = await loginAdmin(email, password);
    setCurrentUser(result.user);
    setIsAdmin(result.isAdmin);
    return result;
  };

  const logout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  const value = {
    currentUser,
    isAdmin,
    loading,
    login,
    logout,
    isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

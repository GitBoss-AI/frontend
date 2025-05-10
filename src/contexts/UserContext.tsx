"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserFromToken, clearToken, isAuthenticated } from '@/utils/auth';

// User information structure
interface User {
  id: string;
  username: string;
}

// Context state structure
interface UserContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);

// Provider component to wrap the application
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user data on mount
  useEffect(() => {
    const loadUser = () => {
      // Check if authenticated
      if (!isAuthenticated()) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Get user from token
      const userData = getUserFromToken();
      setUser(userData);
      setLoading(false);
    };

    loadUser();
  }, []);

  // Logout function
  const logout = () => {
    clearToken();
    setUser(null);
    router.push('/dev/signin');
  };

  // Context value
  const value = {
    user,
    loading,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
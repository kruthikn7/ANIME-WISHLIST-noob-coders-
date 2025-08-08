import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null); // Initialize with null instead of undefined

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (email, password) => {
    // Mock authentication - replace with real auth in production
    setCurrentUser({ 
      uid: 'mock-user-123', 
      email: email 
    });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
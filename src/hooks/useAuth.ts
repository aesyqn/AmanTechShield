import { useState, useEffect } from 'react';
interface User {
  name: string;
  email: string;
  position: string;
}
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);
  const login = (email: string, password: string): boolean => {
    // Simulate login (in real app, validate against backend)
    if (email && password) {
      const newUser = {
        name: email.split('@')[0],
        email,
        position: 'Security Auditor'
      };
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };
  const register = (name: string, email: string, password: string, position: string): boolean => {
    // Simulate registration
    if (name && email && password && position) {
      const newUser = {
        name,
        email,
        position
      };
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };
  return {
    user,
    isAuthenticated,
    login,
    register,
    logout
  };
}
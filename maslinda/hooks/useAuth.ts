import { useState, useEffect } from 'react';

// ✅ User interface with all required fields
interface User {
  id: string;
  name: string;
  position: string;
  email: string;
}

// ✅ FIXED: Correct API path
const API_BASE = 'http://localhost:4000/api/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Validate user has required fields
        if (parsedUser.id && parsedUser.name && parsedUser.email) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // Invalid stored user, clear it
          localStorage.removeItem('user');
        }
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // 🔐 LOGIN
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('🔐 Attempting login:', email);
      
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Login failed' }));
        console.error('❌ Login failed:', errorData.error);
        return false;
      }

      // ✅ Backend returns user directly (not wrapped in { user: {...} })
      const userData = await res.json();
      
      // ✅ Validate response has required fields
      if (!userData.id || !userData.name || !userData.email) {
        console.error('❌ Backend response missing required fields:', userData);
        return false;
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        position: userData.position,
      };

      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Login successful:', user.email);
      return true;
    } catch (err) {
      console.error('❌ Login error:', err);
      return false;
    }
  };

  // 📝 REGISTER
  const register = async (
    name: string,
    email: string,
    password: string,
    position: string
  ): Promise<boolean> => {
    try {
      console.log('📝 Attempting registration:', email);
      
      const res = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, position }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Registration failed' }));
        console.error('❌ Registration failed:', errorData.error);
        return false;
      }

      // ✅ Backend returns user directly (not wrapped in { user: {...} })
      const userData = await res.json();
      
      // ✅ Validate response has required fields
      if (!userData.id || !userData.name || !userData.email) {
        console.error('❌ Backend response missing required fields:', userData);
        return false;
      }

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        position: userData.position,
      };

      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('✅ Registration successful:', user.email);
      return true;
    } catch (err) {
      console.error('❌ Registration error:', err);
      return false;
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    console.log('✅ Logged out');
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
}

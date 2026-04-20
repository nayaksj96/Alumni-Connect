import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const stored = localStorage.getItem('alumniUser');
    if (!stored) return null;
    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch {
      localStorage.removeItem('alumniUser');
      return null;
    }
    if (!parsed?.token) return parsed;
    try {
      const res = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${parsed.token}` },
      });
      if (res.status === 401) {
        localStorage.removeItem('alumniUser');
        setUser(null);
        return null;
      }
      if (!res.ok) return parsed;
      const u = await res.json();
      const next = { ...u, token: parsed.token };
      localStorage.setItem('alumniUser', JSON.stringify(next));
      setUser(next);
      return next;
    } catch {
      return parsed;
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = localStorage.getItem('alumniUser');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed);
          await refreshUser();
        }
      } catch (error) {
        console.error('Failed to parse user from localStorage', error);
        localStorage.removeItem('alumniUser');
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshUser]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to login');
      }
      localStorage.setItem('alumniUser', JSON.stringify(data));
      setUser(data);
      return { success: true, user: data };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('alumniUser');
    setUser(null);
  };

  const signup = async (formData) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to sign up');
      }
      // Do not auto-login: user must sign in on the login page next.
      return { success: true, email: data.email };
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const value = { user, loading, login, logout, signup, refreshUser };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

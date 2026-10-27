
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from 'react';

import { api, setToken, getToken } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication from the saved token.
  const initAuth = useCallback(async () => {
    setLoading(true);

    try {
      const hash = window.location.hash;

      // Handle successful Google/GitHub OAuth callback.
      if (hash.startsWith('#oauth_token=')) {
        const params = new URLSearchParams(hash.substring(1));
        const oauthToken = params.get('oauth_token');

        if (!oauthToken) {
          throw new Error('No authentication token received.');
        }

        setToken(oauthToken);
        setError(null);

        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );
      }

      // Handle OAuth failure.
      else if (hash.startsWith('#oauth_error=')) {
        const params = new URLSearchParams(hash.substring(1));
        const oauthError = params.get('oauth_error');

        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search
        );

        setToken(null);
        setUser(null);
        setError(
          oauthError || 'Social sign-in failed. Please try again.'
        );

        return;
      }

      // Restore the user from the saved token.
      const token = getToken();

      if (!token) {
        setUser(null);
        return;
      }

      const response = await api.getMe();

      if (!response || !response.user) {
        throw new Error('Unable to load your account.');
      }

      setUser(response.user);
      setError(null);
    } catch (err) {
      console.error('[AUTH INIT] Failed:', err.message);

      setToken(null);
      setUser(null);
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Normal email and password login.
  async function login(email, password) {
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      console.log('[LOGIN] Sending login request');
      console.log('[LOGIN] Email:', normalizedEmail);

      const response = await api.login({
        email: normalizedEmail,
        password
      });

      console.log('[LOGIN] API success:', response?.success);
      console.log('[LOGIN] User role:', response?.user?.role);

      if (
        !response ||
        response.success !== true ||
        !response.token ||
        !response.user
      ) {
        throw new Error(
          response?.message || 'Invalid login response.'
        );
      }

      // Store the token and authenticated user.
      setToken(response.token);
      setUser(response.user);
      setError(null);

      return response.user;
    } catch (err) {
      console.error('[LOGIN] Failed:', err.message);

      setError(err.message || 'Login failed.');
      throw err;
    }
  }

  // Register a new account.
  async function register(userData) {
    setError(null);

    try {
      const normalizedData = {
        ...userData,
        email: userData.email?.trim().toLowerCase()
      };

      const response = await api.register(normalizedData);

      if (!response?.token || !response?.user) {
        throw new Error(
          response?.message || 'Registration response is incomplete.'
        );
      }

      setToken(response.token);
      setUser(response.user);
      setError(null);

      return response.user;
    } catch (err) {
      console.error('[REGISTER] Failed:', err.message);

      setError(err.message || 'Registration failed.');
      throw err;
    }
  }

  // Demo login.
  async function quickDemoLogin(role = 'student') {
    setLoading(true);
    setError(null);

    try {
      const response = await api.switchRole(role);

      if (!response?.token || !response?.user) {
        throw new Error('Demo login response is incomplete.');
      }

      setToken(response.token);
      setUser(response.user);

      return response.user;
    } catch (err) {
      console.error('[DEMO LOGIN] Failed:', err.message);

      setError(err.message || 'Demo login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Switch the current role.
  async function switchRole(role) {
    setLoading(true);
    setError(null);

    try {
      const response = await api.switchRole(role);

      if (!response?.token || !response?.user) {
        throw new Error('Role switch response is incomplete.');
      }

      setToken(response.token);
      setUser(response.user);

      return response.user;
    } catch (err) {
      console.error('[ROLE SWITCH] Failed:', err.message);

      setError(err.message || 'Unable to switch role.');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // Sign out.
  function logout() {
    setToken(null);
    setUser(null);
    setError(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'student',
        loading,
        error,
        login,
        register,
        quickDemoLogin,
        logout,
        switchRole,
        refreshUser: initAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook used by Sidebar and other components.
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

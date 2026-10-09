import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Dedicated Administrator session state (independent of normal dashboard account)
  const [adminToken, setAdminToken] = useState(() => sessionStorage.getItem('adminToken') || '');
  const [adminUser, setAdminUser] = useState(() => {
    const raw = sessionStorage.getItem('adminUser');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  });

  // Verify admin session if adminToken exists
  useEffect(() => {
    const verifyAdminSession = async () => {
      if (!adminToken) {
        setAdminUser(null);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          const email = (data.user?.email || '').toLowerCase().replace(/\s+/g, '').trim();
          const ALLOWED = ['singunamitha@gmail.com', 's.v.padmavathi2005@gmail.com'];
          if (data.user?.role === 'admin' && ALLOWED.includes(email)) {
            setAdminUser(data.user);
            sessionStorage.setItem('adminUser', JSON.stringify(data.user));
          } else {
            sessionStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminUser');
            setAdminToken('');
            setAdminUser(null);
          }
        } else {
          sessionStorage.removeItem('adminToken');
          sessionStorage.removeItem('adminUser');
          setAdminToken('');
          setAdminUser(null);
        }
      } catch (_) {
        // Keep existing cached adminUser on network error
      }
    };
    verifyAdminSession();
  }, [adminToken]);

  // Load user on token change
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token invalid
          localStorage.removeItem('token');
          setToken('');
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to load user session', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Handle 2FA Challenge
    if (data.requires2FA) {
      return data;
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const verifyLogin2FA = async (email, code) => {
    const res = await fetch('/api/auth/2fa/verify-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || '2FA verification failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const generate2FA = async () => {
    const res = await fetch('/api/auth/2fa/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to generate 2FA setup');
    }
    return data;
  };

  const enable2FA = async (code) => {
    const res = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to enable 2FA');
    }

    setUser(data.user);
    return data;
  };

  const disable2FA = async () => {
    const res = await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to disable 2FA');
    }

    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const loginWithGoogle = async (customPayload) => {
    let payload = customPayload;

    // If no custom payload is provided, trigger Firebase Google Sign-In popup
    if (!payload || typeof payload !== 'object' || !payload.email) {
      try {
        const { signInWithGoogleFirebase } = await import('../firebase');
        payload = await signInWithGoogleFirebase();
      } catch (fbErr) {
        if (fbErr.code === 'auth/popup-closed-by-user' || fbErr.code === 'auth/cancelled-popup-request') {
          throw new Error('Google sign-in was cancelled.');
        }
        if (fbErr.code === 'auth/popup-blocked') {
          throw new Error('Google sign-in popup was blocked by browser. Please allow popups.');
        }
        console.error('Firebase authentication error:', fbErr);
        throw new Error(fbErr.message || 'Firebase Google authentication failed.');
      }
    }

    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Google authentication failed');
    }

    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const updateProfile = async (profileData) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    setUser(data.user);
    return data;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await fetch('/api/auth/change-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to change password');
    }

    return data;
  };

  const forgotPassword = async (email) => {
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Forgot password request failed');
    }

    return data;
  };

  const verifyResetCode = async (email, code) => {
    const res = await fetch('/api/auth/verify-reset-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Verification code check failed');
    }

    return data;
  };

  const resetPassword = async (email, code, newPassword, resetTicket = '') => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword, resetTicket }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Password reset failed');
    }

    return data;
  };

  const loginAdminWithGoogle = async () => {
    const { signInWithGoogleFirebase } = await import('../firebase');
    const payload = await signInWithGoogleFirebase();

    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Google authentication failed');
    }

    const email = (data.user?.email || '').toLowerCase().replace(/\s+/g, '').trim();
    const ALLOWED_ADMINS = ['singunamitha@gmail.com', 's.v.padmavathi2005@gmail.com'];

    if (!ALLOWED_ADMINS.includes(email) || data.user?.role !== 'admin') {
      throw new Error('Unauthorized: Access denied. This account does not have administrator privileges.');
    }

    // Persist ONLY to admin session - do NOT modify or overwrite the normal user session!
    sessionStorage.setItem('adminToken', data.token);
    sessionStorage.setItem('adminUser', JSON.stringify(data.user));
    setAdminToken(data.token);
    setAdminUser(data.user);

    return data;
  };

  const logoutAdmin = () => {
    sessionStorage.removeItem('adminToken');
    sessionStorage.removeItem('adminUser');
    setAdminToken('');
    setAdminUser(null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  const isNormalUserAdmin = user?.role === 'admin' && ['singunamitha@gmail.com', 's.v.padmavathi2005@gmail.com'].includes((user?.email || '').toLowerCase().replace(/\s+/g, '').trim());
  const hasActiveAdminSession = adminUser?.role === 'admin' && Boolean(adminToken);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        adminUser,
        adminToken,
        loginAdminWithGoogle,
        logoutAdmin,
        login,
        register,
        loginWithGoogle,
        updateProfile,
        changePassword,
        forgotPassword,
        verifyResetCode,
        resetPassword,
        verifyLogin2FA,
        generate2FA,
        enable2FA,
        disable2FA,
        logout,
        isAdmin: isNormalUserAdmin || hasActiveAdminSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


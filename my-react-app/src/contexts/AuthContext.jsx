import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import axios from '../utils/axiosConfig';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'user';
const TOKEN_STORAGE_KEY = 'accessToken';

/**
 * Normalizes user data from API response to consistent format
 */
const normalizeUser = (userData) => {
  if (!userData) return null;
  
  return {
    _id: userData.id || userData._id,
    id: userData.id || userData._id,
    name: userData.name || '',
    email: userData.email || '',
    gender: userData.gender || '',
    dob: userData.dob || null,
    age: userData.age || null,
    avatar: userData.avatar || '',
    career: userData.career || userData.job || '',
    job: userData.job || userData.career || '',
    hometown: userData.hometown || userData.location || '',
    location: userData.location || '',
    geoLocation: userData.geoLocation || null,
    hobbies: userData.hobbies || [],
    bio: userData.bio || '',
    zodiac: userData.zodiac || 'Unknown',
    preferences: userData.preferences || null,
    lookingFor: userData.preferences?.lookingFor || userData.lookingFor || 'All',
    height: (() => {
      const numeric = Number(userData.height);
      if (!Number.isFinite(numeric)) return null;
      const truncated = Math.trunc(numeric);
      return truncated >= 120 && truncated <= 220 ? truncated : null;
    })(),
    isProfileComplete: userData.isProfileComplete ?? userData.profileCompleted ?? false,
    blockedUsers: userData.blockedUsers || [],
    photoGallery: userData.photoGallery || [],
    selectedOpeningMove: userData.selectedOpeningMove || null,
  };
};

/**
 * Read user from storage (localStorage for cross-tab sync)
 */
const readStoredAuth = () => {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (storedUser && storedUser !== 'undefined') {
      const user = JSON.parse(storedUser);
      
      // Restore axios auth header if token exists
      if (storedToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      
      return { user, token: storedToken };
    }
  } catch (error) {
    console.error('Error reading stored auth:', error);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
  
  return { user: null, token: null };
};

/**
 * Write auth to storage (localStorage for cross-tab sync)
 */
const writeStoredAuth = (user, token) => {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    delete axios.defaults.headers.common['Authorization'];
  }
};

/**
 * AuthProvider component - wraps app and provides auth state
 */
export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [token, setTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state from storage
  useEffect(() => {
    const { user: storedUser, token: storedToken } = readStoredAuth();
    setUserState(storedUser);
    setTokenState(storedToken);
    setIsLoading(false);
    setIsInitialized(true);
  }, []);

  // Listen for storage changes (cross-tab sync with localStorage)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === AUTH_STORAGE_KEY) {
        if (!e.newValue) {
          setUserState(null);
          setTokenState(null);
        } else {
          try {
            const newUser = JSON.parse(e.newValue);
            setUserState(newUser);
            // Also refresh token from storage
            const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
            if (storedToken) {
              setTokenState(storedToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            }
          } catch {
            // Invalid JSON
          }
        }
      } else if (e.key === TOKEN_STORAGE_KEY) {
        if (!e.newValue) {
          setTokenState(null);
          delete axios.defaults.headers.common['Authorization'];
        } else {
          setTokenState(e.newValue);
          axios.defaults.headers.common['Authorization'] = `Bearer ${e.newValue}`;
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for userChanged custom event (legacy support)
  useEffect(() => {
    const handleUserChanged = () => {
      const { user: storedUser } = readStoredAuth();
      setUserState(storedUser);
    };

    window.addEventListener('userChanged', handleUserChanged);
    return () => window.removeEventListener('userChanged', handleUserChanged);
  }, []);

  // Listen for session expiration
  useEffect(() => {
    const handleSessionExpired = () => {
      setUserState(null);
      setTokenState(null);
      writeStoredAuth(null, null);
    };

    const handleTokenRefreshed = (e) => {
      const newToken = e.detail?.accessToken;
      if (newToken) {
        setTokenState(newToken);
        // Also update localStorage so AuthContext stays in sync
        localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
      }
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    window.addEventListener('tokenRefreshed', handleTokenRefreshed);
    return () => {
      window.removeEventListener('sessionExpired', handleSessionExpired);
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
    };
  }, []);

  /**
   * Login - accepts user data and token, stores and updates state
   */
  const login = useCallback((userData, accessToken) => {
    const normalizedUser = normalizeUser(userData);
    
    if (!normalizedUser || !normalizedUser.id) {
      throw new Error('Invalid user data');
    }
    
    writeStoredAuth(normalizedUser, accessToken);
    setUserState(normalizedUser);
    setTokenState(accessToken);
    
    // Dispatch legacy event for backward compatibility
    window.dispatchEvent(new Event('userChanged'));
    
    return normalizedUser;
  }, []);

  /**
   * Logout - clears auth state and storage
   */
  const logout = useCallback(() => {
    writeStoredAuth(null, null);
    setUserState(null);
    setTokenState(null);
    
    // Dispatch legacy event for backward compatibility
    window.dispatchEvent(new Event('userChanged'));
  }, []);

  /**
   * Update user data (e.g., after profile update)
   */
  const updateUser = useCallback((updates) => {
    setUserState((prevUser) => {
      if (!prevUser) return prevUser;
      
      const updatedUser = normalizeUser({ ...prevUser, ...updates });
      writeStoredAuth(updatedUser, token);
      
      // Dispatch legacy event
      window.dispatchEvent(new Event('userChanged'));
      
      return updatedUser;
    });
  }, [token]);

  /**
   * Refresh user data from server
   */
  const refreshUser = useCallback(async () => {
    if (!user?.id) return null;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await axios.get(`${API_URL}/api/users/profile/${user.id}`);
      
      if (response.data?.user) {
        const refreshedUser = normalizeUser(response.data.user);
        writeStoredAuth(refreshedUser, token);
        setUserState(refreshedUser);
        window.dispatchEvent(new Event('userChanged'));
        return refreshedUser;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
    
    return null;
  }, [user?.id, token]);

  // Computed values
  const isAuthenticated = useMemo(() => !!user && !!user.id, [user]);
  const userId = useMemo(() => user?.id || user?._id || null, [user]);

  const value = useMemo(() => ({
    // State
    user,
    token,
    isLoading,
    isInitialized,
    isAuthenticated,
    userId,
    
    // Actions
    login,
    logout,
    updateUser,
    refreshUser,
    
    // Legacy compatibility
    setUser: (userData) => {
      if (userData) {
        const normalized = normalizeUser(userData);
        writeStoredAuth(normalized, token);
        setUserState(normalized);
        window.dispatchEvent(new Event('userChanged'));
      } else {
        logout();
      }
    },
  }), [user, token, isLoading, isInitialized, isAuthenticated, userId, login, logout, updateUser, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    // During HMR / React Refresh the provider may temporarily be absent.
    // Return a safe stub so the tree can re-render without crashing.
    if (import.meta.hot) {
      return {
        user: null, token: null, isLoading: true, isInitialized: false,
        isAuthenticated: false, userId: null,
        login: () => {}, logout: () => {}, updateUser: () => {},
        refreshUser: async () => null, setUser: () => {},
      };
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

/**
 * Legacy compatibility - export UserContext-compatible hook
 */
export function useUser() {
  const { user, setUser, isLoading } = useAuth();
  return { user, setUser, isLoading };
}

export default AuthContext;

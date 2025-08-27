import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types/auth';
import { authService } from '../services/authService';
import { SecurityConfig, SessionManager } from '../utils/security';

interface AuthContextType {
  state: AuthState;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  bypassAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Initialize security and session management
    const securityCheck = SecurityConfig.validateSecureContext();
    if (!securityCheck.isSecure) {
      console.warn('Security warnings:', securityCheck.warnings);
      dispatch({ type: 'SET_ERROR', payload: 'Security configuration issues detected' });
    }

    // Initialize session manager
    SessionManager.initialize(() => {
      console.log('Session expired due to inactivity');
      signOut();
    });

    checkSession();

    // Cleanup on unmount
    return () => {
      SessionManager.cleanup();
    };
  }, []);

  const checkSession = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await authService.checkSession();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Session check failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Session check failed' });
    }
  };

  const signIn = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await authService.signIn();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.error('Sign in failed:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Sign in failed' });
    }
  };

  const signOut = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Clean up session manager
      SessionManager.cleanup();
      
      // Sign out from authentication service
      await authService.signOut();
      
      // Clear application state
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Sign out failed' });
    }
  };

  const bypassAuth = () => {
    if (process.env.NODE_ENV !== 'development') {
      console.warn('Authentication bypass is only available in development mode');
      return;
    }

    const mockUser: User = {
      username: 'dev-user',
      fullName: 'Development User',
      groups: ['developers', 'testers'],
      token: 'dev-bypass-token'
    };

    dispatch({ type: 'SET_USER', payload: mockUser });
  };

  return (
    <AuthContext.Provider value={{ state, signIn, signOut, bypassAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
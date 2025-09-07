import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types/auth';
import { authService } from '../services/authService';
import { SecurityConfig, SessionManager } from '../utils/security';
import { groupValidationService } from '../services/groupValidationService';
import { authLogger, securityLogger } from '../utils/logger';

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
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ACCESS_DENIED'; payload: { message: string; userGroups?: string[]; userGroupIds?: string[] } };

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
        error: null,
        accessDenied: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'SET_ACCESS_DENIED':
      return {
        ...state,
        accessDenied: action.payload,
        loading: false,
        error: null,
        isAuthenticated: false,
        user: null
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  accessDenied: null
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const handleGroupAccessLost = React.useCallback(() => {
    securityLogger.security('User lost Sirius Users group membership', {
      userGroups: state.user?.groups,
      userGroupIds: state.user?.groupIds
    });
    
    // Set access denied state
    dispatch({ 
      type: 'SET_ACCESS_DENIED', 
      payload: {
        message: 'Your access to SIRIUS Portal has been revoked. You are no longer a member of the Sirius Users group.',
        userGroups: state.user?.groups,
        userGroupIds: state.user?.groupIds
      }
    });
    
    // Clean up sessions
    SessionManager.cleanup();
    groupValidationService.cleanup();
  }, [state.user?.groups, state.user?.groupIds]);

  useEffect(() => {
    // Initialize security and session management
    const securityCheck = SecurityConfig.validateSecureContext();
    if (!securityCheck.isSecure) {
      authLogger.warn('Security configuration issues', { warnings: securityCheck.warnings });
      dispatch({ type: 'SET_ERROR', payload: 'Security configuration issues detected' });
    }

    // Initialize session manager
    SessionManager.initialize(() => {
      authLogger.info('Session expired due to inactivity');
      signOut();
    });

    // Initialize group validation service
    groupValidationService.initialize(() => {
      authLogger.info('Group access lost - user removed from Sirius Users group');
      handleGroupAccessLost();
    });

    checkSession();

    // Cleanup on unmount
    return () => {
      SessionManager.cleanup();
      groupValidationService.cleanup();
    };
  }, [handleGroupAccessLost]);

  const checkSession = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await authService.checkSession();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: any) {
      authLogger.error('Session check failed', error);
      
      // Handle Sirius Users access denial specifically
      if (error.code === 'SIRIUS_ACCESS_DENIED') {
        dispatch({ 
          type: 'SET_ACCESS_DENIED', 
          payload: {
            message: error.message,
            userGroups: error.userGroups,
            userGroupIds: error.userGroupIds
          }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Session check failed' });
      }
    }
  };

  const signIn = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await authService.signIn();
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: any) {
      authLogger.error('Sign in failed', error);
      
      // Handle Sirius Users access denial specifically
      if (error.code === 'SIRIUS_ACCESS_DENIED') {
        dispatch({ 
          type: 'SET_ACCESS_DENIED', 
          payload: {
            message: error.message,
            userGroups: error.userGroups,
            userGroupIds: error.userGroupIds
          }
        });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Sign in failed' });
      }
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
      authLogger.warn('Authentication bypass only available in development mode');
      return;
    }

    // Include Sirius Users group in development bypass
    const mockUser: User = {
      username: 'dev-user',
      fullName: 'Development User',
      groups: ['Sirius Users', 'developers', 'testers'], // Include required group
      groupIds: ['afa4ae2949554ec59972abebbfd0034c', 'dev-group-1', 'dev-group-2'], // Include required group ID
      token: 'dev-bypass-token'
    };

    dispatch({ type: 'SET_USER', payload: mockUser });
  };

  // handleGroupAccessLost is now defined above useEffect as a useCallback


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
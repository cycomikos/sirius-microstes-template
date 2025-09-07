import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types/auth';
import { authService } from '../services/authService';
import { SecurityConfig, SessionManager } from '../utils/security';
import { groupValidationService } from '../services/groupValidationService';
import { webhookService } from '../services/webhookService';
import { SECURITY_CONFIG } from '../constants';
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

// Try to restore authentication state from sessionStorage on app start
const getInitialState = (): AuthState => {
  try {
    const savedState = sessionStorage.getItem('authState');
    if (savedState) {
      const parsed = JSON.parse(savedState);
      // Only restore if we have a user and were previously authenticated
      if (parsed.isAuthenticated && parsed.user) {
        return {
          ...parsed,
          loading: false, // Always start without loading
          error: null     // Clear any previous errors
        };
      }
    }
  } catch (error) {
    // If there's any error parsing, fall back to default state
    authLogger.debug('Could not restore auth state from storage', error);
  }
  
  return {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
    accessDenied: null
  };
};

const initialState: AuthState = getInitialState();

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Persist authentication state to sessionStorage whenever it changes
  React.useEffect(() => {
    try {
      if (state.isAuthenticated && state.user) {
        sessionStorage.setItem('authState', JSON.stringify({
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          loading: false,
          error: null,
          accessDenied: null
        }));
      } else if (!state.loading) {
        // Clear stored state if not authenticated and not loading
        sessionStorage.removeItem('authState');
      }
    } catch (error) {
      authLogger.debug('Could not persist auth state to storage', error);
    }
  }, [state.isAuthenticated, state.user, state.loading]);

  // Use a ref to store the latest callback to avoid stale closures
  const handleGroupAccessLostRef = React.useRef<() => void>();
  
  const handleGroupAccessLost = React.useCallback(() => {
    // Only trigger group access lost if user is actually authenticated
    // This prevents false positives during navigation
    if (!state.isAuthenticated || !state.user) {
      return;
    }
    
    securityLogger.security('User lost Sirius Users group membership', {
      userGroups: state.user.groups,
      userGroupIds: state.user.groupIds
    });
    
    // Set access denied state
    dispatch({ 
      type: 'SET_ACCESS_DENIED', 
      payload: {
        message: 'Your access to SIRIUS Portal has been revoked. You are no longer a member of the Sirius Users group.',
        userGroups: state.user.groups,
        userGroupIds: state.user.groupIds
      }
    });
    
    // Clean up sessions
    SessionManager.cleanup();
    groupValidationService.cleanup();
  }, [state.isAuthenticated, state.user]);

  // Update the ref whenever the callback changes
  handleGroupAccessLostRef.current = handleGroupAccessLost;

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

    // Initialize group validation service - choose between webhook or polling
    if (SECURITY_CONFIG.USE_WEBHOOKS) {
      // Use webhook-based real-time group validation (preferred)
      authLogger.info('🚀 Initializing webhook-based group validation');
      // Note: webhookService will be initialized when user successfully logs in
    } else {
      // Fallback to polling-based group validation
      authLogger.info('🔄 Initializing polling-based group validation (fallback)');
      groupValidationService.initialize(() => {
        authLogger.info('Group access lost - user removed from Sirius Users group');
        // Use the ref to always call the latest version of the callback
        handleGroupAccessLostRef.current?.();
      });
    }

    // Auto-trigger authentication if not already authenticated
    // This implements the simplified flow: directly start ArcGIS Enterprise auth
    if (!initialState.isAuthenticated) {
      autoSignIn();
    }

    // Cleanup on unmount
    return () => {
      SessionManager.cleanup();
      if (SECURITY_CONFIG.USE_WEBHOOKS) {
        webhookService.cleanup();
      } else {
        groupValidationService.cleanup();
      }
    };
  }, []); // Empty dependency array - initialize only once


  const autoSignIn = async () => {
    authLogger.info('🚀 Starting automatic ArcGIS Enterprise authentication');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const user = await authService.signIn();
      dispatch({ type: 'SET_USER', payload: user });
      
      // Initialize webhook service for real-time group validation
      if (SECURITY_CONFIG.USE_WEBHOOKS && user) {
        webhookService.initialize(user.username, () => {
          authLogger.info('🔗 Webhook detected group access lost');
          handleGroupAccessLostRef.current?.();
        });
      }
    } catch (error: any) {
      authLogger.error('Auto sign in failed', error);
      
      // Handle authentication cancellation - redirect to external portal
      if (error.name === 'IdentityManagerError' || 
          error.message?.includes('User aborted') || 
          error.message?.includes('cancelled') ||
          error.code === 'USER_CANCELLED') {
        authLogger.info('🔄 User cancelled authentication - redirecting to external portal');
        window.location.href = 'https://publicgis.petronas.com/sirius-portal/';
        return;
      }
      
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
        // For other errors, redirect to external portal
        authLogger.error('🔄 Authentication error - redirecting to external portal');
        window.location.href = 'https://publicgis.petronas.com/sirius-portal/';
      }
    }
  };

  const signIn = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const user = await authService.signIn();
      dispatch({ type: 'SET_USER', payload: user });
      
      // Initialize webhook service for real-time group validation
      if (SECURITY_CONFIG.USE_WEBHOOKS && user) {
        webhookService.initialize(user.username, () => {
          authLogger.info('🔗 Webhook detected group access lost');
          handleGroupAccessLostRef.current?.();
        });
      }
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
      
      // Clear persisted authentication state
      sessionStorage.removeItem('authState');
      
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
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

// Set cancellation flag without immediate redirect (for user cancellation)
const setCancellationFlag = () => {
  authLogger.info('🚀 Setting cancellation flag for delayed redirect');
  
  // Set cancellation flag before clearing storage
  try {
    sessionStorage.setItem('auth_cancelled', 'true');
    authLogger.info('✅ Cancellation flag set successfully');
  } catch (e) {
    authLogger.warn('Could not set cancellation flag', e);
  }
  
  // Clear sensitive authentication data but preserve cancellation flag
  try {
    // Clear auth-related items specifically instead of clearing all
    sessionStorage.removeItem('authState');
    localStorage.clear();
    
    // Set the cancellation flag (if it wasn't already set)
    sessionStorage.setItem('auth_cancelled', 'true');
    
    authLogger.info('🧹 Auth storage cleared, cancellation flag preserved');
  } catch (cleanupError) {
    authLogger.warn('⚠️ Storage cleanup failed:', cleanupError);
  }
  
  // Don't redirect immediately - let the app handle it via the cancellation flag
  // The App.tsx component will detect the flag and show the cancellation message
  // with a 30-second countdown before redirecting
  authLogger.info('✅ Cancellation flag set - app will handle redirect with countdown');
};

// Force immediate redirect to external portal (for callback errors, etc.)
const forceRedirectToExternalPortal = () => {
  const externalPortalUrl = 'https://publicgis.petronas.com/sirius-portal';
  
  authLogger.info('🚀 Forcing immediate redirect to external portal');
  
  // Clear session storage immediately
  try {
    sessionStorage.clear();
    localStorage.clear();
    authLogger.info('🧹 Storage cleared');
  } catch (cleanupError) {
    authLogger.warn('⚠️ Storage cleanup failed:', cleanupError);
  }
  
  // Method 1: Immediate redirect - no delays, no async operations
  authLogger.info('✅ Executing immediate redirect to:', externalPortalUrl);
  window.location.href = externalPortalUrl;
  
  // Fallback method in case the first doesn't work
  setTimeout(() => {
    authLogger.info('✅ Fallback redirect method 1');
    window.location.replace(externalPortalUrl);
  }, 50);
  
  // Second fallback with top window
  setTimeout(() => {
    try {
      if (window.top && window.top !== window) {
        authLogger.info('✅ Fallback redirect method 2 - top window');
        window.top.location.href = externalPortalUrl;
      }
    } catch (error) {
      authLogger.warn('⚠️ Top window redirect failed:', error);
    }
  }, 100);
};

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
    // Check for OAuth cancellation or error parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    authLogger.info('🔍 Checking URL parameters on app init:', {
      currentUrl: window.location.href,
      urlParams: Object.fromEntries(urlParams.entries()),
      error,
      errorDescription
    });
    
    // Handle OAuth errors (including user cancellation)
    if (error) {
      authLogger.info('🚫 OAuth error detected in URL:', { error, errorDescription });
      authLogger.info('🔄 OAuth error detected - redirecting to external portal from URL params');
      forceRedirectToExternalPortal();
      return;
    }
    
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

    // Initialize polling-based group validation
    authLogger.info('🔄 Initializing polling-based group validation');
    groupValidationService.initialize(() => {
      authLogger.info('Group access lost - user removed from Sirius Users group');
      // Use the ref to always call the latest version of the callback
      handleGroupAccessLostRef.current?.();
    });

    // Auto-trigger authentication if not already authenticated
    // This implements the simplified flow: directly start ArcGIS Enterprise auth
    // But don't auto-sign in if user previously cancelled
    const userCancelled = sessionStorage.getItem('auth_cancelled');
    
    authLogger.info('🔍 Auto-signin check:', {
      isAuthenticated: initialState.isAuthenticated,
      hasError: !!error,
      userCancelled: !!userCancelled,
      willAutoSignIn: !initialState.isAuthenticated && !error && !userCancelled
    });
    
    if (!initialState.isAuthenticated && !error && !userCancelled) {
      authLogger.info('🚀 Starting auto-signin...');
      autoSignIn();
    } else if (userCancelled) {
      authLogger.info('🚫 Skipping auto-signin - user previously cancelled');
    }

    // Cleanup on unmount
    return () => {
      SessionManager.cleanup();
      groupValidationService.cleanup();
    };
  }, []); // Empty dependency array - initialize only once


  const autoSignIn = async () => {
    authLogger.info('🚀 Starting automatic ArcGIS Enterprise authentication');
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Add timeout to prevent infinite loading
    const authTimeout = setTimeout(() => {
      authLogger.warn('⚠️ Authentication timeout - clearing loading state');
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Authentication timeout. Please try again.' 
      });
    }, 30000); // 30 second timeout
    
    try {
      const user = await authService.signIn();
      
      clearTimeout(authTimeout);
      
      // Clear cancellation flag on successful login
      sessionStorage.removeItem('auth_cancelled');
      
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: any) {
      clearTimeout(authTimeout);
      
      authLogger.error('Auto sign in failed - full error details:', {
        error: error,
        errorName: error?.name,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorStack: error?.stack
      });
      
      // Handle Sirius Users access denial specifically (don't redirect these)
      if (error.code === 'SIRIUS_ACCESS_DENIED') {
        authLogger.info('🚫 Access denied - showing error page');
        dispatch({ 
          type: 'SET_ACCESS_DENIED', 
          payload: {
            message: error.message,
            userGroups: error.userGroups,
            userGroupIds: error.userGroupIds
          }
        });
        return;
      }
      
      // Check if user cancelled authentication
      if (error?.code === 'USER_CANCELLED') {
        authLogger.info('🔄 User cancelled authentication - setting cancellation flag');
        setCancellationFlag();
        return;
      }
      
      // For other errors, set error state and let user retry
      authLogger.info('🔄 Authentication failed - setting error state for retry');
      authLogger.info('🔄 Error details:', {
        errorCode: error?.code,
        errorName: error?.name,
        errorMessage: error?.message
      });
      
      // Set error state to allow user to retry login
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error?.message || 'Authentication failed' 
      });
    }
  };

  const signIn = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    // Add timeout to prevent infinite loading
    const authTimeout = setTimeout(() => {
      authLogger.warn('⚠️ Manual sign-in timeout - clearing loading state');
      dispatch({ 
        type: 'SET_ERROR', 
        payload: 'Authentication timeout. Please try again.' 
      });
    }, 30000); // 30 second timeout
    
    try {
      const user = await authService.signIn();
      
      clearTimeout(authTimeout);
      
      // Clear cancellation flag on successful login
      sessionStorage.removeItem('auth_cancelled');
      
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error: any) {
      clearTimeout(authTimeout);
      
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
      } else if (error.code === 'USER_CANCELLED') {
        // User cancelled authentication - set cancellation flag
        authLogger.info('🔄 User cancelled manual sign-in - setting cancellation flag');
        setCancellationFlag();
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
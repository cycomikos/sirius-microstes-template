import React, { ReactNode, useEffect, useState } from 'react';
import { CalciteLoader, CalciteNotice } from '@esri/calcite-components-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { authLogger } from '../../utils/logger';
import Login from '../Login/Login';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredGroups?: string[];
  fallbackMessage?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredGroups = [],
  fallbackMessage = "You don't have permission to access this resource."
}) => {
  const { state } = useAuth();
  const [isValidatingAccess, setIsValidatingAccess] = useState(false);
  const [hasServerSideAccess, setHasServerSideAccess] = useState(true);

  // Server-side validation for protected routes
  useEffect(() => {
    const validateAccess = async () => {
      if (state.isAuthenticated && state.user && requiredGroups.length > 0) {
        setIsValidatingAccess(true);
        try {
          const hasAccess = await authService.validateUserAccess(state.user.username, requiredGroups);
          setHasServerSideAccess(hasAccess);
        } catch (error) {
          authLogger.error('Access validation failed', error);
          setHasServerSideAccess(false);
        } finally {
          setIsValidatingAccess(false);
        }
      }
    };

    validateAccess();
  }, [state.isAuthenticated, state.user, requiredGroups]);

  // Show loading spinner while checking authentication or validating access
  if (state.loading || isValidatingAccess) {
    return (
      <div className="loading-container">
        <CalciteLoader label="Checking authentication" scale="l" text="Checking authentication..." />
      </div>
    );
  }

  // Show login if not authenticated
  if (!state.isAuthenticated || !state.user) {
    return <Login onLogin={() => {}} />;
  }

  // Check group-based permissions with server-side validation
  if (requiredGroups.length > 0) {
    // Use server-side validation result instead of client-side only
    if (!hasServerSideAccess) {
      return (
        <div className="access-denied">
          <CalciteNotice 
            kind="danger" 
            icon="exclamation-mark-triangle"
            open={true}
          >
            <div slot="title">Access Denied</div>
            <div slot="message">{fallbackMessage}</div>
          </CalciteNotice>
        </div>
      );
    }
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MicrositeConfig } from '../../types/microsite';

interface ProtectedMicrositeRouteProps {
  config: MicrositeConfig;
  children: React.ReactNode;
  fallbackPath?: string;
}

const ProtectedMicrositeRoute: React.FC<ProtectedMicrositeRouteProps> = ({
  config,
  children,
  fallbackPath = '/dashboard'
}) => {
  const { state } = useAuth();

  // Check if user is authenticated
  if (!state.isAuthenticated || !state.user) {
    return <Navigate to="/login" replace />;
  }

  // Check if microsite is active
  if (config.status !== 'active') {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check if user has required group access
  const userGroups = state.user.groups || [];
  const hasAccess = userGroups.includes(config.requiredGroupId);

  if (!hasAccess) {
    // You could redirect to an access denied page or back to dashboard
    return <Navigate to={fallbackPath} replace />;
  }

  // User has access, render the microsite
  return <>{children}</>;
};

export default ProtectedMicrositeRoute;
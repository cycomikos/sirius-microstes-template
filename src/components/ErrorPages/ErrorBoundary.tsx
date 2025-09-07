import React, { Component, ReactNode } from 'react';
import { logger, LogCategory } from '../../utils/logger';
import Error500 from './Error500';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error: error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log error details
    logger.error('ErrorBoundary caught an error', LogCategory.UI, { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack });
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In a real app, you would log this to an error reporting service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: any) => {
    // Example error logging - replace with your actual error service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: 'current-user-id' // Get from your auth context
    };

    logger.error('Error Report generated', LogCategory.UI, errorReport);
    
    // Example: Send to error tracking service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // });
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use Error500
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Error500 
          error={this.state.error} 
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
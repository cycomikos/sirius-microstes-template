import React from 'react';
import './ErrorMessage.css';

interface ErrorMessageProps {
  message: string | null;
  type?: 'error' | 'success' | 'warning' | 'info';
  className?: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  type = 'error', 
  className = '' 
}) => {
  if (!message) return null;

  return (
    <div 
      className={`error-message error-type-${type} ${className}`}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
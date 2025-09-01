import React from 'react';

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

  const baseStyles = {
    marginBottom: '1rem',
    padding: '0.75rem',
    borderRadius: '4px',
    border: '1px solid',
  };

  const typeStyles = {
    error: {
      backgroundColor: '#fee',
      color: '#c33',
      borderColor: '#fcc'
    },
    success: {
      backgroundColor: '#efe',
      color: '#363',
      borderColor: '#cfc'
    },
    warning: {
      backgroundColor: '#fff3cd',
      color: '#856404',
      borderColor: '#ffeaa7'
    },
    info: {
      backgroundColor: '#e7f3ff',
      color: '#0056b3',
      borderColor: '#b3d7ff'
    }
  };

  return (
    <div 
      className={`error-message ${className}`}
      style={{ ...baseStyles, ...typeStyles[type] }}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;
import React, { useState, useEffect } from 'react';
import { logger, LogCategory } from '../../utils/logger';
import './ErrorPages.css';

interface Error503Props {
  estimatedDowntime?: string;
  maintenanceMessage?: string;
}

const Error503: React.FC<Error503Props> = ({ 
  estimatedDowntime = "2 hours", 
  maintenanceMessage = "We're performing scheduled maintenance to improve your experience." 
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    // Auto-refresh check every 30 seconds
    const interval = setInterval(() => {
      // In a real app, this would check if the service is back online
      logger.debug('Performing service status check', LogCategory.UI);
    }, 30000);

    // Countdown timer (example for 2 hours from now)
    const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = endTime.getTime() - now;

      if (distance > 0) {
        const hours = Math.floor(distance / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Service should be restored');
      }
    };

    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdownInterval);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleNotifyMe = () => {
    // In a real app, this would subscribe to maintenance notifications
    alert('You will be notified when the service is restored.');
  };

  const handleStatusPage = () => {
    // In a real app, this would link to a status page
    window.open('https://status.petronas.com', '_blank');
  };

  return (
    <main className="error-page">
      <div className="error-container">
        <div className="error-icon">
          <span className="error-code error-503">503</span>
        </div>
        
        <div className="error-content">
          <h1 className="error-title">Service Temporarily Unavailable</h1>
          <p className="error-message">
            {maintenanceMessage}
          </p>
          <p className="error-description">
            We expect to be back online within <strong>{estimatedDowntime}</strong>. 
            Thank you for your patience as we work to improve our services.
          </p>
          
          {timeLeft && (
            <div className="maintenance-info">
              <div className="countdown-display">
                <h3>Estimated time remaining:</h3>
                <div className="countdown-timer">
                  {timeLeft}
                </div>
              </div>
            </div>
          )}

          <div className="maintenance-details">
            <h4>What's happening?</h4>
            <ul>
              <li>System updates and security patches</li>
              <li>Database optimization</li>
              <li>Performance improvements</li>
              <li>New feature deployment</li>
            </ul>
          </div>
        </div>

        <div className="error-actions">
          <button className="btn btn-primary" onClick={handleRefresh}>
            Check Again
          </button>
          <button className="btn btn-secondary" onClick={handleNotifyMe}>
            Notify Me
          </button>
          <button className="btn btn-tertiary" onClick={handleStatusPage}>
            Status Page
          </button>
        </div>
      </div>
    </main>
  );
};

export default Error503;
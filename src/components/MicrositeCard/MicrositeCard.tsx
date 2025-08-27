import React from 'react';
import { Microsite } from '../../types/microsite';

interface MicrositeCardProps {
  microsite: Microsite;
  onAccess: (microsite: Microsite) => void;
  onRequestAccess: (microsite: Microsite) => void;
}

const MicrositeCard: React.FC<MicrositeCardProps> = ({
  microsite,
  onAccess,
  onRequestAccess
}) => {
  const renderActionButton = () => {
    if (microsite.status === 'offline') {
      return (
        <button className="btn btn-secondary" disabled>
          SYSTEM OFFLINE
        </button>
      );
    }
    
    if (microsite.hasAccess) {
      return (
        <button 
          className="btn btn-primary"
          onClick={() => onAccess(microsite)}
        >
          GET STARTED
        </button>
      );
    }
    
    return (
      <button 
        className="btn btn-secondary"
        onClick={() => onRequestAccess(microsite)}
      >
        REQUEST ACCESS
      </button>
    );
  };

  return (
    <div className="microsite-card">
      <div 
        className="card-image" 
        style={{ background: microsite.gradient }}
      >
        <div className="card-logo">{microsite.icon}</div>
        <span className={`card-status ${microsite.status === 'online' ? 'status-online' : 'status-offline'}`}>
          {microsite.status === 'online' ? 'Online' : 'Offline'}
        </span>
      </div>
      
      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">{microsite.title}</h3>
          <span className={`access-badge ${microsite.hasAccess ? 'access-granted' : 'no-access'}`}>
            {microsite.hasAccess ? 'Access Granted' : 'No Access'}
          </span>
        </div>
        
        <p className="card-description">{microsite.description}</p>
        
        <div className="card-actions">
          {renderActionButton()}
          <button className="btn btn-secondary">
            Read More →
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicrositeCard;
import React from 'react';
import { Microsite } from '../../types/microsite';
import { User } from '../../types/auth';
import { Language } from '../../utils/translations';
import { useTranslation } from '../../utils/componentHelpers';

interface MicrositeCardProps {
  microsite: Microsite;
  onAccess: (microsite: Microsite) => void;
  onRequestAccess: (microsite: Microsite) => void;
  currentLanguage: Language;
  user: User | null;
}

const MicrositeCard: React.FC<MicrositeCardProps> = ({
  microsite,
  onAccess,
  onRequestAccess,
  currentLanguage,
  user
}) => {
  const t = useTranslation(currentLanguage);
  const renderActionButton = () => {
    if (microsite.status === 'offline') {
      return (
        <button className="btn btn-secondary" disabled>
          {t('systemOffline')}
        </button>
      );
    }
    
    // Check if user has access AND has the required groupId (if specified)
    const userHasGroupAccess = !microsite.groupId || 
      (user?.groupIds && user.groupIds.includes(microsite.groupId));
    
    if (microsite.hasAccess && userHasGroupAccess) {
      return (
        <button 
          className="btn btn-primary"
          onClick={() => onAccess(microsite)}
        >
          {t('getStarted')}
        </button>
      );
    }
    
    return (
      <button 
        className="btn btn-secondary"
        onClick={() => onRequestAccess(microsite)}
      >
        {t('requestAccess')}
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
          {microsite.status === 'online' ? t('online') : t('offline')}
        </span>
      </div>
      
      <div className="card-body">
        <div className="card-header">
          <h3 className="card-title">{microsite.title}</h3>
          <span className={`access-badge ${microsite.hasAccess ? 'access-granted' : 'no-access'}`}>
            {microsite.hasAccess ? t('accessGranted') : t('noAccess')}
          </span>
        </div>
        
        <p className="card-description">{microsite.description[currentLanguage as keyof typeof microsite.description]}</p>
        
        <div className="card-actions">
          {renderActionButton()}
          <button className="btn btn-secondary">
            {t('readMore')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MicrositeCard;
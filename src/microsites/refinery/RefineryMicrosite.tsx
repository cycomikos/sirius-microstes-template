import React from 'react';
import { MicrositeProps } from '../../types/microsite';
import MicrositeLayout from '../../components/MicrositeLayout/MicrositeLayout';
import './RefineryMicrosite.css';

const RefineryMicrosite: React.FC<MicrositeProps> = ({
  config,
  user,
  currentLanguage,
  sidebarExpanded,
  panelWidth
}) => {
  return (
    <MicrositeLayout
      config={config}
      currentLanguage={currentLanguage}
      sidebarExpanded={sidebarExpanded}
      panelWidth={panelWidth}
    >
      <div className="refinery-microsite">
        <div className="coming-soon-container">
          <div className="coming-soon-icon">🏭</div>
          <div className="coming-soon-title">
            {currentLanguage === 'en' ? 'Refinery Microsite' : 'Mikrosite Penapisan'}
          </div>
          <div className="coming-soon-message">
            {currentLanguage === 'en' 
              ? 'This microsite is coming soon. Stay tuned for refinery operations monitoring and analytics.'
              : 'Mikrosite ini akan datang tidak lama lagi. Nantikan pemantauan operasi penapisan dan analitik.'
            }
          </div>
        </div>
      </div>
    </MicrositeLayout>
  );
};

export default RefineryMicrosite;
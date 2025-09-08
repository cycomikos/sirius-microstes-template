import React from 'react';
import { MicrositeProps } from '../../types/microsite';
import MicrositeLayout from '../../components/MicrositeLayout/MicrositeLayout';

const SustainabilityMicrosite: React.FC<MicrositeProps> = ({
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
      <div className="sustainability-microsite">
        <div className="coming-soon-container">
          <div className="coming-soon-icon">🌱</div>
          <div className="coming-soon-title">
            {currentLanguage === 'en' ? 'Sustainability Hub' : 'Hub Kelestarian'}
          </div>
          <div className="coming-soon-message">
            {currentLanguage === 'en' 
              ? 'This microsite is coming soon. Stay tuned for environmental monitoring and sustainability metrics.'
              : 'Mikrosite ini akan datang tidak lama lagi. Nantikan pemantauan alam sekitar dan metrik kelestarian.'
            }
          </div>
        </div>
      </div>
    </MicrositeLayout>
  );
};

export default SustainabilityMicrosite;
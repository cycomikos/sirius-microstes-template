import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useMicrositeRegistry } from '../../services/micrositeRegistry';
import MicrositeCard from '../MicrositeCard/MicrositeCard';
import { MicrositeConfig } from '../../types/microsite';
import './MicrositeLanding.css';

interface MicrositeLandingProps {
  sidebarExpanded: boolean;
  panelWidth: number;
}

const MicrositeLanding: React.FC<MicrositeLandingProps> = ({
  sidebarExpanded,
  panelWidth
}) => {
  const { state } = useAuth();
  const { currentLanguage } = useLanguage();
  const { getAccessibleConfigs, getAllConfigs } = useMicrositeRegistry();
  
  const [accessibleMicrosites, setAccessibleMicrosites] = React.useState<MicrositeConfig[]>([]);
  const [comingSoonMicrosites, setComingSoonMicrosites] = React.useState<MicrositeConfig[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadMicrosites = async () => {
      try {
        const userGroups = state.user?.groups || [];
        
        // Get microsites user has access to
        const accessible = getAccessibleConfigs(userGroups);
        setAccessibleMicrosites(accessible);
        
        // Get coming soon microsites
        const allMicrosites = getAllConfigs();
        const comingSoon = allMicrosites.filter(config => 
          config.status === 'coming-soon' || 
          (config.status === 'active' && !userGroups.includes(config.requiredGroupId))
        );
        setComingSoonMicrosites(comingSoon);
        
      } catch (error) {
        console.error('Failed to load microsites:', error);
      } finally {
        setLoading(false);
      }
    };

    if (state.user) {
      loadMicrosites();
    }
  }, [state.user, getAccessibleConfigs, getAllConfigs]);

  const handleMicrositeClick = (microsite: MicrositeConfig) => {
    if (microsite.status === 'active') {
      window.location.href = `/sirius-microsites${microsite.path}`;
    }
  };

  if (loading) {
    return (
      <div className="microsite-loading">
        <div className="loading-spinner"></div>
        <div className="loading-text">
          {currentLanguage === 'en' ? 'Loading microsites...' : 'Memuatkan mikrosite...'}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="microsite-landing"
      style={{
        marginLeft: sidebarExpanded ? `${panelWidth}px` : '60px',
        transition: 'margin-left 0.3s ease-in-out'
      }}
    >
      {/* Header */}
      <div className="landing-header">
        <div className="header-content">
          <h1 className="landing-title">
            {currentLanguage === 'en' ? 'SIRIUS Microsites' : 'Mikrosite SIRIUS'}
          </h1>
          <p className="landing-description">
            {currentLanguage === 'en' 
              ? 'Access specialized data platforms and analytics tools for different business units'
              : 'Akses platform data khusus dan alat analitik untuk unit perniagaan yang berbeza'
            }
          </p>
        </div>
      </div>

      {/* User Info */}
      <div className="user-info">
        <div className="user-welcome">
          {currentLanguage === 'en' ? 'Welcome' : 'Selamat datang'}, {state.user?.fullName || state.user?.username}
        </div>
        <div className="user-access">
          {currentLanguage === 'en' 
            ? `You have access to ${accessibleMicrosites.length} microsite${accessibleMicrosites.length !== 1 ? 's' : ''}`
            : `Anda mempunyai akses kepada ${accessibleMicrosites.length} mikrosite`
          }
        </div>
      </div>

      {/* Accessible Microsites */}
      {accessibleMicrosites.length > 0 && (
        <div className="microsites-section">
          <h2 className="section-title">
            {currentLanguage === 'en' ? 'Your Microsites' : 'Mikrosite Anda'}
          </h2>
          <div className="microsites-grid">
            {accessibleMicrosites.map(microsite => (
              <MicrositeCard
                key={microsite.id}
                microsite={{
                  id: microsite.id,
                  title: microsite.title[currentLanguage],
                  description: microsite.description,
                  status: microsite.status === 'active' ? 'online' : 'offline',
                  hasAccess: true,
                  icon: microsite.icon,
                  gradient: `linear-gradient(135deg, ${microsite.theme.primary}, ${microsite.theme.secondary})`,
                  country: 'Malaysia', // Default or derive from config
                  groupId: microsite.requiredGroupId
                }}
                onAccess={() => handleMicrositeClick(microsite)}
                onRequestAccess={() => {}}
                currentLanguage={currentLanguage}
                user={state.user}
              />
            ))}
          </div>
        </div>
      )}

      {/* Coming Soon / No Access */}
      {comingSoonMicrosites.length > 0 && (
        <div className="microsites-section">
          <h2 className="section-title">
            {currentLanguage === 'en' ? 'Coming Soon / Restricted' : 'Akan Datang / Terhad'}
          </h2>
          <div className="microsites-grid">
            {comingSoonMicrosites.map(microsite => (
              <MicrositeCard
                key={microsite.id}
                microsite={{
                  id: microsite.id,
                  title: microsite.title[currentLanguage],
                  description: microsite.description,
                  status: 'offline',
                  hasAccess: false,
                  icon: microsite.icon,
                  gradient: `linear-gradient(135deg, ${microsite.theme.primary}40, ${microsite.theme.secondary}40)`,
                  country: 'Malaysia',
                  groupId: microsite.requiredGroupId
                }}
                onAccess={() => {}}
                onRequestAccess={() => {}}
                currentLanguage={currentLanguage}
                user={state.user}
              />
            ))}
          </div>
        </div>
      )}

      {/* No Microsites Message */}
      {accessibleMicrosites.length === 0 && comingSoonMicrosites.length === 0 && (
        <div className="no-microsites">
          <div className="no-microsites-icon">🏢</div>
          <div className="no-microsites-title">
            {currentLanguage === 'en' ? 'No Microsites Available' : 'Tiada Mikrosite Tersedia'}
          </div>
          <div className="no-microsites-text">
            {currentLanguage === 'en' 
              ? 'Contact your administrator to request access to microsites.'
              : 'Hubungi pentadbir anda untuk meminta akses kepada mikrosite.'
            }
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="landing-footer">
        <div className="footer-text">
          {currentLanguage === 'en'
            ? 'Powered by ArcGIS Enterprise • PETRONAS Digital'
            : 'Dikuasakan oleh ArcGIS Enterprise • PETRONAS Digital'
          }
        </div>
      </div>
    </div>
  );
};

export default MicrositeLanding;
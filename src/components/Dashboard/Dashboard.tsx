import React, { useState, useEffect } from 'react';
import { CountryCode, Microsite } from '../../types/microsite';
import { COUNTRIES } from '../../data/microsites';
import { useMicrosites } from '../../hooks/useMicrosites';
import { getTranslation, Language, translations } from '../../utils/translations';
import MicrositeCard from '../MicrositeCard/MicrositeCard';
import './Dashboard.css';

interface DashboardProps {
  currentLanguage: Language;
  sidebarExpanded: boolean;
  panelWidth: number;
}

const Dashboard: React.FC<DashboardProps> = ({ currentLanguage, sidebarExpanded, panelWidth }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 8;
  
  // Helper function to get translated text
  const t = (key: keyof typeof translations.en) => getTranslation(key, currentLanguage);
  
  const {
    selectedCountry,
    filteredMicrosites,
    handleCountryChange,
    handleMicrositeAccess
  } = useMicrosites();

  const handleMicrositeClick = (microsite: Microsite) => {
    setError(null);
    const result = handleMicrositeAccess(microsite);
    
    if (!result.canAccess) {
      setError(result.message || t('accessDenied'));
      return;
    }
    
    // Navigate to microsite
    console.log('Navigating to:', microsite.title);
  };

  const handleRequestAccess = (microsite: Microsite) => {
    // In a real app, this would make an API call
    setError(`${t('accessRequestSubmitted')} ${microsite.title}`);
    // Clear message after 3 seconds
    setTimeout(() => setError(null), 3000);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredMicrosites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMicrosites = filteredMicrosites.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the grid
    document.querySelector('.microsites-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset to page 1 when country changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCountry]);

  // Calculate the content margin and available width based on sidebar state
  const contentMargin = sidebarExpanded ? `${60 + panelWidth}px` : '60px';
  const availableWidth = sidebarExpanded ? `calc(100vw - ${60 + panelWidth}px)` : 'calc(100vw - 60px)';
  
  return (
    <main 
      className="content-area"
      style={{
        marginLeft: contentMargin,
        width: availableWidth,
        transition: 'margin-left 0.3s ease, width 0.3s ease'
      } as React.CSSProperties}
    >
      <div className="country-selector">
        <label htmlFor="country-select">{t('selectCountry')}</label>
        <select 
          className="country-dropdown"
          value={selectedCountry}
          onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
        >
          {COUNTRIES.map(country => (
            <option key={country.value} value={country.value}>
              {country.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#fee', color: '#c33', border: '1px solid #fcc', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div className="microsites-grid">
        {paginatedMicrosites.filter(Boolean).map(microsite => (
          <MicrositeCard
            key={microsite.id}
            microsite={microsite}
            onAccess={handleMicrositeClick}
            onRequestAccess={handleRequestAccess}
            currentLanguage={currentLanguage}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button 
              key={page}
              className={`page-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </main>
  );
};

export default Dashboard;
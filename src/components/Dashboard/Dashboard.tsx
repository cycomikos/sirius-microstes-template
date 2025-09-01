import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CountryCode, Microsite } from '../../types/microsite';
import { COUNTRIES } from '../../data/microsites';
import { useMicrosites } from '../../hooks/useMicrosites';
import { Language } from '../../utils/translations';
import { useTranslation, createPageRange, scrollToElement, calculateLayoutStyles, createErrorHandler } from '../../utils/componentHelpers';
import MicrositeCard from '../MicrositeCard/MicrositeCard';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import './Dashboard.css';

interface DashboardProps {
  currentLanguage: Language;
  sidebarExpanded: boolean;
  panelWidth: number;
}

const ITEMS_PER_PAGE = 8;
const ERROR_DISPLAY_DURATION = 3000;

const Dashboard: React.FC<DashboardProps> = ({ currentLanguage, sidebarExpanded, panelWidth }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const t = useTranslation(currentLanguage);
  
  const {
    selectedCountry,
    filteredMicrosites,
    handleCountryChange,
    handleMicrositeAccess
  } = useMicrosites();

  const handleMicrositeClick = useCallback((microsite: Microsite) => {
    setError(null);
    const result = handleMicrositeAccess(microsite);
    
    if (!result.canAccess) {
      setError(result.message || t('accessDenied'));
      return;
    }
    
    console.log('Navigating to:', microsite.title);
  }, [handleMicrositeAccess, t]);

  const showError = useMemo(() => createErrorHandler(setError, { duration: ERROR_DISPLAY_DURATION }), []);

  const handleRequestAccess = useCallback((microsite: Microsite) => {
    showError(`${t('accessRequestSubmitted')} ${microsite.title}`);
  }, [t, showError]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredMicrosites.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedMicrosites = filteredMicrosites.slice(startIndex, endIndex);
    
    return { totalPages, paginatedMicrosites };
  }, [filteredMicrosites, currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    scrollToElement('.microsites-grid');
  }, []);

  // Reset to page 1 when country changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCountry]);

  const layoutStyles = useMemo(() => 
    calculateLayoutStyles(sidebarExpanded, panelWidth),
    [sidebarExpanded, panelWidth]
  );
  
  return (
    <main className="content-area" style={layoutStyles}>
      <div className="content-wrapper">
        <div className="country-selector">
          <label htmlFor="country-select">{t('selectCountry')}</label>
          <select
            id="country-select"
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

        <ErrorMessage message={error} type="error" />

        <div className="microsites-grid">
          {paginationData.paginatedMicrosites.filter(Boolean).map(microsite => (
            <MicrositeCard
              key={microsite.id}
              microsite={microsite}
              onAccess={handleMicrositeClick}
              onRequestAccess={handleRequestAccess}
              currentLanguage={currentLanguage}
            />
          ))}
        </div>

        {paginationData.totalPages > 1 && (
          <div className="pagination">
            {createPageRange(paginationData.totalPages).map(page => (
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
      </div>
    </main>
  );
};

export default Dashboard;
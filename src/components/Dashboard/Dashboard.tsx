import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CountryCode, Microsite } from '../../types/microsite';
import { useMicrosites } from '../../hooks/useMicrosites';
import { Language } from '../../utils/translations';
import { useTranslation, createPageRange, scrollToElement, calculateLayoutStyles, createErrorHandler } from '../../utils/componentHelpers';
import { authLogger } from '../../utils/logger';
import MicrositeCard from '../MicrositeCard/MicrositeCard';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import './Dashboard.css';

interface DashboardProps {
  currentLanguage: Language;
  sidebarExpanded: boolean;
  panelWidth: number;
}

const ITEMS_PER_PAGE = 8; // Force 8 items per page
const ERROR_DISPLAY_DURATION = 3000;

const Dashboard: React.FC<DashboardProps> = ({ currentLanguage, sidebarExpanded, panelWidth }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const t = useTranslation(currentLanguage);
  
  const {
    selectedCountry,
    filteredMicrosites,
    countries,
    loading,
    error: dataError,
    handleCountryChange,
    handleMicrositeAccess,
    refreshData
  } = useMicrosites();

  const handleMicrositeClick = useCallback((microsite: Microsite) => {
    setError(null);
    const result = handleMicrositeAccess(microsite);
    
    if (!result.canAccess) {
      setError(result.message || t('accessDenied'));
      return;
    }
    
    authLogger.debug('Navigating to microsite', { title: microsite.title });
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

  const breadcrumbItems = useMemo(() => [
    { 
      label: t('home'), 
      isActive: true,
      ariaLabel: `${t('home')} - Current page`
    }
  ], [t]);

  const handleBreadcrumbNavigate = useCallback((href: string) => {
    authLogger.debug('Navigating to breadcrumb', { href });
    // Handle navigation logic here if needed
    // For example: window.location.href = href; or use React Router
  }, []);
  
  return (
    <main className="content-area" style={layoutStyles}>
      <div className="content-wrapper">
        <Breadcrumb 
          items={breadcrumbItems} 
          currentLanguage={currentLanguage}
          onNavigate={handleBreadcrumbNavigate}
        />
        
        <div className="country-selector">
          <label htmlFor="country-select">{t('selectCountry')}</label>
          <select
            id="country-select"
            className="country-dropdown"
            value={selectedCountry}
            onChange={(e) => handleCountryChange(e.target.value as CountryCode)}
          >
            {countries.map(country => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>

        <ErrorMessage message={error || dataError} type="error" />

        {dataError && (
          <div className="error-actions">
            <button 
              onClick={refreshData} 
              className="retry-button"
              disabled={loading}
            >
              {loading ? t('loading') : t('refresh')}
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>{t('loading')}</p>
          </div>
        ) : (
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
        )}

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
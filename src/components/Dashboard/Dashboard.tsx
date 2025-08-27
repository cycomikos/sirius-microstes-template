import React, { useState } from 'react';
import { CountryCode, Microsite } from '../../types/microsite';
import { COUNTRIES } from '../../data/microsites';
import { useMicrosites } from '../../hooks/useMicrosites';
import MicrositeCard from '../MicrositeCard/MicrositeCard';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [currentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
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
      setError(result.message || 'Access denied');
      return;
    }
    
    // Navigate to microsite
    console.log('Navigating to:', microsite.title);
  };

  const handleRequestAccess = (microsite: Microsite) => {
    // In a real app, this would make an API call
    setError(`Access request submitted for: ${microsite.title}`);
    // Clear message after 3 seconds
    setTimeout(() => setError(null), 3000);
  };

  return (
    <main className="content-area">
      <div className="country-selector">
        <label htmlFor="country-select">Select Country</label>
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
        {filteredMicrosites.map(microsite => (
          <MicrositeCard
            key={microsite.id}
            microsite={microsite}
            onAccess={handleMicrositeClick}
            onRequestAccess={handleRequestAccess}
          />
        ))}
      </div>

      <div className="pagination">
        <button className={`page-btn ${currentPage === 1 ? 'active' : ''}`}>
          1
        </button>
        <button className={`page-btn ${currentPage === 2 ? 'active' : ''}`}>
          2
        </button>
      </div>
    </main>
  );
};

export default Dashboard;
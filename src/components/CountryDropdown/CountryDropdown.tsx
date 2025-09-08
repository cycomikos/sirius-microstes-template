import React from 'react';
import { CountryCode } from '../../types/microsite';
import { Language } from '../../utils/translations';
import { useTranslation } from '../../utils/componentHelpers';
import './CountryDropdown.css';

interface CountryWithCount {
  value: string;
  label: string;
  count: number;
}

interface CountryDropdownProps {
  selectedCountry: CountryCode;
  countries: CountryWithCount[];
  onCountryChange: (country: CountryCode) => void;
  currentLanguage: Language;
  showCounts?: boolean;
  disabled?: boolean;
  className?: string;
}

const CountryDropdown: React.FC<CountryDropdownProps> = ({
  selectedCountry,
  countries,
  onCountryChange,
  currentLanguage,
  showCounts = true,
  disabled = false,
  className = ''
}) => {
  const t = useTranslation(currentLanguage);

  return (
    <div className={`country-selector ${className}`}>
      <label htmlFor="country-select" className="country-label">
        {t('selectCountry')}
      </label>
      <select
        id="country-select"
        className="country-dropdown"
        value={selectedCountry}
        onChange={(e) => onCountryChange(e.target.value as CountryCode)}
        disabled={disabled}
        aria-describedby="country-help"
      >
        {countries.map(country => (
          <option key={country.value} value={country.value}>
            {showCounts 
              ? `${country.label} (${country.count})` 
              : country.label
            }
          </option>
        ))}
      </select>
      {showCounts && (
        <small id="country-help" className="country-help-text">
          Numbers show available microsites
        </small>
      )}
    </div>
  );
};

export default CountryDropdown;
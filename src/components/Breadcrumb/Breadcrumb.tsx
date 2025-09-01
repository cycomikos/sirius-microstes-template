import React, { useCallback } from 'react';
import { CalciteIcon } from '@esri/calcite-components-react';
import { Language } from '../../utils/translations';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
  ariaLabel?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  currentLanguage: Language;
  className?: string;
  loading?: boolean;
  onNavigate?: (href: string, item: BreadcrumbItem) => void;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items, 
  currentLanguage, 
  className = '', 
  loading = false,
  onNavigate 
}) => {
  const handleLinkClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, item: BreadcrumbItem) => {
    e.preventDefault();
    
    if (item.onClick) {
      item.onClick();
    } else if (onNavigate && item.href) {
      onNavigate(item.href, item);
    }
  }, [onNavigate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLAnchorElement>, item: BreadcrumbItem) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      
      if (item.onClick) {
        item.onClick();
      } else if (onNavigate && item.href) {
        onNavigate(item.href, item);
      }
    }
  }, [onNavigate]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav 
      className={`breadcrumb-nav ${loading ? 'loading' : ''} ${className}`} 
      aria-label="breadcrumb navigation"
      role="navigation"
    >
      <ol className="breadcrumb-list" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isClickable = (item.href && !item.isActive) || item.onClick;
          
          return (
            <li 
              key={`${item.label}-${index}`} 
              className={`breadcrumb-item ${item.isActive ? 'active' : ''}`}
              itemProp="itemListElement" 
              itemScope 
              itemType="https://schema.org/ListItem"
            >
              {index > 0 && (
                <CalciteIcon 
                  icon="chevron-right" 
                  scale="s" 
                  className="breadcrumb-separator"
                  aria-hidden="true"
                />
              )}
              
              {isClickable ? (
                <a 
                  href={item.href || '#'} 
                  className="breadcrumb-link"
                  onClick={(e) => handleLinkClick(e, item)}
                  onKeyDown={(e) => handleKeyDown(e, item)}
                  aria-label={item.ariaLabel || `Navigate to ${item.label}`}
                  tabIndex={0}
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </a>
              ) : (
                <span 
                  className="breadcrumb-current" 
                  aria-current={item.isActive || isLast ? 'page' : undefined}
                  aria-label={item.ariaLabel || `Current page: ${item.label}`}
                  itemProp="name"
                >
                  {item.label}
                </span>
              )}
              
              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '../constants';

export const useSidebar = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState('applications');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth <= BREAKPOINTS.MOBILE) {
      // Mobile behavior
      setIsMobileOpen(!isMobileOpen);
    } else {
      // Desktop behavior
      setSidebarExpanded(!sidebarExpanded);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  const handlePanelChange = (panel: string) => {
    setActivePanel(panel);
    
    // Auto-expand sidebar when selecting a panel on desktop
    if (!sidebarExpanded && window.innerWidth > BREAKPOINTS.MOBILE) {
      setSidebarExpanded(true);
    }
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > BREAKPOINTS.MOBILE) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobileOpen && window.innerWidth <= BREAKPOINTS.MOBILE) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && !sidebar.contains(event.target as Node)) {
          const target = event.target as HTMLElement;
          // Don't close if clicking on menu toggle
          if (!target.closest('.menu-toggle')) {
            setIsMobileOpen(false);
          }
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMobileOpen]);

  return {
    sidebarExpanded,
    activePanel,
    isMobileOpen,
    toggleSidebar,
    closeMobileSidebar,
    handlePanelChange
  };
};
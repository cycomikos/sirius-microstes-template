import React, { useState, useEffect, useCallback } from 'react';
import { BREAKPOINTS } from '../constants';

export const useSidebar = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [activePanel, setActivePanel] = useState('applications');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem('sirius-panel-width');
    return saved ? parseInt(saved) : 400;
  });
  const [isResizing, setIsResizing] = useState(false);

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
    // If clicking the same panel twice, close it
    if (activePanel === panel && sidebarExpanded) {
      setSidebarExpanded(false);
      return;
    }
    
    setActivePanel(panel);
    
    // Auto-expand sidebar when selecting a panel on desktop
    if (!sidebarExpanded && window.innerWidth > BREAKPOINTS.MOBILE) {
      setSidebarExpanded(true);
    }
    
    // Auto-resize panel for data and version panels if current width is too small
    if ((panel === 'data' || panel === 'version') && panelWidth < 500) {
      setPanelWidth(500);
      localStorage.setItem('sirius-panel-width', '500');
    }
  };

  // Handle panel resize functionality
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const sidebarElement = document.querySelector('.sidebar');
    
    if (!sidebarElement) return;
    
    const sidebarRect = sidebarElement.getBoundingClientRect();
    
    // Calculate new width based on mouse position relative to sidebar's left edge
    // Subtract 60px for the sidebar navigation width
    const newWidth = e.clientX - sidebarRect.left - 60;
    const minWidth = 200;
    const maxWidth = 600;
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setPanelWidth(newWidth);
    }
  }, [isResizing]);

  const handleResizeEnd = useCallback(() => {
    if (isResizing) {
      setIsResizing(false);
      localStorage.setItem('sirius-panel-width', panelWidth.toString());
    }
  }, [isResizing, panelWidth]);

  // Handle resize events
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

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
    panelWidth,
    isResizing,
    toggleSidebar,
    closeMobileSidebar,
    handlePanelChange,
    handleResizeStart
  };
};
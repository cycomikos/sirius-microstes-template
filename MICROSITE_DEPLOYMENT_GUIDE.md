# SIRIUS Microsites Deployment Guide

## Overview

This guide covers the deployment of the scalable SIRIUS microsite architecture that supports:
- **Main Landing**: https://publicgis.petronas.com/sirius-microsites  
- **E&P Microsite**: https://publicgis.petronas.com/sirius-microsites/ep
- **Future Microsites**: https://publicgis.petronas.com/sirius-microsites/[microsite-id]

## Architecture Summary

### 🏗️ **Scalable & Modular Design**
- **Configuration-driven**: All microsites defined in `src/config/microsites.config.ts`
- **Dynamic loading**: Components loaded on-demand with code splitting
- **Group-based access**: Each microsite requires specific ArcGIS Enterprise group membership
- **Shared infrastructure**: Common components, services, and authentication

### 📁 **File Structure**
```
src/
├── config/
│   └── microsites.config.ts           # Central microsite configuration
├── services/
│   ├── micrositeRegistry.ts           # Dynamic component registry
│   └── micrositeService.ts            # Data fetching service
├── components/
│   ├── MicrositeLayout/               # Shared microsite layout
│   ├── MicrositeLanding/              # Main microsites landing page
│   ├── MicrositeRouter/               # Dynamic routing system
│   └── ProtectedMicrositeRoute/       # Access control wrapper
└── microsites/
    ├── ep/                            # E&P Microsite implementation
    │   ├── EPMicrosite.tsx
    │   └── components/
    │       ├── EPDashboard.tsx
    │       ├── EPMaps.tsx
    │       └── EPAnalytics.tsx
    └── [future-microsites]/           # Future microsite implementations
```

## Deployment Steps

### 1. **Environment Configuration**

Update your `.env` file:
```bash
# Base path for microsite deployment
REACT_APP_MICROSITE_BASE_PATH=/sirius-microsites

# E&P Microsite group ID  
REACT_APP_EP_GROUP_ID=4a8b631d6f384dd8b8ca5b91c10c22f6

# Portal configuration
REACT_APP_PORTAL_URL=https://your-arcgis-enterprise.com/portal
REACT_APP_ARCGIS_APP_ID=your-app-id
```

### 2. **Package.json Updates**

Update the homepage in `package.json`:
```json
{
  "homepage": "/sirius-microsites",
  "scripts": {
    "start": "craco start",
    "build": "craco build",
    "build:microsites": "npm run build"
  }
}
```

### 3. **Web Server Configuration**

#### **Apache (.htaccess)**
```apache
RewriteEngine On
RewriteBase /sirius-microsites/

# Handle React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /sirius-microsites/index.html [L]

# Security headers
Header always set X-Frame-Options SAMEORIGIN
Header always set X-Content-Type-Options nosniff
```

#### **Nginx**
```nginx
location /sirius-microsites {
    alias /var/www/sirius-microsites;
    try_files $uri $uri/ /sirius-microsites/index.html;
    
    # Security headers
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-Content-Type-Options nosniff;
}
```

### 4. **Build and Deploy**

```bash
# Build the application
npm run build

# Deploy to web server
cp -r build/* /var/www/sirius-microsites/

# Set proper permissions
chmod -R 755 /var/www/sirius-microsites/
```

## Adding New Microsites

### 1. **Update Configuration**

Add new microsite to `src/config/microsites.config.ts`:

```typescript
export const MICROSITE_CONFIGS: Record<string, MicrositeConfig> = {
  // Existing microsites...
  
  newMicrosite: {
    id: 'new-microsite',
    path: '/new-microsite',
    title: {
      en: 'New Microsite',
      bm: 'Mikrosite Baharu'
    },
    description: {
      en: 'Description of new microsite',
      bm: 'Penerangan mikrosite baharu'
    },
    icon: '🏢',
    color: '#2196f3',
    requiredGroupId: 'your-arcgis-group-id',
    requiredGroupName: 'Your ArcGIS Group Name',
    status: 'active',
    features: ['maps', 'dashboard'],
    mapConfig: {
      defaultExtent: { /* your extent */ },
      defaultZoom: 6,
      basemap: 'hybrid'
    },
    layout: 'map-focused',
    theme: {
      primary: '#2196f3',
      secondary: '#1976d2',
      accent: '#ff9800'
    },
    metadata: {
      createdBy: 'Your Team',
      createdDate: '2024-09-08',
      lastModified: '2024-09-08',
      version: '1.0.0'
    }
  }
};
```

### 2. **Create Microsite Component**

Create `src/microsites/new-microsite/NewMicrosite.tsx`:

```typescript
import React from 'react';
import { MicrositeProps } from '../../types/microsite';
import MicrositeLayout from '../../components/MicrositeLayout/MicrositeLayout';

const NewMicrosite: React.FC<MicrositeProps> = ({
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
      <div className="new-microsite">
        {/* Your microsite content */}
      </div>
    </MicrositeLayout>
  );
};

export default NewMicrosite;
```

### 3. **Register in Registry**

Update `src/services/micrositeRegistry.ts`:

```typescript
// In initializeRegistry() method
this.register('new-microsite', {
  config: MICROSITE_CONFIGS.newMicrosite,
  component: () => import('../microsites/new-microsite/NewMicrosite')
});
```

## URL Structure

### **Main Routes**
- `/sirius-microsites` → Main landing page (requires Sirius Users group)
- `/sirius-microsites/microsites` → Microsite selection page  
- `/sirius-microsites/microsites/ep` → E&P microsite (requires specific group)

### **E&P Microsite Routes**
- `/sirius-microsites/microsites/ep` → EP Dashboard
- `/sirius-microsites/microsites/ep/dashboard` → EP Dashboard  
- `/sirius-microsites/microsites/ep/maps` → EP Maps
- `/sirius-microsites/microsites/ep/analytics` → EP Analytics

## Access Control

### **Group Requirements**
1. **Sirius Users Group**: Required for main portal access
2. **Group ID: `4a8b631d6f384dd8b8ca5b91c10c22f6`**: Required for E&P microsite access
3. **Future Groups**: Each new microsite can have its own group requirement

### **Access Flow**
1. User authenticates with ArcGIS Enterprise
2. System checks user's group memberships
3. Only accessible microsites are shown/accessible
4. Unauthorized access attempts show 403 error

## Performance Optimization

### **Code Splitting**
- Microsites are loaded dynamically using React.lazy()
- Each microsite bundle is separate
- Main application bundle contains only core functionality

### **Caching Strategy**
- Microsite data cached for 5 minutes
- Component cache for loaded microsites
- Browser caching for static assets

### **Lazy Loading**
```typescript
// Microsites are automatically lazy loaded
const EPMicrosite = React.lazy(() => import('../microsites/ep/EPMicrosite'));
```

## Monitoring & Analytics

### **Metrics to Track**
- Microsite load times
- User access patterns
- Component loading success rates
- Cache hit ratios

### **Error Handling**
- Component loading failures gracefully handled
- User-friendly error messages
- Automatic fallbacks to main portal

## Security Considerations

### **Access Control**
- Group-based authentication via ArcGIS Enterprise
- No client-side group validation bypass possible
- Secure token handling

### **Data Protection**
- All data fetched through authenticated ArcGIS Enterprise APIs
- Group-specific data isolation
- Secure transmission over HTTPS

## Troubleshooting

### **Common Issues**

1. **Microsite not loading**
   - Check group membership in ArcGIS Enterprise
   - Verify group ID in configuration
   - Check browser console for errors

2. **Component loading errors**
   - Verify component exports
   - Check registry registration
   - Ensure proper file paths

3. **Access denied errors**
   - Confirm user group membership
   - Verify group ID matches exactly
   - Check ArcGIS Enterprise group settings

### **Debug Mode**
Enable debug logging:
```javascript
localStorage.setItem('debug', 'true');
```

## Future Enhancements

### **Planned Features**
- [ ] Microsite usage analytics
- [ ] Custom themes per microsite
- [ ] Advanced caching strategies
- [ ] Microsite health monitoring
- [ ] A/B testing framework

### **Scalability**
- Support for unlimited microsites
- Plugin-based architecture
- Dynamic configuration loading
- Microservice-ready structure

---

**Contact**: UTDI Team - Upstream Technology, Digital, & Innovation  
**Last Updated**: September 8, 2024
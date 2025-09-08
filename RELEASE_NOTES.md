# SIRIUS Microsite Application - Release Notes

## Version 0.1.0 - Initial Release
*Release Date: September 2025*

### 🎉 **New Features**

#### **Authentication & Security**
- **ArcGIS Enterprise OAuth Integration**
  - Seamless single sign-on with PETRONAS ArcGIS Enterprise portal
  - Automatic session management and credential persistence
  - OAuth callback handling with error recovery

- **Group-Based Access Control**
  - Role-based permissions using ArcGIS Enterprise groups
  - Support for admin groups: `admin`, `gis_admin`, `petronas_admin`
  - Support for user groups: `users`, `gis_users`, `petronas_users`, `sirius_users`
  - Protected routes with automatic access validation

- **Session Management**
  - Automatic session checking on app load
  - Persistent authentication state across browser sessions
  - Graceful handling of expired sessions

#### **Dashboard & Navigation**
- **Microsite Gallery**
  - Visual card-based layout for microsite discovery
  - Country-based filtering (Malaysia, Singapore, UAE, Canada)
  - Pagination support (8 items per page)
  - Quick access to microsite descriptions and links

- **Smart Navigation**
  - Breadcrumb navigation for clear path tracking
  - Responsive sidebar with collapsible panels
  - Mobile-optimized navigation menu
  - App launcher with quick access to all PETRONAS applications

#### **Maps & Geospatial Features**
- **ArcGIS Maps Integration**
  - Full-featured interactive maps using ArcGIS JavaScript API v4.33
  - Dedicated Maps and Scenes section
  - EsriMapView component with advanced mapping capabilities
  - Seamless integration with ArcGIS Enterprise services

#### **User Experience**
- **Modern UI/UX**
  - Calcite Design System components for consistent ESRI experience
  - Dark/Light theme toggle with user preference persistence
  - Responsive design optimized for desktop, tablet, and mobile
  - Smooth animations and transitions

- **Multi-Language Support**
  - English and Bahasa Malaysia language options
  - Dynamic language switching with state persistence
  - Localized error messages and UI text

- **Accessibility**
  - WCAG compliant components via Calcite Design System
  - Keyboard navigation support
  - Screen reader friendly interface
  - High contrast theme support

#### **Error Handling & Recovery**
- **Comprehensive Error Pages**
  - Custom error pages for 400, 403, 404, 500, and 503 status codes
  - User-friendly error messages with recovery suggestions
  - Automatic fallback to public portal for authentication failures

- **Error Boundary Protection**
  - React error boundaries to prevent application crashes
  - Graceful error recovery with user feedback
  - Detailed error logging for troubleshooting

### 🏢 **Supported Microsites**

#### **Malaysia Operations**
- **Refinery Operations** - Monitoring and operations dashboard
- **Exploration Hub** - Geological data and exploration projects
- **Safety Portal** - Safety incidents and compliance tracking

#### **Singapore Operations**
- **Supply Chain** - Vendor management and procurement
- **Trading Hub** - Oil trading and market analytics

#### **UAE Operations**
- **Environmental** - Environmental monitoring and sustainability
- **Logistics Center** - Logistics and distribution management

#### **Canada Operations**
- **Upstream Operations** - Oil and gas upstream operations
- **HR Portal** - Human resources and employee services

### 🔧 **Technical Specifications**

#### **Frontend Stack**
- **React 18.2.0** with TypeScript for type-safe development
- **React Router 6.8.0** for client-side routing
- **ArcGIS JavaScript API 4.33.0** for geospatial functionality
- **Calcite Components 3.2.0** for UI components

#### **Build & Development**
- **CRACO 7.1.0** for Create React App configuration override
- **TypeScript 4.9.5** for enhanced development experience
- **Modern ES6+ JavaScript** with optimized production builds

#### **Authentication**
- **ArcGIS Identity Manager** for credential management
- **OAuth 2.0** flow with PETRONAS ArcGIS Enterprise
- **Group-based authorization** with real-time validation

### 🚀 **Deployment Features**

#### **Production Ready**
- **Environment Configuration**
  - Configurable portal URLs and application IDs
  - Production/development environment separation
  - Secure credential management

- **Web Server Compatibility**
  - IIS deployment support with proper routing
  - Static asset optimization with correct path handling
  - HTTPS requirement compliance

#### **Performance Optimizations**
- **Code Splitting** for optimal loading performance
- **Lazy Loading** of components and routes
- **Source Map Generation** configurable for production
- **Optimized Bundle Size** with tree shaking

### 🛡️ **Security Features**

#### **Data Protection**
- **HTTPS Enforcement** for all communications
- **Secure Cookie Handling** for session management
- **CORS Configuration** for secure API calls
- **No Sensitive Data Exposure** in client-side code

#### **Access Control**
- **Real-time Group Membership Validation**
- **Automatic Session Expiry Handling**
- **Secure OAuth Token Management**
- **Role-based Route Protection**

### 📱 **Mobile Support**

#### **Responsive Design**
- **Mobile-First Approach** with progressive enhancement
- **Touch-Optimized Interface** for mobile interactions
- **Collapsible Navigation** for small screens
- **Optimized Performance** on mobile networks

### 🔍 **Known Limitations**

#### **Current Version Constraints**
- Microsite data is currently static (future versions will support dynamic loading)
- Language switching requires page refresh for some components
- Map features require active ArcGIS Enterprise connection
- Mobile landscape mode may require scroll for full content visibility

### 📋 **Installation & Setup**

#### **Prerequisites**
- Node.js 16.18.0 or higher
- npm 8.0 or higher
- Valid ArcGIS Enterprise account
- HTTPS-enabled web server for production

#### **Environment Variables**
```env
REACT_APP_PORTAL_URL=https://publicgis.petronas.com/arcgis
REACT_APP_ARCGIS_APP_ID=TQrCz7k3L13OePcx
REACT_APP_REDIRECT_URI=https://publicgis.petronas.com/sirius-microsites/auth/callback
NODE_ENV=production
GENERATE_SOURCEMAP=true
```

### 🔄 **Upgrade Notes**

#### **For Future Updates**
- Environment variables may require updates for new features
- ArcGIS Enterprise group memberships should be validated before updates
- Browser cache should be cleared after deployment

### 🐛 **Bug Fixes**

#### **Authentication Issues**
- Fixed OAuth callback handling for user cancellation scenarios
- Resolved session persistence issues across browser tabs
- Corrected group membership validation edge cases

#### **UI/UX Improvements**
- Fixed sidebar responsiveness on various screen sizes
- Corrected theme switching persistence
- Resolved mobile navigation overlay issues

### 🎯 **Roadmap**

#### **Upcoming Features (Future Releases)**
- Dynamic microsite configuration management
- Advanced user analytics and usage tracking
- Enhanced map functionality with custom widgets
- Offline capability for critical features
- Integration with additional PETRONAS systems
- Real-time notifications and alerts

---

### 📞 **Support & Contact**

**Development Team**: Geospatial Data Operations  
**Organization**: Data Operations – Subsurface, Data – Upstream, UTDI, PETRONAS  
**Technical Support**: Contact your system administrator for access issues  

---

### 📄 **License & Compliance**

This application is proprietary software developed for PETRONAS internal use. All ArcGIS components are used under valid ESRI licensing agreements.

---

*For technical documentation and developer guides, please refer to the README.md file.*
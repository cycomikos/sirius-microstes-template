# SIRIUS Microsite React Application

A React + TypeScript application converted from the original HTML template, featuring ArcGIS Enterprise authentication and Calcite Design System.

## Features

- **ArcGIS Enterprise Authentication**: Uses IdentityManager and OAuthInfo for secure authentication
- **Group-based Access Control**: Protects routes based on user group membership
- **Calcite Design System**: Modern, accessible UI components
- **Responsive Design**: Mobile-friendly layout with collapsible sidebar
- **Dark Theme Support**: Toggle between light and dark themes
- **Session Management**: Automatic session checking and persistence

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your ArcGIS Enterprise settings:
   - `REACT_APP_PORTAL_URL`: Your ArcGIS Enterprise portal URL
   - `REACT_APP_ARCGIS_APP_ID`: Your registered application ID

3. **Start Development Server**
   ```bash
   npm start
   ```

## Authentication Setup

### ArcGIS Enterprise Configuration

1. **Register Application**: Register your application in ArcGIS Enterprise
2. **Configure OAuth**: Set up OAuth redirect URIs
3. **User Groups**: Ensure users belong to appropriate groups:
   - Admin groups: `admin`, `gis_admin`, `petronas_admin`
   - User groups: `users`, `gis_users`, `petronas_users`

### Environment Variables

- `REACT_APP_PORTAL_URL`: Your ArcGIS Enterprise portal URL
- `REACT_APP_ARCGIS_APP_ID`: Application ID from ArcGIS Enterprise

## Architecture

### Authentication Flow

1. **Session Check**: On app load, checks for existing ArcGIS credentials
2. **Login**: Redirects to ArcGIS Enterprise for authentication
3. **User Data**: Retrieves user profile and group memberships
4. **Route Protection**: Guards routes based on group membership

### Components

- `AuthProvider`: Context provider for authentication state
- `ProtectedRoute`: Route wrapper with group-based access control
- `Login`: ArcGIS Enterprise login interface
- `Header`: Application header with user menu
- `Sidebar`: Collapsible navigation sidebar
- `Dashboard`: Main microsite dashboard

### Services

- `authService`: Handles ArcGIS authentication operations
- `IdentityManager`: ArcGIS credential management
- `OAuthInfo`: OAuth configuration for Enterprise

## Group-Based Access

The application supports role-based access control through ArcGIS Enterprise groups:

```typescript
// Example usage
<ProtectedRoute requiredGroups={['admin', 'gis_admin']}>
  <AdminComponent />
</ProtectedRoute>
```

## Development

### Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

### Code Structure

```
src/
├── components/          # React components
├── contexts/           # React contexts
├── services/           # Business logic services
├── types/             # TypeScript type definitions
└── App.tsx            # Main application component
```

## Deployment

1. **Build Production**
   ```bash
   npm run build
   ```

2. **Configure Web Server**: Ensure proper routing for SPA
3. **SSL Required**: ArcGIS Enterprise requires HTTPS
4. **Environment Variables**: Set production environment variables

## Troubleshooting

### Common Issues

1. **Authentication Failures**: Check portal URL and app ID configuration
2. **CORS Issues**: Ensure proper CORS configuration in ArcGIS Enterprise
3. **Group Access**: Verify user group memberships in portal
4. **SSL Errors**: Ensure HTTPS is properly configured

### Debug Mode

Enable debug logging in browser console:
```javascript
localStorage.setItem('debug', 'true');
```
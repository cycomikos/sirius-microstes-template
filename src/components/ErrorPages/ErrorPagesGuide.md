# Error Pages Implementation Guide

This guide explains how to use the comprehensive error page system implemented in your React application.

## Available Error Pages

### 1. 404 - Not Found
**Route:** `/error/404`
**When to use:** Page or resource doesn't exist
**Features:**
- Navigation options (Home, Back, Refresh)
- Clear messaging about missing resources
- Automatic routing for unknown URLs

**Example Usage:**
```typescript
// Programmatic navigation
navigate('/error/404');

// URL examples that trigger 404:
// http://localhost:3000/unknown-page
// http://localhost:3000/missing-resource
```

### 2. 403 - Forbidden
**Route:** `/error/403`  
**When to use:** User lacks permission for a resource
**Features:**
- Shows current user info
- Request access functionality
- Account switching option
- Role-based messaging

**Example Usage:**
```typescript
// With custom props
<Error403 
  requiredRole="admin" 
  resource="/admin/dashboard"
/>

// Programmatic navigation with state
navigate('/error/403', { 
  state: { 
    requiredRole: 'manager',
    resource: 'Financial Reports'
  }
});
```

### 3. 400 - Bad Request  
**Route:** `/error/400`
**When to use:** Invalid request data or malformed URLs
**Features:**
- Clear explanation of the issue
- Navigation options
- Helpful troubleshooting tips

**Example Usage:**
```typescript
// Redirect after validation fails
if (!isValidRequest) {
  navigate('/error/400');
}
```

### 4. 500 - Internal Server Error
**Route:** `/error/500`
**When to use:** Server-side errors, uncaught exceptions
**Features:**
- Error boundary integration
- Development mode error details
- Error reporting functionality
- Professional error messaging

**Example Usage:**
```typescript
// Handled automatically by ErrorBoundary
// Manual navigation:
navigate('/error/500');

// With error details
<Error500 
  error={new Error('Database connection failed')}
  resetError={() => window.location.reload()}
/>
```

### 5. 503 - Service Unavailable
**Route:** `/error/503`
**When to use:** Maintenance periods, service downtime
**Features:**
- Countdown timer
- Maintenance information
- Auto-refresh capability
- Status page links

**Example Usage:**
```typescript
<Error503 
  estimatedDowntime="30 minutes"
  maintenanceMessage="Upgrading database for better performance"
/>
```

## Error Boundary

The `ErrorBoundary` component automatically catches JavaScript errors and displays the 500 error page.

**Features:**
- Automatic error catching
- Error logging
- Recovery mechanisms
- Development-friendly error details

**Usage:**
```typescript
// Already implemented in App.tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>

// Custom fallback
<ErrorBoundary fallback={<CustomErrorPage />}>
  <YourComponent />
</ErrorBoundary>
```

## Routing Configuration

Current routing setup in `App.tsx`:

```typescript
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/dashboard" element={<Navigate to="/" replace />} />
  
  {/* Error Pages */}
  <Route path="/error/400" element={<Error400 />} />
  <Route path="/error/403" element={<Error403 />} />
  <Route path="/error/404" element={<Error404 />} />
  <Route path="/error/500" element={<Error500 />} />
  <Route path="/error/503" element={<Error503 />} />
  
  {/* Catch-all route */}
  <Route path="*" element={<Error404 />} />
</Routes>
```

## Testing Error Pages

### Manual Testing URLs:
- **404 Not Found:** Any invalid URL (e.g., `/unknown-page`)
- **403 Forbidden:** `/error/403`
- **400 Bad Request:** `/error/400`
- **500 Server Error:** `/error/500`
- **503 Service Unavailable:** `/error/503`

### Programmatic Testing:
```javascript
// In browser console or your code
window.location.href = '/error/404';

// Using React Router
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/error/403');

// Trigger error boundary (500)
throw new Error('Test error for 500 page');
```

## Integration Examples

### API Error Handling:
```typescript
const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    
    if (response.status === 403) {
      navigate('/error/403');
    } else if (response.status === 404) {
      navigate('/error/404');
    } else if (response.status === 503) {
      navigate('/error/503');
    } else if (!response.ok) {
      navigate('/error/500');
    }
  } catch (error) {
    navigate('/error/500');
  }
};
```

### Permission Checking:
```typescript
const ProtectedComponent = () => {
  const { user } = useAuth();
  
  if (!user.hasPermission('admin')) {
    return <Error403 requiredRole="admin" resource="Admin Panel" />;
  }
  
  return <AdminPanel />;
};
```

### Maintenance Mode:
```typescript
const MaintenanceCheck = ({ children }) => {
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  
  useEffect(() => {
    checkMaintenanceStatus().then(setIsMaintenanceMode);
  }, []);
  
  if (isMaintenanceMode) {
    return <Error503 estimatedDowntime="1 hour" />;
  }
  
  return children;
};
```

## Customization

### Styling:
All error pages use the PETRONAS design system through CSS variables defined in `ErrorPages.css`.

### Custom Messages:
Most error components accept props for customization:
```typescript
<Error403 
  requiredRole="manager"
  resource="Financial Dashboard"
/>

<Error503 
  estimatedDowntime="45 minutes"
  maintenanceMessage="Deploying new features"
/>
```

### Error Logging:
The ErrorBoundary includes error logging. Replace the logging function with your error tracking service:

```typescript
// In ErrorBoundary.tsx
logErrorToService = (error: Error, errorInfo: any) => {
  // Replace with your service (Sentry, LogRocket, etc.)
  errorTrackingService.captureException(error, {
    extra: errorInfo
  });
};
```

## Best Practices

1. **Use appropriate error codes** - Match the HTTP status code with the error page
2. **Provide helpful actions** - Always give users a way forward
3. **Log errors properly** - Use the ErrorBoundary for unexpected errors
4. **Test error states** - Regularly test all error scenarios
5. **Keep messages professional** - Maintain the PETRONAS brand voice
6. **Consider user context** - Show relevant information based on user role/state
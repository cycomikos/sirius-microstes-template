# Invalid Route Examples

Here are sample invalid routes that will trigger the 400 error page in your application:

## Invalid Routes (will show 400 Error Page)

### 1. Non-existent Pages
- `https://template.local:3000/non-existent-page`
- `https://template.local:3000/invalid-route`
- `https://template.local:3000/missing-page`
- `https://template.local:3000/unknown`

### 2. Malformed URLs
- `https://template.local:3000/users/123/edit/invalid`
- `https://template.local:3000/api/data/malformed`
- `https://template.local:3000/settings/invalid-section`
- `https://template.local:3000/reports/bad-format`

### 3. Invalid Query Parameters (if handling query validation)
- `https://template.local:3000/?invalid-param=<script>alert('xss')</script>`
- `https://template.local:3000/?malformed-json={invalid}`
- `https://template.local:3000/?bad-encoding=%ZZ`

### 4. Deep Invalid Paths
- `https://template.local:3000/admin/users/invalid/action`
- `https://template.local:3000/data/reports/2024/invalid-month`
- `https://template.local:3000/microsite/unknown-id/dashboard`

### 5. Case-sensitive Issues (if enforced)
- `https://template.local:3000/Dashboard` (capital D)
- `https://template.local:3000/ERROR/400` (capitals)
- `https://template.local:3000/ADMIN/panel`

## Valid Routes (work correctly)

### ✅ Working Routes
- `https://template.local:3000/` → Dashboard
- `https://template.local:3000/dashboard` → Redirects to `/`  
- `https://template.local:3000/error/400` → 400 Error Page (direct access)

## Testing the 400 Error Page

You can test the error page by:

1. **Navigate to any invalid URL** in your browser while the app is running
2. **Type invalid routes** in the address bar
3. **Use developer tools** to programmatically navigate:
   ```javascript
   // In browser console
   window.location.href = '/invalid-route';
   ```

## Current Routing Configuration

Based on the setup in `App.tsx`:

```typescript
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/dashboard" element={<Navigate to="/" replace />} />
  <Route path="/error/400" element={<Error400 />} />
  <Route path="*" element={<Navigate to="/error/400" replace />} />
</Routes>
```

The `path="*"` acts as a catch-all route that redirects ANY unmatched URL to the 400 error page.
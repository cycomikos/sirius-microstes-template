# Manual Certificate Trust Setup

If you're still seeing `net::ERR_CERT_AUTHORITY_INVALID`, follow these manual steps:

## For Chrome/Safari on macOS:

1. **Open Keychain Access**
   - Press `Cmd + Space` and search for "Keychain Access"

2. **Find the Certificate**
   - Go to "System" keychain in the left sidebar
   - Search for "template.local"
   - Double-click on the certificate

3. **Set Trust Settings**
   - Expand the "Trust" section
   - Set "Secure Sockets Layer (SSL)" to "Always Trust"
   - Close the dialog and enter your password when prompted

4. **Restart Browser**
   - Completely quit and restart your browser
   - Clear cache if needed

## For Firefox:

1. **Visit the Site**
   - Go to https://template.local:3000
   - Click "Advanced" on the security warning

2. **Add Exception**
   - Click "Add Exception..."
   - Click "Get Certificate"
   - Check "Permanently store this exception"
   - Click "Confirm Security Exception"

## Alternative: Browser-Specific Flag

### Chrome:
- Start Chrome with: `--ignore-certificate-errors --ignore-ssl-errors --allow-running-insecure-content`

### Example:
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --ignore-certificate-errors --ignore-ssl-errors --allow-running-insecure-content
```

## Verification:
After setup, https://template.local:3000 should show a green lock icon and "Secure" status.
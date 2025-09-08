#!/bin/bash

# Install self-signed certificate for template.local on macOS
echo "Installing SSL certificate for template.local..."

# Add certificate to macOS keychain
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ssl/template.local.crt

echo "Certificate installed successfully!"
echo "You may need to restart your browser for changes to take effect."
echo ""
echo "To remove the certificate later, run:"
echo "sudo security delete-certificate -c template.local /Library/Keychains/System.keychain"
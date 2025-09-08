#!/bin/bash

# Install self-signed certificate for template.local on macOS
echo "Installing SSL certificate for template.local..."

# Remove any existing certificate first
echo "Removing any existing certificate..."
sudo security delete-certificate -c template.local /Library/Keychains/System.keychain 2>/dev/null || true

# Add new certificate to macOS keychain
echo "Adding new certificate..."
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ssl/template.local.crt

# Set specific trust settings for SSL
echo "Setting SSL trust settings..."
sudo security add-trusted-cert -d -r trustAsRoot -p ssl -p smime -p codeSign -p IPSec -p iChat -p basic -p swUpdate -p pkgSign -p pkinitClient -p pkinitServer -p eap -k /Library/Keychains/System.keychain ssl/template.local.crt 2>/dev/null || true

echo "Certificate installed successfully!"
echo "You may need to restart your browser for changes to take effect."
echo ""
echo "To remove the certificate later, run:"
echo "sudo security delete-certificate -c template.local /Library/Keychains/System.keychain"
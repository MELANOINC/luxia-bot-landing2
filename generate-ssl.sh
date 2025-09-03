#!/bin/bash

# Script to generate SSL certificates for HTTPS
# This generates self-signed certificates for development/testing
# For production, replace with certificates from a trusted CA

CERT_DIR="./nginx/certs"

echo "🔒 Generating SSL certificates for HTTPS..."

# Create certs directory if it doesn't exist
mkdir -p "$CERT_DIR"

# Generate private key and certificate
openssl req -x509 -newkey rsa:4096 -keyout "$CERT_DIR/server.key" -out "$CERT_DIR/server.crt" -days 365 -nodes \
  -subj "/C=US/ST=State/L=City/O=Melano Inc/CN=localhost" \
  -addext "subjectAltName=DNS:localhost,DNS:*.localhost,IP:127.0.0.1"

# Set proper permissions
chmod 600 "$CERT_DIR/server.key"
chmod 644 "$CERT_DIR/server.crt"

echo "✅ SSL certificates generated successfully!"
echo "📁 Location: $CERT_DIR/"
echo "🔑 Private key: server.key"
echo "📜 Certificate: server.crt"
echo ""
echo "⚠️  NOTE: These are self-signed certificates for development."
echo "   For production, replace with certificates from a trusted CA."
echo ""
echo "🚀 You can now run: docker compose up"
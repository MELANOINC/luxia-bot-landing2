#!/bin/sh
set -e

echo "Building containers..."
docker compose pull
docker compose build --no-cache

echo "Starting services..."
docker compose up -d

echo "Deployment complete."

#!/bin/sh
set -e

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DC="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DC="docker-compose"
else
  echo "Error: docker compose is not installed." >&2
  exit 1
fi

echo "Building containers..."
$DC pull
$DC build --no-cache

echo "Starting services..."
$DC up -d

echo "Deployment complete."

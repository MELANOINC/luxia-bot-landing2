#!/bin/sh
set -e

echo "Building containers..."
docker compose pull
docker compose build --no-cache

echo "Starting services..."
# Ensure this script is executable: chmod +x deploy.sh
#!/bin/sh
set -e

# Check for required commands
command -v docker >/dev/null 2>&1 || { echo >&2 "Error: docker is not installed or not in PATH."; exit 1; }
command -v docker compose >/dev/null 2>&1 || { echo >&2 "Error: docker compose is not available. Please install Docker Compose v2 or later."; exit 1; }

echo "Building containers..."
if ! docker compose pull; then
  echo "Error: Failed to pull containers."; exit 1
fi
if ! docker compose build --no-cache; then
  echo "Error: Failed to build containers."; exit 1
fi

echo "Starting services..."
if ! docker compose up -d; then
  echo "Error: Failed to start services."; exit 1
fi

echo "Deployment complete."

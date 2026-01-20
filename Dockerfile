# Placeholder Dockerfile for documentation repository
# This repository contains documentation only.
# The actual application Dockerfiles will be in the application repositories.

FROM nginx:alpine

# Copy documentation to nginx
COPY README.md /usr/share/nginx/html/
COPY *.md /usr/share/nginx/html/
COPY docs/ /usr/share/nginx/html/docs/

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Note: This is a placeholder for CI/CD purposes.
# The actual LUXIA BOT application will have its own optimized Dockerfile.

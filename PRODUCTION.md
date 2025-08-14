# Production Deployment

This project includes a production-ready Docker setup with:

- Node.js application serving the landing page
- PostgreSQL database
- Redis cache
- Nginx reverse proxy with SSL

## Environment

Copy `.env.example` to `.env` and adjust values as needed.

## Deployment

Run `./deploy.sh` to build and start all services.

Ensure valid certificates exist in `nginx/certs/server.crt` and `server.key`.

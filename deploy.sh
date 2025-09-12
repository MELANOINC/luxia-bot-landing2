#!/bin/bash

# 🚀 MELANIA BOT™ - One-Click Deployment Script
# MELANO INC Premium AI Automation Funnel

set -e

echo "🤖 MELANIA BOT™ - Starting Deployment..."
echo "🏢 MELANO INC - Premium AI Automation"
echo "📅 $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}===========================================${NC}"
}

# Check prerequisites
print_header "CHECKING PREREQUISITES"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    echo "Install with: curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    exit 1
else
    print_status "Docker is installed"
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
else
    print_status "Docker Compose is available"
fi

# Use docker compose or docker-compose
COMPOSE_CMD="docker compose"
if ! docker compose version &> /dev/null; then
    COMPOSE_CMD="docker-compose"
fi

# Check if .env file exists
if [[ ! -f ".env" ]]; then
    if [[ -f ".env.example" ]]; then
        print_warning ".env file not found. Copying from .env.example"
        cp .env.example .env
        print_warning "⚠️  Edit .env file with your configuration before production use!"
    else
        print_error ".env.example file not found. Cannot proceed."
        exit 1
    fi
else
    print_status ".env file found"
fi

# Create necessary directories
print_header "PREPARING DIRECTORIES"
mkdir -p nginx/certs

# Generate self-signed SSL certificate if not exists
if [[ ! -f "nginx/certs/server.crt" ]] || [[ ! -f "nginx/certs/server.key" ]]; then
    print_status "Generating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/certs/server.key \
        -out nginx/certs/server.crt \
        -subj "/C=AR/ST=BuenosAires/L=BuenosAires/O=MELANOINC/CN=localhost" 2>/dev/null || {
        print_warning "OpenSSL not found. Using placeholder certificates."
        echo "placeholder" > nginx/certs/server.crt
        echo "placeholder" > nginx/certs/server.key
    }
else
    print_status "SSL certificates found"
fi

# Build and deploy
print_header "BUILDING AND DEPLOYING MELANIA BOT"

print_status "Pulling latest images..."
$COMPOSE_CMD pull || print_warning "Pull failed, continuing with build..."

print_status "Building Docker images..."
$COMPOSE_CMD build --no-cache

print_status "Starting MELANIA BOT services..."
$COMPOSE_CMD up -d

print_status "Waiting for services to start..."
sleep 15

# Display deployment information
print_header "DEPLOYMENT COMPLETE"

echo ""
print_status "🚀 MELANIA BOT™ is now running!"
echo ""
echo "📊 Access URLs:"
echo "   • Main Application: http://localhost:3000"
echo "   • MELANIA BOT API: http://localhost:8000"
echo "   • HTTPS (self-signed): https://localhost"
echo ""
echo "🔧 Management Commands:"
echo "   • View logs: $COMPOSE_CMD logs"
echo "   • Stop services: $COMPOSE_CMD down"
echo "   • Restart: $COMPOSE_CMD restart"
echo ""

# Show running containers
print_header "RUNNING SERVICES"
$COMPOSE_CMD ps

echo ""
print_status "🎉 MELANIA BOT™ deployment completed successfully!"
print_status "💰 Ready to generate high-ticket sales with AI automation!"
echo ""
echo "📚 Documentation: ./DEPLOYMENT_GUIDE.md"
echo "🔧 Configuration: .env"
echo ""
echo "MELANO INC | MELANIA BOT™"
echo "Premium AI Automation for High-Ticket Services"

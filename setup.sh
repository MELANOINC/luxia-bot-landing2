#!/bin/bash
# 🚀 Luxia Bot Landing2 - Quick Setup Script
# Event Clocking System + CRM Integration
# ========================================

set -e  # Exit on any error

echo "🚀 Starting Luxia Bot Landing2 Setup..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ first.${NC}"
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo -e "${RED}❌ Node.js version 16+ required. Current version: $(node -v)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) detected${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚙️  Creating .env file from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}📝 Please edit .env file with your database credentials:${NC}"
    echo "   - DATABASE_URL (Supabase or PostgreSQL)"
    echo "   - SUPABASE_URL and SUPABASE_ANON_KEY"
    echo "   - REDIS_HOST (optional)"
    echo ""
    echo -e "${BLUE}💡 For Supabase setup: https://supabase.com/docs/guides/database${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Check if Python is available for bot examples
if command -v python3 &> /dev/null; then
    echo -e "${BLUE}🐍 Python3 detected - installing bot integration dependencies...${NC}"
    if [ -f requirements.txt ]; then
        python3 -m pip install -r requirements.txt --quiet
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Python dependencies installed${NC}"
        else
            echo -e "${YELLOW}⚠️  Some Python dependencies failed to install (optional)${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Python3 not found - bot integration examples will require manual setup${NC}"
fi

# Database migration notice
echo ""
echo -e "${BLUE}🗄️  Database Setup${NC}"
echo "================================================"
echo "📋 Database migrations are located in:"
echo "   supabase/migrations/20250913000000_event_clocking_system.sql"
echo ""
echo "For Supabase:"
echo "   1. Go to your Supabase project dashboard"
echo "   2. Navigate to SQL Editor"
echo "   3. Run the migration file"
echo ""
echo "For local PostgreSQL:"
echo "   psql -d your_database -f supabase/migrations/20250913000000_event_clocking_system.sql"
echo ""

# Test server startup
echo -e "${BLUE}🧪 Testing server startup...${NC}"
timeout 10s npm start &
SERVER_PID=$!
sleep 3

# Check if server is running
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Server started successfully${NC}"
    kill $SERVER_PID 2>/dev/null || true
else
    echo -e "${YELLOW}⚠️  Server test failed - check database configuration${NC}"
    kill $SERVER_PID 2>/dev/null || true
fi

# Success message
echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo "========================================"
echo ""
echo -e "${BLUE}📖 Next Steps:${NC}"
echo "1. Configure your database in .env file"
echo "2. Run database migrations (see instructions above)"
echo "3. Start the server: npm start"
echo "4. Access dashboard: http://localhost:3000"
echo ""
echo -e "${BLUE}🤖 Bot Integration:${NC}"
echo "• Python examples: examples/melania_bot_integration.py"
echo "• Node.js examples: examples/crm_integration.js"
echo "• Test script: examples/test_clocking_system.js"
echo ""
echo -e "${BLUE}📊 API Endpoints:${NC}"
echo "• POST /api/clocking - Record events"
echo "• GET /api/clocking/recent - Recent events"
echo "• GET /api/clocking/dashboard - Dashboard data"
echo "• GET /api/clocking/stream - Real-time stream"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "• Quick Deploy Guide: CLOCKING_DEPLOY_GUIDE.md"
echo "• Full README: README.md"
echo ""
echo -e "${GREEN}🚀 Ready for production deployment!${NC}"

# Check for common issues
echo ""
echo -e "${BLUE}🔍 System Check:${NC}"
echo "========================================"

# Check available ports
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use${NC}"
    echo "   Set PORT=3001 in .env or stop the other service"
else
    echo -e "${GREEN}✅ Port 3000 is available${NC}"
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo -e "${YELLOW}⚠️  Disk usage is ${DISK_USAGE}% - consider freeing space${NC}"
else
    echo -e "${GREEN}✅ Sufficient disk space (${DISK_USAGE}% used)${NC}"
fi

# Check RAM
if command -v free &> /dev/null; then
    RAM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$RAM_USAGE" -gt 85 ]; then
        echo -e "${YELLOW}⚠️  High RAM usage: ${RAM_USAGE}%${NC}"
    else
        echo -e "${GREEN}✅ RAM usage OK: ${RAM_USAGE}%${NC}"
    fi
fi

echo ""
echo -e "${GREEN}Setup complete! 🎯${NC}"
echo -e "${BLUE}Support: https://github.com/MELANOINC/luxia-bot-landing2/issues${NC}"
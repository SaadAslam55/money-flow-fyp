#!/bin/bash

#
# Money Flow - NestJS API Setup Script
# Phase 0: Prerequisites
#
# Usage: ./scripts/setup-api.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Helper functions
step() { echo -e "\n${CYAN}[*] $1${NC}"; }
success() { echo -e "${GREEN}[+] $1${NC}"; }
warn() { echo -e "${YELLOW}[!] $1${NC}"; }
error() { echo -e "${RED}[-] $1${NC}"; exit 1; }

# Banner
echo -e "${MAGENTA}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          Money Flow - NestJS API Setup Script             ║"
echo "║                   Phase 0 Prerequisites                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
APPS_DIR="$ROOT_DIR/apps"
API_DIR="$APPS_DIR/api"

# Check Node.js version
step "Checking Node.js version..."
NODE_VERSION=$(node --version | sed 's/v//')
MAJOR_VERSION=$(echo "$NODE_VERSION" | cut -d. -f1)

if [ "$MAJOR_VERSION" -lt 18 ]; then
    error "Node.js 18+ required. Current version: $NODE_VERSION"
fi
success "Node.js $NODE_VERSION detected"

# Check if NestJS CLI is installed
step "Checking NestJS CLI..."
if ! command -v nest &> /dev/null; then
    warn "NestJS CLI not found. Installing globally..."
    npm install -g @nestjs/cli
fi
success "NestJS CLI ready"

# Create apps directory
if [ -d "$API_DIR" ]; then
    warn "apps/api directory already exists. Skipping creation."
else
    step "Creating apps/api directory structure..."
    mkdir -p "$APPS_DIR"
    cd "$APPS_DIR"
    
    echo "  Creating NestJS project (this may take a minute)..."
    nest new api --package-manager npm --skip-git --skip-install
    
    success "NestJS project created"
fi

# Navigate to API directory
cd "$API_DIR"

# Install dependencies
step "Installing dependencies..."
npm install

# Install additional required packages
step "Installing TiDB/Prisma packages..."
npm install @prisma/client prisma
npm install mysql2
npm install @nestjs/config @nestjs/swagger
npm install class-validator class-transformer
npm install @upstash/redis ioredis
npm install helmet compression
npm install passport passport-jwt @nestjs/passport @nestjs/jwt
npm install bcryptjs
npm install -D @types/bcryptjs @types/passport-jwt

# Initialize Prisma
step "Initializing Prisma..."
if [ ! -d "prisma" ]; then
    npx prisma init --datasource-provider mysql
    success "Prisma initialized"
else
    warn "Prisma already initialized"
fi

# Create directory structure
step "Creating module directories..."
directories=(
    "src/common/decorators"
    "src/common/filters"
    "src/common/guards"
    "src/common/interceptors"
    "src/common/middleware"
    "src/common/pipes"
    "src/config"
    "src/database/tidb"
    "src/database/redis"
    "src/modules/auth"
    "src/modules/users"
    "src/modules/organizations"
    "src/modules/invoices"
    "src/modules/customers"
    "src/modules/products"
    "src/modules/transactions"
    "src/modules/reports"
    "src/health"
)

for dir in "${directories[@]}"; do
    mkdir -p "$dir"
    echo "  Created: $dir"
done
success "Directory structure created"

# Go back to root
cd "$ROOT_DIR"

# Summary
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    Setup Complete!                         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${CYAN}Next steps:${NC}"
echo "  1. cd apps/api"
echo "  2. Update prisma/schema.prisma with TiDB schema"
echo "  3. Set DATABASE_URL in .env"
echo "  4. Run: npx prisma generate"
echo "  5. Run: npm run start:dev"
echo ""

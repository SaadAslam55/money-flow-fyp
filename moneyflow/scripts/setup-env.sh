#!/bin/bash

# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                    MONEY FLOW - Environment Setup Script                   ║
# ║                                (Bash)                                      ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "              MONEY FLOW - Environment Setup                    "
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================
# Helper Functions
# ============================================

create_env_file() {
    local source=$1
    local dest=$2
    local name=$3
    
    if [ -f "$dest" ]; then
        echo -e "  ${YELLOW}⚠️  $name already exists - skipping${NC}"
        return 1
    fi
    
    if [ -f "$source" ]; then
        cp "$source" "$dest"
        echo -e "  ${GREEN}✅ Created $name${NC}"
        return 0
    else
        echo -e "  ${RED}❌ Template not found: $source${NC}"
        return 1
    fi
}

# ============================================
# Create Environment Files
# ============================================

echo "📁 Creating environment files..."
echo ""

# Track created files
FRONTEND_CREATED=false
API_CREATED=false
WORKERS_CREATED=false

# Frontend .env.local
if create_env_file ".env.example" ".env.local" "Frontend .env.local"; then
    FRONTEND_CREATED=true
fi

# API .env
if create_env_file "apps/api/.env.example" "apps/api/.env" "API apps/api/.env"; then
    API_CREATED=true
fi

# Workers .dev.vars
if create_env_file "workers/moneyflow-edge/.dev.vars.example" "workers/moneyflow-edge/.dev.vars" "Workers .dev.vars"; then
    WORKERS_CREATED=true
fi

echo ""

# ============================================
# Summary
# ============================================

echo "═══════════════════════════════════════════════════════════════"
echo "                         SUMMARY                                "
echo "═══════════════════════════════════════════════════════════════"
echo ""

FILES_CREATED=0
if [ "$FRONTEND_CREATED" = true ]; then ((FILES_CREATED++)); fi
if [ "$API_CREATED" = true ]; then ((FILES_CREATED++)); fi
if [ "$WORKERS_CREATED" = true ]; then ((FILES_CREATED++)); fi

if [ $FILES_CREATED -gt 0 ]; then
    echo -e "${GREEN}✅ Created $FILES_CREATED environment file(s):${NC}"
    if [ "$FRONTEND_CREATED" = true ]; then echo "   • .env.local"; fi
    if [ "$API_CREATED" = true ]; then echo "   • apps/api/.env"; fi
    if [ "$WORKERS_CREATED" = true ]; then echo "   • workers/moneyflow-edge/.dev.vars"; fi
    echo ""
    echo -e "${YELLOW}📝 Next Steps:${NC}"
    echo "   1. Edit each file with your actual credentials"
    echo "   2. See docs/ENV_COMPLETE_GUIDE.md for setup instructions"
    echo ""
else
    echo -e "${BLUE}ℹ️  All environment files already exist${NC}"
    echo ""
fi

# ============================================
# Required Credentials Checklist
# ============================================

echo "═══════════════════════════════════════════════════════════════"
echo "              CREDENTIALS YOU WILL NEED                         "
echo "═══════════════════════════════════════════════════════════════"
echo ""

echo -e "${BLUE}🔵 SUPABASE (https://supabase.com)${NC}"
echo "   • Project URL"
echo "   • Anon Key (public)"
echo "   • Service Role Key (secret)"
echo "   • JWT Secret"
echo ""

echo -e "${GREEN}🟢 TIDB CLOUD (https://tidbcloud.com)${NC}"
echo "   • Host URL"
echo "   • Username"
echo "   • Password"
echo "   • Database name"
echo ""

echo -e "${RED}🔴 UPSTASH REDIS (https://upstash.com)${NC}"
echo "   • REST API URL"
echo "   • REST API Token"
echo ""

echo -e "${YELLOW}🟠 CLOUDFLARE (https://cloudflare.com) - Optional${NC}"
echo "   • Account ID"
echo "   • KV Namespace IDs"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""

# ============================================
# Open Files for Editing
# ============================================

read -p "Would you like to open the env files in VS Code? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}Opening files in VS Code...${NC}"
    
    [ -f ".env.local" ] && code ".env.local"
    [ -f "apps/api/.env" ] && code "apps/api/.env"
    [ -f "workers/moneyflow-edge/.dev.vars" ] && code "workers/moneyflow-edge/.dev.vars"
    [ -f "docs/ENV_COMPLETE_GUIDE.md" ] && code "docs/ENV_COMPLETE_GUIDE.md"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete! Happy coding!${NC}"
echo ""

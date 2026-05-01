<# 
.SYNOPSIS
    Sets up the NestJS API project structure for TiDB migration

.DESCRIPTION
    Creates the apps/api folder structure with NestJS boilerplate,
    Prisma configuration, and basic modules.

.EXAMPLE
    .\scripts\setup-api.ps1
#>

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Step { param($Message) Write-Host "`n[*] $Message" -ForegroundColor Cyan }
function Write-Success { param($Message) Write-Host "[+] $Message" -ForegroundColor Green }
function Write-Warning { param($Message) Write-Host "[!] $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "[-] $Message" -ForegroundColor Red }

# Banner
Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║          Money Flow - NestJS API Setup Script             ║
║                   Phase 0 Prerequisites                    ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Magenta

# Check Node.js version
Write-Step "Checking Node.js version..."
$nodeVersion = (node --version) -replace 'v', ''
$majorVersion = [int]($nodeVersion.Split('.')[0])
if ($majorVersion -lt 18) {
    Write-Error "Node.js 18+ required. Current version: $nodeVersion"
    exit 1
}
Write-Success "Node.js $nodeVersion detected"

# Check if NestJS CLI is installed
Write-Step "Checking NestJS CLI..."
$nestInstalled = $null
try {
    $nestInstalled = nest --version
} catch {
    Write-Warning "NestJS CLI not found. Installing globally..."
    npm install -g @nestjs/cli
}
Write-Success "NestJS CLI ready"

# Create apps directory
$appsDir = Join-Path $PSScriptRoot "..\apps"
$apiDir = Join-Path $appsDir "api"

if (Test-Path $apiDir) {
    Write-Warning "apps/api directory already exists. Skipping creation."
} else {
    Write-Step "Creating apps/api directory structure..."
    
    # Create base directories
    New-Item -ItemType Directory -Path $apiDir -Force | Out-Null
    
    # Initialize NestJS project
    Push-Location $appsDir
    Write-Host "  Creating NestJS project (this may take a minute)..."
    nest new api --package-manager npm --skip-git --skip-install
    Pop-Location
    
    Write-Success "NestJS project created"
}

# Navigate to API directory
Push-Location $apiDir

# Install dependencies
Write-Step "Installing dependencies..."
npm install

# Install additional required packages
Write-Step "Installing TiDB/Prisma packages..."
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
Write-Step "Initializing Prisma..."
if (-not (Test-Path "prisma")) {
    npx prisma init --datasource-provider mysql
    Write-Success "Prisma initialized"
} else {
    Write-Warning "Prisma already initialized"
}

# Create directory structure
Write-Step "Creating module directories..."
$directories = @(
    "src/common/decorators",
    "src/common/filters",
    "src/common/guards",
    "src/common/interceptors",
    "src/common/middleware",
    "src/common/pipes",
    "src/config",
    "src/database/tidb",
    "src/database/redis",
    "src/modules/auth",
    "src/modules/users",
    "src/modules/organizations",
    "src/modules/invoices",
    "src/modules/customers",
    "src/modules/products",
    "src/modules/transactions",
    "src/modules/reports",
    "src/health"
)

foreach ($dir in $directories) {
    $fullPath = Join-Path $apiDir $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor DarkGray
    }
}
Write-Success "Directory structure created"

# Go back to root
Pop-Location

# Summary
Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                    Setup Complete!                         ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. cd apps/api" -ForegroundColor White
Write-Host "  2. Update prisma/schema.prisma with TiDB schema" -ForegroundColor White
Write-Host "  3. Set DATABASE_URL in .env" -ForegroundColor White
Write-Host "  4. Run: npx prisma generate" -ForegroundColor White
Write-Host "  5. Run: npm run start:dev" -ForegroundColor White
Write-Host ""

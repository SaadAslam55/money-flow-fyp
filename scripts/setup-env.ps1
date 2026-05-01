# ╔═══════════════════════════════════════════════════════════════════════════╗
# ║                    MONEY FLOW - Environment Setup Script                   ║
# ║                              (PowerShell)                                  ║
# ╚═══════════════════════════════════════════════════════════════════════════╝

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "              MONEY FLOW - Environment Setup                    " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Get script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

Set-Location $ProjectRoot

# ============================================
# Helper Functions
# ============================================

function Create-EnvFile {
    param (
        [string]$Source,
        [string]$Destination,
        [string]$Name
    )
    
    if (Test-Path $Destination) {
        Write-Host "  ⚠️  $Name already exists - skipping" -ForegroundColor Yellow
        return $false
    }
    
    if (Test-Path $Source) {
        Copy-Item $Source $Destination
        Write-Host "  ✅ Created $Name" -ForegroundColor Green
        return $true
    } else {
        Write-Host "  ❌ Template not found: $Source" -ForegroundColor Red
        return $false
    }
}

# ============================================
# Create Environment Files
# ============================================

Write-Host "📁 Creating environment files..." -ForegroundColor White
Write-Host ""

# Frontend .env.local
$frontendCreated = Create-EnvFile `
    -Source ".env.example" `
    -Destination ".env.local" `
    -Name "Frontend .env.local"

# API .env
$apiCreated = Create-EnvFile `
    -Source "apps/api/.env.example" `
    -Destination "apps/api/.env" `
    -Name "API apps/api/.env"

# Workers .dev.vars
$workersCreated = Create-EnvFile `
    -Source "workers/moneyflow-edge/.dev.vars.example" `
    -Destination "workers/moneyflow-edge/.dev.vars" `
    -Name "Workers .dev.vars"

Write-Host ""

# ============================================
# Summary
# ============================================

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                         SUMMARY                                " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$filesCreated = @()
if ($frontendCreated) { $filesCreated += ".env.local" }
if ($apiCreated) { $filesCreated += "apps/api/.env" }
if ($workersCreated) { $filesCreated += "workers/moneyflow-edge/.dev.vars" }

if ($filesCreated.Count -gt 0) {
    Write-Host "✅ Created $($filesCreated.Count) environment file(s):" -ForegroundColor Green
    foreach ($file in $filesCreated) {
        Write-Host "   • $file" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Yellow
    Write-Host "   1. Edit each file with your actual credentials" -ForegroundColor White
    Write-Host "   2. See docs/ENV_COMPLETE_GUIDE.md for setup instructions" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ℹ️  All environment files already exist" -ForegroundColor Blue
    Write-Host ""
}

# ============================================
# Required Credentials Checklist
# ============================================

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "              CREDENTIALS YOU WILL NEED                         " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🔵 SUPABASE (https://supabase.com)" -ForegroundColor Blue
Write-Host "   • Project URL" -ForegroundColor Gray
Write-Host "   • Anon Key (public)" -ForegroundColor Gray
Write-Host "   • Service Role Key (secret)" -ForegroundColor Gray
Write-Host "   • JWT Secret" -ForegroundColor Gray
Write-Host ""

Write-Host "🟢 TIDB CLOUD (https://tidbcloud.com)" -ForegroundColor Green
Write-Host "   • Host URL" -ForegroundColor Gray
Write-Host "   • Username" -ForegroundColor Gray
Write-Host "   • Password" -ForegroundColor Gray
Write-Host "   • Database name" -ForegroundColor Gray
Write-Host ""

Write-Host "🔴 UPSTASH REDIS (https://upstash.com)" -ForegroundColor Red
Write-Host "   • REST API URL" -ForegroundColor Gray
Write-Host "   • REST API Token" -ForegroundColor Gray
Write-Host ""

Write-Host "🟠 CLOUDFLARE (https://cloudflare.com) - Optional" -ForegroundColor DarkYellow
Write-Host "   • Account ID" -ForegroundColor Gray
Write-Host "   • KV Namespace IDs" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# ============================================
# Open Files for Editing
# ============================================

$openFiles = Read-Host "Would you like to open the env files in VS Code? (y/n)"

if ($openFiles -eq 'y' -or $openFiles -eq 'Y') {
    Write-Host ""
    Write-Host "Opening files in VS Code..." -ForegroundColor Cyan
    
    if (Test-Path ".env.local") {
        code ".env.local"
    }
    if (Test-Path "apps/api/.env") {
        code "apps/api/.env"
    }
    if (Test-Path "workers/moneyflow-edge/.dev.vars") {
        code "workers/moneyflow-edge/.dev.vars"
    }
    
    # Also open the guide
    if (Test-Path "docs/ENV_COMPLETE_GUIDE.md") {
        code "docs/ENV_COMPLETE_GUIDE.md"
    }
}

Write-Host ""
Write-Host "🎉 Setup complete! Happy coding!" -ForegroundColor Green
Write-Host ""

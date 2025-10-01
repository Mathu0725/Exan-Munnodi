# Complete Exam Munnodi Setup Script
# This script handles the entire setup process from PostgreSQL installation to application startup

Write-Host "🚀 Exam Munnodi Complete Setup" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host "This script will:" -ForegroundColor Cyan
Write-Host "1. Install PostgreSQL 18" -ForegroundColor White
Write-Host "2. Create database and user" -ForegroundColor White
Write-Host "3. Update environment configuration" -ForegroundColor White
Write-Host "4. Install Node.js dependencies" -ForegroundColor White
Write-Host "5. Run database migrations" -ForegroundColor White
Write-Host "6. Set up initial data" -ForegroundColor White
Write-Host ""

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Cyan
    Write-Host "1. Right-click on PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Navigate to your project directory" -ForegroundColor White
    Write-Host "4. Run: .\scripts\complete-setup.ps1" -ForegroundColor White
    exit 1
}

# Configuration
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$DatabaseName = "exam_munnodi"
$AppUser = "exam_user"
$AppPassword = "ExamMunnodi2025!"
$DatabaseUrl = "postgresql://$AppUser`:$AppPassword@localhost:5432/$DatabaseName"

Write-Host "📁 Project Root: $ProjectRoot" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install PostgreSQL
Write-Host "Step 1: Installing PostgreSQL..." -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
try {
    & "$PSScriptRoot\install-postgresql.ps1"
    if ($LASTEXITCODE -ne 0) {
        throw "PostgreSQL installation failed"
    }
    Write-Host "✅ PostgreSQL installation completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL installation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Setup Database
Write-Host "Step 2: Setting up database..." -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
try {
    & "$PSScriptRoot\setup-postgresql-database.ps1"
    if ($LASTEXITCODE -ne 0) {
        throw "Database setup failed"
    }
    Write-Host "✅ Database setup completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Database setup failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Update .env file
Write-Host "Step 3: Updating environment configuration..." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$EnvFile = Join-Path $ProjectRoot ".env"
if (Test-Path $EnvFile) {
    Write-Host "📝 Updating existing .env file..." -ForegroundColor Cyan
    
    # Read current .env content
    $EnvContent = Get-Content $EnvFile -Raw
    
    # Update DATABASE_URL
    $EnvContent = $EnvContent -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$DatabaseUrl`""
    
    # Write updated content
    Set-Content -Path $EnvFile -Value $EnvContent -Encoding UTF8
    Write-Host "✅ .env file updated with database connection!" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found! Please create it first." -ForegroundColor Red
    Write-Host "Run: npm run setup:env" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 4: Install Node.js dependencies
Write-Host "Step 4: Installing Node.js dependencies..." -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Yellow
Set-Location $ProjectRoot

try {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install --legacy-peer-deps
    if ($LASTEXITCODE -ne 0) {
        throw "npm install failed"
    }
    Write-Host "✅ Dependencies installed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 5: Generate Prisma client
Write-Host "Step 5: Generating Prisma client..." -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
try {
    Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
    npx prisma generate
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma generate failed"
    }
    Write-Host "✅ Prisma client generated!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to generate Prisma client: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 6: Push database schema
Write-Host "Step 6: Pushing database schema..." -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
try {
    Write-Host "🗄️ Pushing schema to database..." -ForegroundColor Cyan
    npx prisma db push
    if ($LASTEXITCODE -ne 0) {
        throw "Database push failed"
    }
    Write-Host "✅ Database schema pushed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to push database schema: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 7: Setup initial data
Write-Host "Step 7: Setting up initial data..." -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
try {
    Write-Host "🌱 Creating initial data..." -ForegroundColor Cyan
    node scripts/setup-database.js
    if ($LASTEXITCODE -ne 0) {
        throw "Database setup failed"
    }
    Write-Host "✅ Initial data created!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create initial data: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Final success message
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host "✅ PostgreSQL 18 installed and configured" -ForegroundColor Green
Write-Host "✅ Database '$DatabaseName' created" -ForegroundColor Green
Write-Host "✅ User '$AppUser' created with proper permissions" -ForegroundColor Green
Write-Host "✅ Environment configuration updated" -ForegroundColor Green
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host "✅ Database schema deployed" -ForegroundColor Green
Write-Host "✅ Initial data created" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Login Credentials:" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: Admin@123" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start the development server: npm run dev" -ForegroundColor White
Write-Host "2. Open your browser: http://localhost:3000" -ForegroundColor White
Write-Host "3. Login with the credentials above" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Useful Commands:" -ForegroundColor Cyan
Write-Host "  Start App:     npm run dev" -ForegroundColor White
Write-Host "  Database UI:   npx prisma studio" -ForegroundColor White
Write-Host "  View Logs:     Get-EventLog -LogName Application -Source PostgreSQL" -ForegroundColor White
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Cyan
Write-Host "  PostgreSQL Setup: docs/POSTGRESQL_SETUP.md" -ForegroundColor White
Write-Host "  API Documentation: docs/API.md" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Your Exam Munnodi application is ready to use!" -ForegroundColor Green

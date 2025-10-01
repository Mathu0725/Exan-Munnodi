# Simple Exam Munnodi Setup Script
# This script handles the essential setup steps

Write-Host "🚀 Exam Munnodi Simple Setup" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
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

# Download URL for PostgreSQL 18 Windows installer
$DownloadUrl = "https://get.enterprisedb.com/postgresql/postgresql-18.0-1-windows-x64.exe"
$InstallerPath = "$env:TEMP\postgresql-18-installer.exe"

Write-Host "📥 Downloading PostgreSQL 18 installer..." -ForegroundColor Cyan
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $InstallerPath -UseBasicParsing
    Write-Host "✅ Download completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Installing PostgreSQL..." -ForegroundColor Cyan

# Silent installation parameters
$InstallArgs = @(
    "--mode", "unattended",
    "--unattendedmodeui", "none",
    "--debuglevel", "2",
    "--serviceaccount", "postgres",
    "--servicename", "postgresql",
    "--servicepassword", $AppPassword,
    "--serverport", "5432",
    "--superaccount", "postgres",
    "--superpassword", $AppPassword,
    "--installdir", "C:\Program Files\PostgreSQL\18",
    "--datadir", "C:\Program Files\PostgreSQL\18\data",
    "--enable-components", "server,pgAdmin,stackbuilder",
    "--disable-components", "commandlinetools",
    "--locale", "C",
    "--timezone", "UTC"
)

try {
    Start-Process -FilePath $InstallerPath -ArgumentList $InstallArgs -Wait
    Write-Host "✅ PostgreSQL installation completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clean up installer
Remove-Item $InstallerPath -Force

# Start PostgreSQL service
Write-Host "🚀 Starting PostgreSQL service..." -ForegroundColor Cyan
try {
    Start-Service -Name "postgresql" -ErrorAction Stop
    Write-Host "✅ PostgreSQL service started!" -ForegroundColor Green
    Start-Sleep -Seconds 5
} catch {
    Write-Host "❌ Failed to start PostgreSQL service: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Create Database
Write-Host "Step 2: Creating database..." -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow

$PostgreSQLBin = "C:\Program Files\PostgreSQL\18\bin"

# Create database and user
$SQLCommands = @"
CREATE DATABASE $DatabaseName;
CREATE USER $AppUser WITH PASSWORD '$AppPassword';
GRANT ALL PRIVILEGES ON DATABASE $DatabaseName TO $AppUser;
ALTER USER $AppUser CREATEDB;
\c $DatabaseName
GRANT ALL ON SCHEMA public TO $AppUser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $AppUser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $AppUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $AppUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $AppUser;
"@

try {
    $SQLCommands | & "$PostgreSQLBin\psql.exe" -U postgres -h localhost -p 5432 -d postgres
    Write-Host "✅ Database and user created!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create database: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Update .env file
Write-Host "Step 3: Updating .env file..." -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

$EnvFile = Join-Path $ProjectRoot ".env"
if (Test-Path $EnvFile) {
    $EnvContent = Get-Content $EnvFile -Raw
    $EnvContent = $EnvContent -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$DatabaseUrl`""
    Set-Content -Path $EnvFile -Value $EnvContent -Encoding UTF8
    Write-Host "✅ .env file updated!" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found! Please create it first." -ForegroundColor Red
    Write-Host "Run: npm run setup:env" -ForegroundColor Yellow
    exit 1
}

# Step 4: Setup Application
Write-Host "Step 4: Setting up application..." -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow

Set-Location $ProjectRoot

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install --legacy-peer-deps

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
npx prisma generate

# Push database schema
Write-Host "🗄️ Pushing database schema..." -ForegroundColor Cyan
npx prisma db push

# Create initial data
Write-Host "🌱 Creating initial data..." -ForegroundColor Cyan
node scripts/setup-database.js

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host "✅ PostgreSQL 18 installed and configured" -ForegroundColor Green
Write-Host "✅ Database '$DatabaseName' created" -ForegroundColor Green
Write-Host "✅ User '$AppUser' created" -ForegroundColor Green
Write-Host "✅ Application configured" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Login Credentials:" -ForegroundColor Cyan
Write-Host "  Email: admin@example.com" -ForegroundColor White
Write-Host "  Password: Admin@123" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Start your application:" -ForegroundColor Yellow
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "  Then open: http://localhost:3000" -ForegroundColor White

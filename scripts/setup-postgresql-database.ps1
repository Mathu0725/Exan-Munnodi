# PostgreSQL Database Setup Script
# This script creates the database and user for Exam Munnodi

Write-Host "🗄️ PostgreSQL Database Setup" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Configuration
$PostgreSQLVersion = "18"
$InstallDir = "C:\Program Files\PostgreSQL\$PostgreSQLVersion"
$PostgreSQLBin = "$InstallDir\bin"
$SuperUser = "postgres"
$SuperPassword = "ExamMunnodi2025!"
$DatabaseName = "exam_munnodi"
$AppUser = "exam_user"
$AppPassword = "ExamMunnodi2025!"

Write-Host "📋 Database Configuration:" -ForegroundColor Cyan
Write-Host "  Database: $DatabaseName" -ForegroundColor White
Write-Host "  App User: $AppUser" -ForegroundColor White
Write-Host "  App Password: $AppPassword" -ForegroundColor White
Write-Host ""

# Check if PostgreSQL is running
Write-Host "🔍 Checking PostgreSQL service..." -ForegroundColor Yellow
$ServiceStatus = Get-Service -Name "postgresql" -ErrorAction SilentlyContinue

if (-not $ServiceStatus -or $ServiceStatus.Status -ne "Running") {
    Write-Host "❌ PostgreSQL service is not running!" -ForegroundColor Red
    Write-Host "Starting PostgreSQL service..." -ForegroundColor Yellow
    try {
        Start-Service -Name "postgresql" -ErrorAction Stop
        Write-Host "✅ PostgreSQL service started!" -ForegroundColor Green
        Start-Sleep -Seconds 5  # Wait for service to fully start
    } catch {
        Write-Host "❌ Failed to start PostgreSQL service: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ PostgreSQL service is running!" -ForegroundColor Green
}

# Test connection to PostgreSQL
Write-Host "🔍 Testing PostgreSQL connection..." -ForegroundColor Yellow
$TestConnection = & "$PostgreSQLBin\psql.exe" -U $SuperUser -h localhost -p 5432 -d postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Cannot connect to PostgreSQL!" -ForegroundColor Red
    Write-Host "Error: $TestConnection" -ForegroundColor Red
    Write-Host "Please check your PostgreSQL installation and credentials." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ PostgreSQL connection successful!" -ForegroundColor Green

# Create database and user
Write-Host "🔧 Creating database and user..." -ForegroundColor Yellow

# SQL commands to execute
$SQLCommands = @"
-- Create database
CREATE DATABASE $DatabaseName;

-- Create user
CREATE USER $AppUser WITH PASSWORD '$AppPassword';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DatabaseName TO $AppUser;
ALTER USER $AppUser CREATEDB;

-- Connect to the new database and grant schema privileges
\c $DatabaseName
GRANT ALL ON SCHEMA public TO $AppUser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $AppUser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $AppUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $AppUser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $AppUser;
"@

# Execute SQL commands
try {
    $SQLCommands | & "$PostgreSQLBin\psql.exe" -U $SuperUser -h localhost -p 5432 -d postgres
    Write-Host "✅ Database and user created successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create database/user: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test connection with new user
Write-Host "🔍 Testing connection with app user..." -ForegroundColor Yellow
$TestAppConnection = & "$PostgreSQLBin\psql.exe" -U $AppUser -h localhost -p 5432 -d $DatabaseName -c "SELECT current_database(), current_user;" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ App user connection successful!" -ForegroundColor Green
    Write-Host "📊 Connection Details:" -ForegroundColor Cyan
    Write-Host $TestAppConnection -ForegroundColor White
} else {
    Write-Host "❌ App user connection failed!" -ForegroundColor Red
    Write-Host "Error: $TestAppConnection" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Database Setup Complete!" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host "📋 Connection String for .env:" -ForegroundColor Cyan
Write-Host "DATABASE_URL=`"postgresql://$AppUser`:$AppPassword@localhost:5432/$DatabaseName`"" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env file with the connection string above" -ForegroundColor White
Write-Host "2. Run: npx prisma db push" -ForegroundColor White
Write-Host "3. Run: npm run setup:db" -ForegroundColor White
Write-Host "4. Start your application: npm run dev" -ForegroundColor White

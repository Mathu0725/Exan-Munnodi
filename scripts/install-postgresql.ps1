# PostgreSQL Installation Script for Windows
# This script downloads and installs PostgreSQL using PowerShell

Write-Host "🐘 PostgreSQL Installation Script" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if running as Administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Please run PowerShell as Administrator and try again." -ForegroundColor Yellow
    exit 1
}

# Configuration
$PostgreSQLVersion = "18"
$InstallDir = "C:\Program Files\PostgreSQL\$PostgreSQLVersion"
$DataDir = "C:\Program Files\PostgreSQL\$PostgreSQLVersion\data"
$Port = "5432"
$SuperUser = "postgres"
$SuperUserPassword = "ExamMunnodi2025!"  # Strong password for production

Write-Host "📋 Installation Configuration:" -ForegroundColor Cyan
Write-Host "  Version: PostgreSQL $PostgreSQLVersion" -ForegroundColor White
Write-Host "  Install Directory: $InstallDir" -ForegroundColor White
Write-Host "  Data Directory: $DataDir" -ForegroundColor White
Write-Host "  Port: $Port" -ForegroundColor White
Write-Host "  Super User: $SuperUser" -ForegroundColor White
Write-Host ""

# Download URL for PostgreSQL 18 Windows installer
$DownloadUrl = "https://get.enterprisedb.com/postgresql/postgresql-18.0-1-windows-x64.exe"
$InstallerPath = "$env:TEMP\postgresql-18-installer.exe"

Write-Host "📥 Downloading PostgreSQL $PostgreSQLVersion installer..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $DownloadUrl -OutFile $InstallerPath -UseBasicParsing
    Write-Host "✅ Download completed!" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Installing PostgreSQL..." -ForegroundColor Yellow

# Silent installation parameters
$InstallArgs = @(
    "--mode", "unattended",
    "--unattendedmodeui", "none",
    "--debuglevel", "2",
    "--serviceaccount", "postgres",
    "--servicename", "postgresql",
    "--servicepassword", $SuperUserPassword,
    "--serverport", $Port,
    "--superaccount", $SuperUser,
    "--superpassword", $SuperUserPassword,
    "--installdir", $InstallDir,
    "--datadir", $DataDir,
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

Write-Host "🔧 Configuring PostgreSQL..." -ForegroundColor Yellow

# Add PostgreSQL to PATH
$PostgreSQLBin = "$InstallDir\bin"
$CurrentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
if ($CurrentPath -notlike "*$PostgreSQLBin*") {
    [Environment]::SetEnvironmentVariable("PATH", "$CurrentPath;$PostgreSQLBin", "Machine")
    Write-Host "✅ Added PostgreSQL to system PATH" -ForegroundColor Green
}

# Start PostgreSQL service
Write-Host "🚀 Starting PostgreSQL service..." -ForegroundColor Yellow
try {
    Start-Service -Name "postgresql" -ErrorAction Stop
    Write-Host "✅ PostgreSQL service started successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start PostgreSQL service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please start the service manually: Start-Service postgresql" -ForegroundColor Yellow
}

# Test connection
Write-Host "🔍 Testing PostgreSQL connection..." -ForegroundColor Yellow
$TestConnection = & "$PostgreSQLBin\psql.exe" -U $SuperUser -h localhost -p $Port -d postgres -c "SELECT version();" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PostgreSQL connection test successful!" -ForegroundColor Green
    Write-Host "📊 PostgreSQL Version:" -ForegroundColor Cyan
    Write-Host $TestConnection -ForegroundColor White
} else {
    Write-Host "❌ PostgreSQL connection test failed!" -ForegroundColor Red
    Write-Host "Error: $TestConnection" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 PostgreSQL Installation Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host "📋 Connection Details:" -ForegroundColor Cyan
Write-Host "  Host: localhost" -ForegroundColor White
Write-Host "  Port: $Port" -ForegroundColor White
Write-Host "  Username: $SuperUser" -ForegroundColor White
Write-Host "  Password: $SuperUserPassword" -ForegroundColor White
Write-Host "  Database: postgres" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your .env file with the database connection string" -ForegroundColor White
Write-Host "2. Run: npm run setup:db" -ForegroundColor White
Write-Host "3. Start your application: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📚 Useful Commands:" -ForegroundColor Cyan
Write-Host "  Start Service: Start-Service postgresql" -ForegroundColor White
Write-Host "  Stop Service:  Stop-Service postgresql" -ForegroundColor White
Write-Host "  Connect:       psql -U postgres -h localhost" -ForegroundColor White
Write-Host "  pgAdmin:       Start-Process '$InstallDir\pgAdmin 4\bin\pgAdmin4.exe'" -ForegroundColor White

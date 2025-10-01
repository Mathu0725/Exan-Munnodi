# Reset PostgreSQL Password Script
Write-Host "🔧 PostgreSQL Password Reset" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green

# Stop PostgreSQL service
Write-Host "🛑 Stopping PostgreSQL service..." -ForegroundColor Yellow
Stop-Service postgresql-x64-18

# Create temporary password file
$PasswordFile = "$env:TEMP\pgpass.txt"
"ExamMunnodi2025!" | Out-File -FilePath $PasswordFile -Encoding ASCII

# Start PostgreSQL in single-user mode to reset password
Write-Host "🔑 Resetting postgres user password..." -ForegroundColor Yellow
$PostgreSQLBin = "C:\Program Files\PostgreSQL\18\bin"
$DataDir = "C:\Program Files\PostgreSQL\18\data"

# Start PostgreSQL in single-user mode
Start-Process -FilePath "$PostgreSQLBin\postgres.exe" -ArgumentList "--single -D `"$DataDir`"" -Wait

# Alternative: Use pg_ctl to reset password
Write-Host "🔄 Attempting password reset..." -ForegroundColor Yellow
& "$PostgreSQLBin\pg_ctl.exe" -D "$DataDir" -l "$env:TEMP\postgres.log" start

# Wait a moment for service to start
Start-Sleep -Seconds 3

# Try to connect and set password
Write-Host "🔐 Setting new password..." -ForegroundColor Yellow
$SQLCommand = "ALTER USER postgres PASSWORD 'ExamMunnodi2025!';"
echo $SQLCommand | & "$PostgreSQLBin\psql.exe" -U postgres -d postgres

# Clean up
Remove-Item $PasswordFile -ErrorAction SilentlyContinue

Write-Host "✅ Password reset complete!" -ForegroundColor Green
Write-Host "Try connecting with: psql -U postgres" -ForegroundColor Cyan

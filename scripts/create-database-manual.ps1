# Manual Database Creation Script
Write-Host "🗄️ Manual Database Creation" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green

$PostgreSQLBin = "C:\Program Files\PostgreSQL\18\bin"

Write-Host "📋 Step-by-step instructions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Open pgAdmin (should be installed with PostgreSQL)" -ForegroundColor White
Write-Host "   - Look for 'pgAdmin 4' in Start Menu" -ForegroundColor White
Write-Host "   - Or run: Start-Process 'C:\Program Files\PostgreSQL\18\pgAdmin 4\bin\pgAdmin4.exe'" -ForegroundColor White
Write-Host ""
Write-Host "2. Connect to PostgreSQL server:" -ForegroundColor White
Write-Host "   - Host: localhost" -ForegroundColor White
Write-Host "   - Port: 5432" -ForegroundColor White
Write-Host "   - Username: postgres" -ForegroundColor White
Write-Host "   - Password: [try 'postgres' or 'admin' or your installation password]" -ForegroundColor White
Write-Host ""
Write-Host "3. Create database:" -ForegroundColor White
Write-Host "   - Right-click 'Databases' -> 'Create' -> 'Database'" -ForegroundColor White
Write-Host "   - Name: exam_munnodi" -ForegroundColor White
Write-Host "   - Owner: postgres" -ForegroundColor White
Write-Host ""
Write-Host "4. Create user:" -ForegroundColor White
Write-Host "   - Right-click 'Login/Group Roles' -> 'Create' -> 'Login/Group Role'" -ForegroundColor White
Write-Host "   - Name: exam_user" -ForegroundColor White
Write-Host "   - Password: ExamMunnodi2025!" -ForegroundColor White
Write-Host "   - Privileges: Can login, Superuser" -ForegroundColor White
Write-Host ""

# Try to open pgAdmin
Write-Host "🚀 Opening pgAdmin..." -ForegroundColor Yellow
try {
    Start-Process "C:\Program Files\PostgreSQL\18\pgAdmin 4\bin\pgAdmin4.exe"
    Write-Host "✅ pgAdmin opened!" -ForegroundColor Green
} catch {
    Write-Host "❌ Could not open pgAdmin automatically" -ForegroundColor Red
    Write-Host "Please open it manually from Start Menu" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Alternative: Try these commands in Command Prompt:" -ForegroundColor Cyan
Write-Host "cd `"C:\Program Files\PostgreSQL\18\bin`"" -ForegroundColor White
Write-Host "psql -U postgres" -ForegroundColor White
Write-Host "CREATE DATABASE exam_munnodi;" -ForegroundColor White
Write-Host "CREATE USER exam_user WITH PASSWORD 'ExamMunnodi2025!';" -ForegroundColor White
Write-Host "GRANT ALL PRIVILEGES ON DATABASE exam_munnodi TO exam_user;" -ForegroundColor White
Write-Host "\q" -ForegroundColor White

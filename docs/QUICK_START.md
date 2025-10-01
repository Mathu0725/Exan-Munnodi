# 🚀 Quick Start Guide - Exam Munnodi

This guide will help you get Exam Munnodi up and running in minutes using PowerShell.

## 📋 Prerequisites

- **Windows 10/11** (64-bit)
- **PowerShell 5.1+** (comes with Windows)
- **Node.js 18+** ([Download here](https://nodejs.org/))
- **Administrator privileges** (required for PostgreSQL installation)

## 🎯 One-Command Setup

### Option 1: Complete Automated Setup (Recommended)

```powershell
# Run PowerShell as Administrator
# Navigate to your project directory
cd "C:\Users\shath\Desktop\New folder (9)\New folder"

# Run the complete setup script
npm run setup:complete
```

This single command will:
- ✅ Install PostgreSQL 18
- ✅ Create database and user
- ✅ Update environment configuration
- ✅ Install all dependencies
- ✅ Deploy database schema
- ✅ Create initial data

### Option 2: Step-by-Step Setup

If you prefer to run each step individually:

```powershell
# 1. Install PostgreSQL
npm run setup:postgresql

# 2. Create database and user
npm run setup:database

# 3. Install dependencies
npm install --legacy-peer-deps

# 4. Generate Prisma client
npx prisma generate

# 5. Push database schema
npx prisma db push

# 6. Create initial data
npm run setup:db
```

## 🔧 Manual Setup (Alternative)

If the automated scripts don't work, follow these manual steps:

### Step 1: Install PostgreSQL

1. Download PostgreSQL 18 from [postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer as Administrator
3. Use these settings:
   - **Password**: `ExamMunnodi2025!`
   - **Port**: `5432`
   - **Locale**: `Default locale`

### Step 2: Create Database

```sql
-- Connect to PostgreSQL as postgres user
psql -U postgres

-- Create database and user
CREATE DATABASE exam_munnodi;
CREATE USER exam_user WITH PASSWORD 'ExamMunnodi2025!';
GRANT ALL PRIVILEGES ON DATABASE exam_munnodi TO exam_user;
ALTER USER exam_user CREATEDB;
\q
```

### Step 3: Update Environment

Update your `.env` file:
```env
DATABASE_URL="postgresql://exam_user:ExamMunnodi2025!@localhost:5432/exam_munnodi"
```

### Step 4: Setup Application

```bash
# Install dependencies
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Create initial data
npm run setup:db
```

## 🚀 Start the Application

```bash
# Start development server
npm run dev

# Open browser
# Navigate to: http://localhost:3000
```

## 🔑 Login Credentials

After setup, you can login with:
- **Email**: `admin@example.com`
- **Password**: `Admin@123`

## 🛠️ Troubleshooting

### PostgreSQL Installation Issues

```powershell
# Check if PostgreSQL service is running
Get-Service postgresql

# Start PostgreSQL service
Start-Service postgresql

# Check PostgreSQL version
psql --version
```

### Database Connection Issues

```powershell
# Test database connection
psql -U exam_user -h localhost -d exam_munnodi

# Check if database exists
psql -U postgres -c "\l"
```

### Application Issues

```bash
# Check if all dependencies are installed
npm list

# Regenerate Prisma client
npx prisma generate

# Reset database
npx prisma db push --force-reset
```

## 📊 Verification

After setup, verify everything is working:

1. **PostgreSQL**: Service running on port 5432
2. **Database**: `exam_munnodi` exists with tables
3. **Application**: Runs on http://localhost:3000
4. **Login**: Can login with admin credentials

## 🔧 Useful Commands

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server

# Database
npx prisma studio          # Open database UI
npx prisma db push         # Push schema changes
npx prisma generate        # Generate Prisma client

# Setup
npm run setup:complete     # Complete automated setup
npm run generate-secrets   # Generate new JWT secrets
```

## 📚 Next Steps

1. **Explore the Application**: Login and explore the admin panel
2. **Create Users**: Add students and staff members
3. **Setup Subjects**: Create subjects and categories
4. **Add Questions**: Build your question bank
5. **Create Exams**: Set up exams for students

## 🆘 Need Help?

- **Documentation**: Check `docs/` folder
- **Issues**: Create an issue on GitHub
- **Support**: Contact the development team

---

**🎉 Congratulations! Your Exam Munnodi application is ready to use!**

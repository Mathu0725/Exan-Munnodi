# PostgreSQL Setup Guide

## Windows Installation

### Option 1: Using PostgreSQL Installer (Recommended)
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer as Administrator
3. Choose installation directory (default: `C:\Program Files\PostgreSQL\16`)
4. Set password for `postgres` user (remember this!)
5. Choose port (default: 5432)
6. Choose locale (default: Default locale)
7. Complete installation

### Option 2: Using Chocolatey
```bash
# Install Chocolatey first if not installed
# Then run:
choco install postgresql
```

### Option 3: Using Docker
```bash
# Run PostgreSQL in Docker
docker run --name postgres-exam-munnodi -e POSTGRES_PASSWORD=yourpassword -e POSTGRES_DB=exam_munnodi -p 5432:5432 -d postgres:16
```

## Database Setup

### 1. Connect to PostgreSQL
```bash
# Using psql command line
psql -U postgres -h localhost

# Or using pgAdmin (GUI tool)
# Download from: https://www.pgadmin.org/download/
```

### 2. Create Database and User
```sql
-- Connect as postgres user
CREATE DATABASE exam_munnodi;
CREATE USER exam_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE exam_munnodi TO exam_user;
ALTER USER exam_user CREATEDB;
```

### 3. Update .env file
```env
DATABASE_URL="postgresql://exam_user:your_secure_password@localhost:5432/exam_munnodi"
```

### 4. Run Prisma Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Or run migrations
npx prisma migrate dev --name init
```

## Verification

### Test Connection
```bash
# Test database connection
npx prisma db pull
```

### Check Tables
```sql
-- Connect to database
\c exam_munnodi

-- List tables
\dt

-- Check users table
SELECT * FROM "User" LIMIT 5;
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if PostgreSQL service is running
   - Verify port 5432 is not blocked
   - Check firewall settings

2. **Authentication Failed**
   - Verify username and password
   - Check pg_hba.conf file
   - Ensure user has proper permissions

3. **Database Does Not Exist**
   - Create database manually
   - Check database name in connection string

### Windows Service Management
```bash
# Start PostgreSQL service
net start postgresql-x64-16

# Stop PostgreSQL service
net stop postgresql-x64-16

# Check service status
sc query postgresql-x64-16
```

## Production Considerations

1. **Security**
   - Use strong passwords
   - Enable SSL connections
   - Restrict network access
   - Regular security updates

2. **Performance**
   - Configure shared_buffers
   - Set effective_cache_size
   - Enable connection pooling

3. **Backup**
   - Set up automated backups
   - Test restore procedures
   - Monitor disk space

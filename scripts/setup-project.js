const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Exam Munnodi Project Setup');
console.log('==============================\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file...');
  try {
    execSync('cp .env.example .env', { stdio: 'inherit' });
    console.log('✅ .env file created from .env.example');
  } catch (error) {
    console.log('⚠️  Please create .env file manually from .env.example');
  }
} else {
  console.log('ℹ️  .env file already exists');
}

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('✅ Dependencies installed');
} catch (error) {
  console.log('❌ Failed to install dependencies');
  process.exit(1);
}

// Generate Prisma client
console.log('\n🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated');
} catch (error) {
  console.log('❌ Failed to generate Prisma client');
  console.log('Please check your DATABASE_URL in .env file');
}

// Check database connection
console.log('\n🔍 Checking database connection...');
try {
  execSync('npx prisma db push', { stdio: 'inherit' });
  console.log('✅ Database connection successful');
  
  // Run database setup
  console.log('\n🌱 Setting up database with initial data...');
  execSync('node scripts/setup-database.js', { stdio: 'inherit' });
  
} catch (error) {
  console.log('❌ Database setup failed');
  console.log('Please check:');
  console.log('1. PostgreSQL is installed and running');
  console.log('2. DATABASE_URL in .env is correct');
  console.log('3. Database and user exist');
  console.log('\nSee docs/POSTGRESQL_SETUP.md for detailed instructions');
}

console.log('\n🎉 Setup completed!');
console.log('\nNext steps:');
console.log('1. Update .env with your actual database credentials');
console.log('2. Run: npm run dev');
console.log('3. Visit: http://localhost:3000');
console.log('4. Login with: admin@example.com / Admin@123');


const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Create admin user if not exists
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@example.com' }
    });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin@123', 12);
      
      const admin = await prisma.user.create({
        data: {
          name: 'Super Admin',
          email: 'admin@example.com',
          password: hashedPassword,
          role: 'Super Admin',
          status: 'Active',
          institution: 'Exam Munnodi',
        }
      });
      
      console.log('✅ Admin user created:', admin.email);
    } else {
      console.log('ℹ️  Admin user already exists');
    }
    
    // Create sample categories
    const categories = [
      { name: 'General Knowledge', slug: 'general-knowledge' },
      { name: 'Mathematics', slug: 'mathematics' },
      { name: 'Science', slug: 'science' },
      { name: 'English', slug: 'english' },
      { name: 'History', slug: 'history' }
    ];
    
    for (const category of categories) {
      const exists = await prisma.category.findUnique({
        where: { slug: category.slug }
      });
      
      if (!exists) {
        await prisma.category.create({
          data: category
        });
        console.log(`✅ Category created: ${category.name}`);
      }
    }
    
    // Create sample subjects
    const subjects = [
      { name: 'Mathematics', slug: 'mathematics' },
      { name: 'Physics', slug: 'physics' },
      { name: 'Chemistry', slug: 'chemistry' },
      { name: 'Biology', slug: 'biology' },
      { name: 'English Literature', slug: 'english-literature' }
    ];
    
    for (const subject of subjects) {
      const exists = await prisma.subject.findUnique({
        where: { slug: subject.slug }
      });
      
      if (!exists) {
        await prisma.subject.create({
          data: subject
        });
        console.log(`✅ Subject created: ${subject.name}`);
      }
    }
    
    // Create sample exam types
    const examTypes = [
      { name: 'Quiz', slug: 'quiz' },
      { name: 'Midterm', slug: 'midterm' },
      { name: 'Final Exam', slug: 'final-exam' },
      { name: 'Practice Test', slug: 'practice-test' }
    ];
    
    for (const examType of examTypes) {
      const exists = await prisma.examType.findUnique({
        where: { slug: examType.slug }
      });
      
      if (!exists) {
        await prisma.examType.create({
          data: examType
        });
        console.log(`✅ Exam type created: ${examType.name}`);
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('📋 Login Credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123');
    console.log('');
    console.log('🚀 You can now start the development server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();


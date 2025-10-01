const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('📊 Checking database data...\n');
    
    const subjects = await prisma.subject.findMany();
    const categories = await prisma.category.findMany();
    
    console.log('✅ SUBJECTS:');
    subjects.forEach(s => console.log(`  - ID: ${s.id}, Name: ${s.name}`));
    console.log('');
    
    console.log('✅ CATEGORIES:');
    categories.forEach(c => console.log(`  - ID: ${c.id}, Name: ${c.name}`));
    console.log('');
    
    console.log('💡 When uploading questions via CSV, use these IDs:');
    console.log('   - For subject_id: Use one of the Subject IDs above');
    console.log('   - For category_id: Use one of the Category IDs above');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();

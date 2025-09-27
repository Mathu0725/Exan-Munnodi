import { NextResponse } from 'next/server';
import { PrismaQuestionRepository } from '@/infrastructure/repositories/prismaQuestionRepository';

const questionRepository = new PrismaQuestionRepository();

export async function POST() {
  try {
    console.log('Starting duplicate cleanup...');
    
    // Get all questions grouped by title, subject, and category
    const allQuestions = await questionRepository.list({ 
      page: 1, 
      limit: 10000 // Get all questions
    });

    const duplicates = [];
    const processed = new Set();

    // Group questions by title, subjectId, and categoryId
    const groups = {};
    for (const question of allQuestions.data) {
      const key = `${question.title.toLowerCase()}_${question.subjectId}_${question.categoryId}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(question);
    }

    // Find groups with duplicates
    for (const [key, questions] of Object.entries(groups)) {
      if (questions.length > 1) {
        // Sort by creation date, keep the newest one
        questions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        const toKeep = questions[0];
        const toRemove = questions.slice(1);
        
        duplicates.push({
          key,
          keep: toKeep,
          remove: toRemove
        });
      }
    }

    let removedCount = 0;
    let duplicateGroups = 0;

    // Remove duplicates
    for (const duplicate of duplicates) {
      duplicateGroups++;
      console.log(`Processing duplicate group: ${duplicate.key}`);
      console.log(`Keeping question ID: ${duplicate.keep.id}`);
      
      for (const question of duplicate.remove) {
        await questionRepository.delete(question.id);
        removedCount++;
        console.log(`Removed duplicate question ID: ${question.id} - "${question.title}"`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Duplicate cleanup completed`,
      stats: {
        duplicateGroups,
        removedCount,
        totalProcessed: allQuestions.data.length
      }
    });

  } catch (error) {
    console.error('Duplicate cleanup failed:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

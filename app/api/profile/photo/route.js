import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyAuth } from '@/lib/auth-middleware';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    // Verify authentication
    const authResult = await verifyAuth(request);

    if (!authResult.success) {
      return authResult.error;
    }

    const user = authResult.user;

    const formData = await request.formData();
    const file = formData.get('photo');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const filename = `avatar_${decoded.id}_${timestamp}.${extension}`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadsDir, { recursive: true });

    // Save file
    const filePath = join(uploadsDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Generate public URL
    const avatarUrl = `/uploads/avatars/${filename}`;

    // Update user's avatar in database
    await prisma.user.update({
      where: { id: decoded.id },
      data: { avatarUrl },
    });

    return NextResponse.json({ 
      success: true, 
      avatarUrl,
      message: 'Photo uploaded successfully' 
    });

  } catch (error) {
    console.error('Photo upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

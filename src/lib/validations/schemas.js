import { z } from 'zod';

// Common validation patterns
const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required');
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long');
const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(100, 'Name too long')
  .trim();
const phoneSchema = z
  .string()
  .regex(/^[+]?[1-9][\d]{0,15}$/, 'Invalid phone number format')
  .optional();
const idSchema = z.string().min(1, 'ID is required');
const positiveIntSchema = z
  .number()
  .int()
  .positive('Must be a positive integer');
const nonNegativeIntSchema = z
  .number()
  .int()
  .min(0, 'Must be a non-negative integer');

// Auth validation schemas
export const authSchemas = {
  login: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),

  register: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
    phone: phoneSchema,
    role: z.enum(['STUDENT', 'TEACHER', 'ADMIN'], {
      errorMap: () => ({ message: 'Role must be STUDENT, TEACHER, or ADMIN' }),
    }),
  }),

  forgotPassword: z.object({
    email: emailSchema,
  }),

  resetPassword: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    otp: z
      .string()
      .length(6, 'OTP must be 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
  }),

  resetPasswordOtp: z.object({
    otp: z
      .string()
      .length(6, 'OTP must be 6 digits')
      .regex(/^\d{6}$/, 'OTP must contain only digits'),
    password: passwordSchema,
  }),
};

// Subject validation schemas
export const subjectSchemas = {
  create: z.object({
    name: nameSchema,
    description: z.string().max(500, 'Description too long').optional(),
    order: nonNegativeIntSchema.optional(),
  }),

  update: z.object({
    name: nameSchema.optional(),
    description: z.string().max(500, 'Description too long').optional(),
    order: nonNegativeIntSchema.optional(),
  }),
};

// Question validation schemas
export const questionSchemas = {
  create: z.object({
    question: z
      .string()
      .min(1, 'Question is required')
      .max(2000, 'Question too long'),
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK'], {
      errorMap: () => ({
        message: 'Type must be MULTIPLE_CHOICE, TRUE_FALSE, or FILL_IN_BLANK',
      }),
    }),
    options: z
      .array(
        z.string().min(1, 'Option cannot be empty').max(500, 'Option too long')
      )
      .min(2, 'At least 2 options required')
      .max(10, 'Too many options'),
    correctAnswer: z.string().min(1, 'Correct answer is required'),
    explanation: z.string().max(1000, 'Explanation too long').optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
      errorMap: () => ({ message: 'Difficulty must be EASY, MEDIUM, or HARD' }),
    }),
    subjectId: positiveIntSchema,
    subSubjectId: positiveIntSchema.optional(),
    categoryId: positiveIntSchema.optional(),
    tags: z
      .array(z.string().min(1, 'Tag cannot be empty').max(50, 'Tag too long'))
      .max(10, 'Too many tags')
      .optional(),
  }),

  update: z.object({
    question: z
      .string()
      .min(1, 'Question is required')
      .max(2000, 'Question too long')
      .optional(),
    type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK']).optional(),
    options: z
      .array(
        z.string().min(1, 'Option cannot be empty').max(500, 'Option too long')
      )
      .min(2, 'At least 2 options required')
      .max(10, 'Too many options')
      .optional(),
    correctAnswer: z.string().min(1, 'Correct answer is required').optional(),
    explanation: z.string().max(1000, 'Explanation too long').optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    subjectId: positiveIntSchema.optional(),
    subSubjectId: positiveIntSchema.optional(),
    categoryId: positiveIntSchema.optional(),
    tags: z
      .array(z.string().min(1, 'Tag cannot be empty').max(50, 'Tag too long'))
      .max(10, 'Too many tags')
      .optional(),
  }),

  list: z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
    search: z.string().max(100, 'Search query too long').optional(),
    subject_id: z.coerce.number().int().positive().optional(),
    sub_subject_id: z.coerce.number().int().positive().optional(),
    category_id: z.coerce.number().int().positive().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  }),
};

// Category validation schemas
export const categorySchemas = {
  create: z.object({
    name: nameSchema,
    description: z.string().max(500, 'Description too long').optional(),
    order: nonNegativeIntSchema.optional(),
  }),

  update: z.object({
    name: nameSchema.optional(),
    description: z.string().max(500, 'Description too long').optional(),
    order: nonNegativeIntSchema.optional(),
  }),

  list: z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
    search: z.string().max(100, 'Search query too long').optional(),
  }),
};

// Exam validation schemas
export const examSchemas = {
  create: z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().max(1000, 'Description too long').optional(),
    duration: z
      .number()
      .int()
      .min(1, 'Duration must be at least 1 minute')
      .max(480, 'Duration cannot exceed 8 hours'),
    totalQuestions: z
      .number()
      .int()
      .min(1, 'Must have at least 1 question')
      .max(200, 'Too many questions'),
    passingScore: z
      .number()
      .min(0, 'Passing score cannot be negative')
      .max(100, 'Passing score cannot exceed 100'),
    examTypeId: positiveIntSchema,
    subjectId: positiveIntSchema.optional(),
    categoryId: positiveIntSchema.optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    isActive: z.boolean().optional(),
    instructions: z.string().max(2000, 'Instructions too long').optional(),
  }),

  update: z.object({
    title: z
      .string()
      .min(1, 'Title is required')
      .max(200, 'Title too long')
      .optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    duration: z
      .number()
      .int()
      .min(1, 'Duration must be at least 1 minute')
      .max(480, 'Duration cannot exceed 8 hours')
      .optional(),
    totalQuestions: z
      .number()
      .int()
      .min(1, 'Must have at least 1 question')
      .max(200, 'Too many questions')
      .optional(),
    passingScore: z
      .number()
      .min(0, 'Passing score cannot be negative')
      .max(100, 'Passing score cannot exceed 100')
      .optional(),
    examTypeId: positiveIntSchema.optional(),
    subjectId: positiveIntSchema.optional(),
    categoryId: positiveIntSchema.optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
    isActive: z.boolean().optional(),
    instructions: z.string().max(2000, 'Instructions too long').optional(),
  }),

  list: z.object({
    status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
    query: z.string().max(100, 'Search query too long').optional(),
    examTypeId: z.coerce.number().int().positive().optional(),
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
  }),
};

// Profile validation schemas
export const profileSchemas = {
  get: z
    .object({
      id: z.string().min(1, 'ID is required').optional(),
      email: emailSchema.optional(),
    })
    .refine(data => data.id || data.email, {
      message: 'Either id or email is required',
    }),

  update: z.object({
    name: nameSchema.optional(),
    phone: phoneSchema,
    bio: z.string().max(500, 'Bio too long').optional(),
    address: z.string().max(200, 'Address too long').optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
    profilePicture: z.string().url('Invalid profile picture URL').optional(),
  }),
};

// Notification validation schemas
export const notificationSchemas = {
  list: z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
    unreadOnly: z.coerce.boolean().optional(),
  }),

  markAsRead: z.object({
    notificationIds: z
      .array(z.number().int().positive())
      .min(1, 'At least one notification ID is required'),
  }),
};

// SubSubject validation schemas
export const subSubjectSchemas = {
  create: z.object({
    name: nameSchema,
    description: z.string().max(500, 'Description too long').optional(),
    subjectId: positiveIntSchema,
    order: nonNegativeIntSchema.optional(),
  }),

  update: z.object({
    name: nameSchema.optional(),
    description: z.string().max(500, 'Description too long').optional(),
    subjectId: positiveIntSchema.optional(),
    order: nonNegativeIntSchema.optional(),
  }),
};

// ExamType validation schemas
export const examTypeSchemas = {
  create: z.object({
    name: nameSchema,
    description: z.string().max(500, 'Description too long').optional(),
    duration: z
      .number()
      .int()
      .min(1, 'Duration must be at least 1 minute')
      .max(480, 'Duration cannot exceed 8 hours')
      .optional(),
    totalQuestions: z
      .number()
      .int()
      .min(1, 'Must have at least 1 question')
      .max(200, 'Too many questions')
      .optional(),
    passingScore: z
      .number()
      .min(0, 'Passing score cannot be negative')
      .max(100, 'Passing score cannot exceed 100')
      .optional(),
  }),

  update: z.object({
    name: nameSchema.optional(),
    description: z.string().max(500, 'Description too long').optional(),
    duration: z
      .number()
      .int()
      .min(1, 'Duration must be at least 1 minute')
      .max(480, 'Duration cannot exceed 8 hours')
      .optional(),
    totalQuestions: z
      .number()
      .int()
      .min(1, 'Must have at least 1 question')
      .max(200, 'Too many questions')
      .optional(),
    passingScore: z
      .number()
      .min(0, 'Passing score cannot be negative')
      .max(100, 'Passing score cannot exceed 100')
      .optional(),
  }),
};

// Staff validation schemas
export const staffSchemas = {
  list: z.object({
    page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
    limit: z.coerce
      .number()
      .int()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
    search: z.string().max(100, 'Search query too long').optional(),
    role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  }),
};

// Student Group validation schemas
export const studentGroupSchemas = {
  create: z.object({
    name: nameSchema,
    description: z.string().max(500, 'Description too long').optional(),
    grade: z.string().min(1, 'Grade is required').max(20, 'Grade too long'),
    academicYear: z
      .string()
      .min(1, 'Academic year is required')
      .max(20, 'Academic year too long'),
  }),

  update: z.object({
    name: nameSchema.optional(),
    description: z.string().max(500, 'Description too long').optional(),
    grade: z
      .string()
      .min(1, 'Grade is required')
      .max(20, 'Grade too long')
      .optional(),
    academicYear: z
      .string()
      .min(1, 'Academic year is required')
      .max(20, 'Academic year too long')
      .optional(),
  }),
};

// Export all schemas for easy access
export const schemas = {
  auth: authSchemas,
  subject: subjectSchemas,
  question: questionSchemas,
  category: categorySchemas,
  exam: examSchemas,
  profile: profileSchemas,
  notification: notificationSchemas,
  subSubject: subSubjectSchemas,
  examType: examTypeSchemas,
  staff: staffSchemas,
  studentGroup: studentGroupSchemas,
};

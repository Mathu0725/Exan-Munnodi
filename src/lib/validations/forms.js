import { z } from 'zod';

/**
 * Frontend form validation schemas
 * These match the backend validation schemas for consistency
 */

// Login form validation
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

// Registration form validation
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name must be less than 100 characters')
      .trim(),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address')
      .trim()
      .toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    phone: z
      .string()
      .optional()
      .refine(
        val => !val || /^[+]?[1-9][\d]{0,15}$/.test(val),
        'Please enter a valid phone number'
      ),
    institution: z
      .string()
      .optional()
      .refine(
        val => !val || val.length >= 2,
        'Institution name must be at least 2 characters'
      ),
    role: z.enum(['STUDENT', 'TEACHER', 'ADMIN']).default('STUDENT'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Password reset request form validation
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .trim()
    .toLowerCase(),
});

// Password reset form validation
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    otp: z
      .string()
      .optional()
      .refine(val => !val || /^\d{6}$/.test(val), 'OTP must be 6 digits'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

// Profile update form validation
export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  phone: z
    .string()
    .optional()
    .refine(
      val => !val || /^[+]?[1-9][\d]{0,15}$/.test(val),
      'Please enter a valid phone number'
    ),
  institution: z
    .string()
    .optional()
    .refine(
      val => !val || val.length >= 2,
      'Institution name must be at least 2 characters'
    ),
});

// Password change form validation
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });

// Question form validation
export const questionSchema = z.object({
  question: z
    .string()
    .min(5, 'Question must be at least 5 characters')
    .max(1000, 'Question must be less than 1000 characters')
    .trim(),
  body: z
    .string()
    .optional()
    .refine(
      val => !val || val.length >= 5,
      'Question body must be at least 5 characters'
    ),
  subjectId: z
    .number()
    .int('Subject ID must be an integer')
    .positive('Please select a subject'),
  subSubjectId: z
    .number()
    .int('Sub-subject ID must be an integer')
    .positive('Please select a sub-subject')
    .optional(),
  categoryId: z
    .number()
    .int('Category ID must be an integer')
    .positive('Please select a category'),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  tags: z.array(z.string().trim()).optional().default([]),
  options: z
    .array(
      z.object({
        text: z.string().min(1, 'Option text cannot be empty').trim(),
        isCorrect: z.boolean().default(false),
      })
    )
    .min(2, 'At least two options are required')
    .max(6, 'Maximum 6 options allowed'),
});

// Exam form validation
export const examSchema = z
  .object({
    title: z
      .string()
      .min(5, 'Exam title must be at least 5 characters')
      .max(200, 'Exam title must be less than 200 characters')
      .trim(),
    description: z
      .string()
      .optional()
      .refine(
        val => !val || val.length >= 10,
        'Description must be at least 10 characters'
      ),
    duration: z
      .number()
      .int('Duration must be an integer')
      .min(1, 'Duration must be at least 1 minute')
      .max(480, 'Duration cannot exceed 8 hours'),
    maxAttempts: z
      .number()
      .int('Max attempts must be an integer')
      .min(1, 'Max attempts must be at least 1')
      .max(10, 'Max attempts cannot exceed 10')
      .default(1),
    startDate: z
      .string()
      .min(1, 'Start date is required')
      .refine(
        val => new Date(val) > new Date(),
        'Start date must be in the future'
      ),
    endDate: z.string().min(1, 'End date is required'),
    subjectId: z
      .number()
      .int('Subject ID must be an integer')
      .positive('Please select a subject'),
    categoryIds: z
      .array(z.number().int().positive())
      .min(1, 'Please select at least one category'),
    questionCount: z
      .number()
      .int('Question count must be an integer')
      .min(1, 'At least 1 question is required')
      .max(200, 'Maximum 200 questions allowed'),
    passingScore: z
      .number()
      .int('Passing score must be an integer')
      .min(0, 'Passing score cannot be negative')
      .max(100, 'Passing score cannot exceed 100')
      .default(60),
  })
  .refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

// Student group form validation
export const studentGroupSchema = z.object({
  name: z
    .string()
    .min(2, 'Group name must be at least 2 characters')
    .max(100, 'Group name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .optional()
    .refine(
      val => !val || val.length >= 5,
      'Description must be at least 5 characters'
    ),
  studentIds: z
    .array(z.number().int().positive())
    .min(1, 'Please select at least one student')
    .max(100, 'Maximum 100 students per group'),
});

// Subject form validation
export const subjectSchema = z.object({
  name: z
    .string()
    .min(2, 'Subject name must be at least 2 characters')
    .max(100, 'Subject name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .optional()
    .refine(
      val => !val || val.length >= 5,
      'Description must be at least 5 characters'
    ),
  order: z
    .number()
    .int('Order must be an integer')
    .min(0, 'Order cannot be negative')
    .optional(),
});

// Category form validation
export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters')
    .max(100, 'Category name must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .optional()
    .refine(
      val => !val || val.length >= 5,
      'Description must be at least 5 characters'
    ),
  order: z
    .number()
    .int('Order must be an integer')
    .min(0, 'Order cannot be negative')
    .optional(),
});

// Export all schemas
export const formSchemas = {
  login: loginSchema,
  register: registerSchema,
  forgotPassword: forgotPasswordSchema,
  resetPassword: resetPasswordSchema,
  profileUpdate: profileUpdateSchema,
  changePassword: changePasswordSchema,
  question: questionSchema,
  exam: examSchema,
  studentGroup: studentGroupSchema,
  subject: subjectSchema,
  category: categorySchema,
};

// Helper function to get field error
export const getFieldError = (errors, fieldName) => {
  const fieldError = errors[fieldName];
  return fieldError?.message || '';
};

// Helper function to check if field has error
export const hasFieldError = (errors, fieldName) => {
  return !!errors[fieldName];
};

// Helper function to get field class names
export const getFieldClassName = (errors, fieldName, baseClassName = '') => {
  const hasError = hasFieldError(errors, fieldName);
  const errorClass = hasError
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500';
  return `${baseClassName} ${errorClass}`.trim();
};

import { Page } from '@playwright/test';

type UserRole = 'admin' | 'student' | 'editor';

const credentials = {
  admin: {
    email: 'admin@example.com',
    password: 'Admin@123',
  },
  student: {
    email: 'student@example.com',
    password: 'Student@123',
  },
  editor: {
    email: 'editor@example.com',
    password: 'Editor@123',
  },
};

export async function loginAs(page: Page, role: UserRole) {
  const user = credentials[role];
  if (!user) {
    throw new Error(`Invalid user role: ${role}`);
  }

  await page.goto('/login-3d');
  await page.getByLabel('Email address').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/');
}

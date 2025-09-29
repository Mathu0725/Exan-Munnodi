import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test('login with admin credentials', async ({ page }) => {
    await page.goto('/login-3d');
    await page.getByLabel('Email address').fill('admin@example.com');
    await page.getByLabel('Password').fill('Admin@123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/');
  });

  test('pending user sees account status message', async ({ page }) => {
    await page.goto('/login-3d');
    await page.getByLabel('Email address').fill('pending.student@example.com');
    await page.getByLabel('Password').fill('Student@123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Account not active')).toBeVisible();
  });

  test('invalid credentials shows error', async ({ page }) => {
    await page.goto('/login-3d');
    await page.getByLabel('Email address').fill('admin@example.com');
    await page.getByLabel('Password').fill('WrongPassword');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toContainText(/invalid credentials/i);
  });

  test('user can register and see pending approval message', async ({ page }) => {
    const uniqueEmail = `student+${Date.now()}@example.com`;

    await page.goto('/register');

    await page.getByLabel('Full name').fill('Test Student');
    await page.getByLabel('Email address').fill(uniqueEmail);
    await page.getByLabel('Password', { exact: true }).fill('Student@123');
    await page.getByLabel('Confirm Password').fill('Student@123');
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText(/pending approval|check your email/i)).toBeVisible();
  });
});

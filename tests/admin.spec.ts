import { test, expect } from '@playwright/test';
import { loginAs } from './utils';

test.describe('Admin flows', () => {
  // Note: This test assumes a user with the email 'pending.student@example.com'
  // exists in the database and has a 'Pending' status.
  // The seed script should create this user.
  test('admin can approve a pending user', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/users');
    await page.getByRole('row', { name: /pending/i }).getByRole('button', { name: /approve/i }).click();
    await expect(page.getByText(/approved/i)).toBeVisible();
  });
});

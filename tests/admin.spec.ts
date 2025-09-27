import { test, expect } from '@playwright/test';
import { loginAs } from './utils';

test.describe('Admin flows', () => {
  // Note: This test assumes a user with the email 'pending.student@example.com'
  // exists in the database and has a 'Pending' status.
  // The seed script should create this user.
  test('admin can approve a pending user', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/users');

    const userRow = page.getByRole('row', { name: /pending.student@example.com/i });
    await expect(userRow).toBeVisible();
    await expect(userRow).toContainText('Pending');

    await userRow.getByRole('button', { name: 'Actions' }).click();
    await page.getByRole('menuitem', { name: 'Approve' }).click();

    await page.getByRole('button', { name: 'Confirm' }).click();

    await expect(page.getByRole('alert')).toContainText(/User status updated/i);
    await expect(userRow).not.toContainText('Pending');
    await expect(userRow).toContainText('Approved');
  });
});

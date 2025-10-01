import { test, expect } from '@playwright/test';
import { loginAs } from './utils';

test.describe('Exam flows', () => {
  test('admin can create a new exam', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/exams');
    await page.getByRole('button', { name: /New Exam/i }).click();
    await page.getByLabel('Title').fill(`Exam ${Date.now()}`);
    await page.getByRole('button', { name: /Create/i }).click();
    await expect(page.getByText(/created/i)).toBeVisible();
  });
});

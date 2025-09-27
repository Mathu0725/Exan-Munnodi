import { test, expect } from '@playwright/test';
import { loginAs } from './utils';

test.describe('Exam flows', () => {
  test('admin can create a new exam', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/exams');

    await page.getByRole('link', { name: 'New Exam' }).click();
    await expect(page).toHaveURL('/exams/new');

    const examTitle = `My New Exam ${Date.now()}`;
    await page.getByLabel('Exam Title').fill(examTitle);
    await page.getByLabel('Description').fill('This is a test exam.');

    // For simplicity, this test only fills the first step.
    // A more comprehensive test would go through all the wizard steps.

    await page.getByRole('button', { name: 'Next' }).click();

    // We are in step 2
    await page.getByRole('button', { name: 'Next' }).click();

    // We are in step 3
    await page.getByRole('button', { name: 'Finish' }).click();

    await expect(page).toHaveURL('/exams');
    await expect(page.getByText(examTitle)).toBeVisible();
  });
});

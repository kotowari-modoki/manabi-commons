// ABOUTME: E2E tests for the school-guide correction feedback guidance page.
// ABOUTME: Verifies the page renders and shows its main child-facing advice sections.
import { expect, test } from '@playwright/test';

const PAGE_URL = '/manabi-commons/school-guide/machigai-no-uketorikata';

test.describe('school-guide correction feedback page', () => {
  test('renders the title and summary', async ({ page }) => {
    await page.goto(PAGE_URL);

    await expect(page.getByRole('heading', { level: 1, name: 'まちがいを言われたときの受け止め方' })).toBeVisible();
    await expect(page.getByText('まちがいを言われていやな気持ちになるのは、へんなことではありません。')).toBeVisible();
  });

  test('shows the main advice sections', async ({ page }) => {
    await page.goto(PAGE_URL);

    await expect(page.getByRole('heading', { level: 2, name: 'まずは3つだけやってみよう' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '「まちがい」と「自分」をいっしょにしない' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '一人でむずかしいときは、助けてもらっていい' })).toBeVisible();
  });
});

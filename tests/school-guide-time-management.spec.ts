// ABOUTME: E2e tests for the school-guide time management page.
// ABOUTME: Verifies the new page renders and shows its main guidance sections.
import { expect, test } from '@playwright/test';

const PAGE_URL = '/manabi-commons/school-guide/kodomo-no-jikan-tsukaikata';

test.describe('school-guide time management page', () => {
  test('renders the title and summary', async ({ page }) => {
    await page.goto(PAGE_URL);

    await expect(page.getByRole('heading', { level: 1, name: '子どもの時間のつかい方' })).toBeVisible();
    await expect(page.getByText('時間を上手につかうというのは、1日をぎゅうぎゅうにすることではありません。')).toBeVisible();
  });

  test('shows the daily planning sections', async ({ page }) => {
    await page.goto(PAGE_URL);

    await expect(page.getByRole('heading', { level: 2, name: 'まずは「やること」を3つに分けよう' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '1日の時間わけの例' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'うまくいかない日があっても大丈夫' })).toBeVisible();
  });
});

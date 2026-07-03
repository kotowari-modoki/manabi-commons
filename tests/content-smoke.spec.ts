// ABOUTME: 全コンテンツページが 200 で応答し h1 が表示されることを確認するスモーク E2E です。
// ABOUTME: 記事を追加すると自動的にテスト対象へ含まれるため、記事別テストは不要です。
import { expect, test } from '@playwright/test';
import { contentRoutes } from './helpers/content-routes';

for (const route of contentRoutes()) {
  test(`renders /${route || '(top)'}`, async ({ page }) => {
    const response = await page.goto(`/manabi-commons/${route}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1').first()).toBeVisible();
  });
}

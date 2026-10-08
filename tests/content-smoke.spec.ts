// ABOUTME: 全コンテンツページの表示と共有用OGP画像の配信を確認するスモーク E2E です。
// ABOUTME: 記事を追加すると自動的にテスト対象へ含まれるため、記事別テストは不要です。
import { expect, test } from '@playwright/test';
import { contentRoutes } from './helpers/content-routes';

for (const route of contentRoutes()) {
  test(`renders /${route || '(top)'}`, async ({ page }) => {
    const response = await page.goto(`/manabi-commons/${route}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('main h1').first()).toBeVisible();

    const ogImage = page.locator('meta[property="og:image"]');
    await expect(ogImage).toHaveCount(1);
    const imageUrl = await ogImage.getAttribute('content');
    expect(imageUrl).toMatch(/^https:\/\/kotowari-modoki\.github\.io\/manabi-commons\/og\/.+\.png$/);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', imageUrl!);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

    const image = await page.request.get(new URL(imageUrl!).pathname);
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toContain('image/png');
    const png = await image.body();
    expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });
}

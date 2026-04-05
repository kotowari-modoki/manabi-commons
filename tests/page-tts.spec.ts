// ABOUTME: 各ページに追加した音声読み上げ UI の表示と基本操作を確認する E2E テストです。
// ABOUTME: 実ブラウザー上で読み上げボタンが表示され、状態が切り替わることを検証します。
import { expect, test } from '@playwright/test';

const PAGE_URL = '/manabi-commons/test/page-tts';

test.describe('page text-to-speech controls', () => {
  test('renders reading controls on a docs page', async ({ page }) => {
    await page.goto(PAGE_URL);

    const controls = page.locator('[data-tts-controls="true"]');

    await expect(controls).toBeVisible();
    await expect(controls.locator('[data-tts-status]')).toContainText('このページを読み上げます');
    await expect(controls).toHaveAttribute('data-tts-text-length', /[1-9]\d*/);
  });

  test('play and stop update the control state when speech synthesis is available', async ({ page }) => {
    await page.goto(PAGE_URL);

    const supported = await page.evaluate(
      () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
    );
    const controls = page.locator('[data-tts-controls="true"]');

    if (!supported) {
      await expect(controls.locator('[data-tts-status]')).toContainText('このブラウザーでは');
      await expect(controls.locator('[data-tts-play]')).toBeDisabled();
      return;
    }

    await controls.locator('[data-tts-play]').click();
    await expect(controls).toHaveAttribute('data-state', /speaking|paused/);
    await expect(controls.locator('[data-tts-stop]')).toBeEnabled();

    await controls.locator('[data-tts-stop]').click();
    await expect(controls).toHaveAttribute('data-state', 'idle');
  });
});

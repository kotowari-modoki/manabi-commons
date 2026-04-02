// ABOUTME: E2e tests for the AnimatedStep Astro component.
// ABOUTME: Verifies step navigation, button states, and show-all behavior.
import { test, expect } from '@playwright/test';

test.describe('AnimatedStep component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/manabi-commons/test/interactive');
  });

  test('only the first step is visible on load', async ({ page }) => {
    const stepper = page.locator('.animated-step').first();
    await expect(stepper.locator('.step-item').nth(0)).toHaveAttribute('aria-hidden', 'false');
    await expect(stepper.locator('.step-item').nth(1)).toHaveAttribute('aria-hidden', 'true');
    await expect(stepper.locator('.step-item').nth(2)).toHaveAttribute('aria-hidden', 'true');
  });

  test('prev button is disabled on the first step', async ({ page }) => {
    const stepper = page.locator('.animated-step').first();
    await expect(stepper.locator('.step-prev')).toBeDisabled();
  });

  test('next button advances to step 2 and updates counter', async ({ page }) => {
    const stepper = page.locator('.animated-step').first();
    await stepper.locator('.step-next').click();
    await expect(stepper.locator('.step-item').nth(1)).toHaveAttribute('aria-hidden', 'false');
    await expect(stepper.locator('.step-counter')).toContainText('2 / 3');
  });

  test('prev button becomes enabled after advancing', async ({ page }) => {
    const stepper = page.locator('.animated-step').first();
    await stepper.locator('.step-next').click();
    await expect(stepper.locator('.step-prev')).toBeEnabled();
  });

  test('まとめを見る button appears on the last step', async ({ page }) => {
    const stepper = page.locator('.animated-step').first();
    await stepper.locator('.step-next').click();
    await stepper.locator('.step-next').click();
    await expect(stepper.locator('.step-summary')).toBeVisible();
  });

  test('まとめを見る button reveals all steps', async ({ page }) => {
    const stepper = page.locator('.animated-step').first();
    await stepper.locator('.step-next').click();
    await stepper.locator('.step-next').click();
    await stepper.locator('.step-summary').click();
    const items = stepper.locator('.step-item');
    for (let i = 0; i < 3; i++) {
      await expect(items.nth(i)).toHaveAttribute('aria-hidden', 'false');
    }
  });

  test('prev button brings back to step 1', async ({ page }) => {
    const stepper = page.locator('.animated-step').first();
    await stepper.locator('.step-next').click();
    await stepper.locator('.step-prev').click();
    await expect(stepper.locator('.step-counter')).toContainText('1 / 3');
  });
});

// ABOUTME: E2e tests for the Quiz Astro component.
// ABOUTME: Verifies correct/incorrect answer flows, retry behavior, and localStorage persistence.
import { test, expect } from '@playwright/test';

const PAGE_URL = '/manabi-commons/test/interactive';

test.describe('Quiz component', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before navigating to ensure a clean quiz state
    await page.addInitScript(() => localStorage.clear());
    await page.goto(PAGE_URL);
  });

  test('clicking the correct answer shows 正解 feedback', async ({ page }) => {
    const quiz = page.locator('.quiz-container').first();
    // answer index is 1 (second choice: "21") in the fixture page
    await quiz.locator('.quiz-choice').nth(1).click();
    await expect(quiz.locator('.quiz-feedback')).toBeVisible();
    await expect(quiz.locator('.quiz-feedback')).toContainText('正解');
    await expect(quiz.locator('.quiz-choice').nth(1)).toHaveClass(/correct/);
  });

  test('clicking a wrong answer shows ちがいます feedback', async ({ page }) => {
    const quiz = page.locator('.quiz-container').first();
    await quiz.locator('.quiz-choice').nth(0).click();
    await expect(quiz.locator('.quiz-feedback')).toBeVisible();
    await expect(quiz.locator('.quiz-feedback')).toContainText('ちがいます');
  });

  test('wrong answer shows a retry button', async ({ page }) => {
    const quiz = page.locator('.quiz-container').first();
    await quiz.locator('.quiz-choice').nth(0).click();
    await expect(quiz.locator('.quiz-retry')).toBeVisible();
  });

  test('retry button resets all choices and hides feedback', async ({ page }) => {
    const quiz = page.locator('.quiz-container').first();
    await quiz.locator('.quiz-choice').nth(0).click();
    await quiz.locator('.quiz-retry').click();
    await expect(quiz.locator('.quiz-feedback')).toBeHidden();
    const firstChoice = quiz.locator('.quiz-choice').first();
    await expect(firstChoice).toBeEnabled();
    await expect(firstChoice).not.toHaveClass(/incorrect/);
  });

  test('explanation appears after correct answer when provided', async ({ page }) => {
    const quiz = page.locator('.quiz-container').first();
    await quiz.locator('.quiz-choice').nth(1).click();
    await expect(quiz.locator('.quiz-explanation')).toBeVisible();
  });
});

// Separate describe so addInitScript is NOT registered — reload preserves localStorage
test.describe('Quiz component - localStorage persistence', () => {
  test('クリア済み state is restored after page reload', async ({ page }) => {
    // Navigate and clear any leftover state from previous test runs
    await page.goto(PAGE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const quiz = page.locator('.quiz-container').first();
    // Answer correctly to save progress to localStorage
    await quiz.locator('.quiz-choice').nth(1).click();
    await expect(quiz.locator('.quiz-feedback')).toContainText('正解');

    // Reload — localStorage is preserved because addInitScript was not registered
    await page.reload();

    const quizAfterReload = page.locator('.quiz-container').first();
    await expect(quizAfterReload.locator('.quiz-feedback')).toBeVisible();
    await expect(quizAfterReload.locator('.quiz-feedback')).toContainText('クリア済み');
    // Choices should be disabled in the restored state
    await expect(quizAfterReload.locator('.quiz-choice').first()).toBeDisabled();
  });
});

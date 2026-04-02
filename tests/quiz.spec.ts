// ABOUTME: E2e tests for the Quiz Astro component.
// ABOUTME: Verifies correct/incorrect answer flows and retry behavior.
import { test, expect } from '@playwright/test';

test.describe('Quiz component', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before navigating to ensure a clean quiz state
    await page.addInitScript(() => localStorage.clear());
    await page.goto('/manabi-commons/test/interactive');
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

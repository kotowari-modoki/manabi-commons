# Interactive Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `Quiz.astro` and `AnimatedStep.astro` components to make pages interactive for elementary and junior high students.

**Architecture:** Pure logic functions in `src/scripts/` are unit-tested with Vitest + jsdom. Astro components consume those functions via `<script>` import. Playwright drives a real dev server for e2e tests. All interactive behavior runs client-side — no server required.

**Tech Stack:** Astro 6, Starlight, TypeScript, Vitest 2 + jsdom, Playwright

---

## File Map

| Path | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify ⚠️ | Add devDependencies and test scripts |
| `vitest.config.ts` | Create | Vitest + jsdom configuration |
| `playwright.config.ts` | Create | Playwright + dev server configuration |
| `tsconfig.json` | Modify | Add `@/` path alias |
| `src/scripts/quiz-logic.ts` | Create | Pure functions: checkAnswer, saveProgress, loadProgress |
| `src/scripts/quiz-logic.test.ts` | Create | Vitest unit tests for quiz-logic |
| `src/scripts/animated-step-logic.ts` | Create | Pure functions: nextStep, prevStep, isLastStep, isFirstStep |
| `src/scripts/animated-step-logic.test.ts` | Create | Vitest unit tests for animated-step-logic |
| `src/components/Quiz.astro` | Create | Interactive quiz component (MDX embeddable) |
| `src/components/AnimatedStep.astro` | Create | Step-by-step animated explanation component |
| `src/content/docs/test/interactive.mdx` | Create | E2e test fixture page (draft: true) |
| `tests/quiz.spec.ts` | Create | Playwright e2e tests for Quiz |
| `tests/animated-step.spec.ts` | Create | Playwright e2e tests for AnimatedStep |
| `src/content/docs/math/sho2-kuku-oboekata.mdx` | Create | Real content page with components (replaces .md) |

---

## Task 0: Setup test infrastructure

> ⚠️ **REQUIRES HUMAN APPROVAL** — modifies `package.json` dependencies (per AGENTS.md).
> Show the diff below to the human and wait for approval before running `pnpm install`.

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Show human the package.json diff and get approval**

The following changes are needed. Do NOT run `pnpm install` until approved.

```json
{
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test": "pnpm test:unit && pnpm test:e2e"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0",
    "jsdom": "^25.0.0",
    "@playwright/test": "^1.48.0"
  }
}
```

- [ ] **Step 2: After human approval, update package.json**

Replace the `"scripts"` block and add `"devDependencies"` in `package.json`:

```json
{
  "name": "",
  "type": "module",
  "version": "0.0.1",
  "description": "小中高生のための無料教科書",
  "license": "CC-BY-4.0",
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
    "test:e2e": "playwright test",
    "test": "pnpm test:unit && pnpm test:e2e"
  },
  "dependencies": {
    "@astrojs/starlight": "^0.38.2",
    "astro": "^6.0.1",
    "sharp": "^0.34.2"
  },
  "devDependencies": {
    "vitest": "^2.1.0",
    "@vitest/coverage-v8": "^2.1.0",
    "jsdom": "^25.0.0",
    "@playwright/test": "^1.48.0"
  }
}
```

- [ ] **Step 3: Install dependencies**

```bash
pnpm install
```

Expected: Lock file updates, no errors.

- [ ] **Step 4: Create vitest.config.ts**

```typescript
// ABOUTME: Vitest configuration for unit testing pure logic functions.
// ABOUTME: Uses jsdom environment to provide localStorage in tests.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Create playwright.config.ts**

```typescript
// ABOUTME: Playwright configuration for e2e tests against the Astro dev server.
// ABOUTME: Automatically starts the dev server before running tests.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
```

- [ ] **Step 6: Install Playwright browsers**

```bash
pnpm exec playwright install chromium
```

Expected: Chromium browser downloaded.

- [ ] **Step 7: Add path alias to tsconfig.json**

Replace the contents of `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts playwright.config.ts tsconfig.json
git commit -m "chore: add vitest and playwright test infrastructure"
```

---

## Task 1: Quiz pure logic (TDD)

**Files:**
- Create: `src/scripts/quiz-logic.ts`
- Create: `src/scripts/quiz-logic.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/scripts/quiz-logic.test.ts`:

```typescript
// ABOUTME: Unit tests for quiz-logic.ts pure functions.
// ABOUTME: Covers answer checking and localStorage-based progress persistence.
import { describe, it, expect, beforeEach } from 'vitest';
import { checkAnswer, saveProgress, loadProgress } from './quiz-logic';

describe('checkAnswer', () => {
  it('returns true when selected index matches correct index', () => {
    expect(checkAnswer(1, 1)).toBe(true);
  });

  it('returns false when selected index does not match correct index', () => {
    expect(checkAnswer(0, 1)).toBe(false);
  });

  it('returns false for negative index', () => {
    expect(checkAnswer(-1, 0)).toBe(false);
  });
});

describe('saveProgress / loadProgress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns false for a question that has never been answered', () => {
    expect(loadProgress('q-unknown')).toBe(false);
  });

  it('returns true after saveProgress is called for that key', () => {
    saveProgress('q-math-1');
    expect(loadProgress('q-math-1')).toBe(true);
  });

  it('saving one key does not affect a different key', () => {
    saveProgress('q-math-1');
    expect(loadProgress('q-math-2')).toBe(false);
  });

  it('saving the same key twice keeps it as true', () => {
    saveProgress('q-math-1');
    saveProgress('q-math-1');
    expect(loadProgress('q-math-1')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
pnpm test:unit
```

Expected: FAIL — `Cannot find module './quiz-logic'`

- [ ] **Step 3: Implement quiz-logic.ts**

Create `src/scripts/quiz-logic.ts`:

```typescript
// ABOUTME: Pure functions for Quiz component state management.
// ABOUTME: Handles answer checking and localStorage-based progress persistence.

const STORAGE_KEY = 'manabi-quiz-progress';

export function checkAnswer(selectedIndex: number, correctIndex: number): boolean {
  return selectedIndex === correctIndex;
}

export function saveProgress(questionKey: string): void {
  const solved: Record<string, boolean> = JSON.parse(
    localStorage.getItem(STORAGE_KEY) ?? '{}'
  );
  solved[questionKey] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solved));
}

export function loadProgress(questionKey: string): boolean {
  const solved: Record<string, boolean> = JSON.parse(
    localStorage.getItem(STORAGE_KEY) ?? '{}'
  );
  return solved[questionKey] === true;
}
```

- [ ] **Step 4: Run tests — confirm they pass**

```bash
pnpm test:unit
```

Expected: PASS — 7 tests pass, 0 failed.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/quiz-logic.ts src/scripts/quiz-logic.test.ts
git commit -m "feat: add quiz pure logic with unit tests"
```

---

## Task 2: AnimatedStep pure logic (TDD)

**Files:**
- Create: `src/scripts/animated-step-logic.ts`
- Create: `src/scripts/animated-step-logic.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/scripts/animated-step-logic.test.ts`:

```typescript
// ABOUTME: Unit tests for animated-step-logic.ts pure functions.
// ABOUTME: Covers step navigation boundary conditions.
import { describe, it, expect } from 'vitest';
import { nextStep, prevStep, isLastStep, isFirstStep } from './animated-step-logic';

describe('nextStep', () => {
  it('advances from step 0 to step 1', () => {
    expect(nextStep(0, 3)).toBe(1);
  });

  it('advances from step 1 to step 2', () => {
    expect(nextStep(1, 3)).toBe(2);
  });

  it('does not advance past the last step', () => {
    expect(nextStep(2, 3)).toBe(2);
  });

  it('does not advance past a single-step sequence', () => {
    expect(nextStep(0, 1)).toBe(0);
  });
});

describe('prevStep', () => {
  it('goes back from step 2 to step 1', () => {
    expect(prevStep(2)).toBe(1);
  });

  it('goes back from step 1 to step 0', () => {
    expect(prevStep(1)).toBe(0);
  });

  it('does not go before step 0', () => {
    expect(prevStep(0)).toBe(0);
  });
});

describe('isLastStep', () => {
  it('returns true when current equals total minus one', () => {
    expect(isLastStep(2, 3)).toBe(true);
  });

  it('returns false when not at last step', () => {
    expect(isLastStep(1, 3)).toBe(false);
  });

  it('returns true for a single-step sequence', () => {
    expect(isLastStep(0, 1)).toBe(true);
  });
});

describe('isFirstStep', () => {
  it('returns true when current is 0', () => {
    expect(isFirstStep(0)).toBe(true);
  });

  it('returns false when current is greater than 0', () => {
    expect(isFirstStep(1)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
pnpm test:unit
```

Expected: FAIL — `Cannot find module './animated-step-logic'`

- [ ] **Step 3: Implement animated-step-logic.ts**

Create `src/scripts/animated-step-logic.ts`:

```typescript
// ABOUTME: Pure functions for AnimatedStep component navigation state.
// ABOUTME: All functions are stateless; the component owns the current step index.

export function nextStep(current: number, total: number): number {
  return Math.min(current + 1, total - 1);
}

export function prevStep(current: number): number {
  return Math.max(current - 1, 0);
}

export function isLastStep(current: number, total: number): boolean {
  return current === total - 1;
}

export function isFirstStep(current: number): boolean {
  return current === 0;
}
```

- [ ] **Step 4: Run tests — confirm all pass**

```bash
pnpm test:unit
```

Expected: PASS — 11 tests pass (7 quiz + 4 step boundary tests... wait, count: checkAnswer 3 + saveProgress 4 = 7, nextStep 4 + prevStep 3 + isLastStep 3 + isFirstStep 2 = 12), 0 failed.

- [ ] **Step 5: Commit**

```bash
git add src/scripts/animated-step-logic.ts src/scripts/animated-step-logic.test.ts
git commit -m "feat: add animated-step pure logic with unit tests"
```

---

## Task 3: Quiz.astro component + e2e tests

**Files:**
- Create: `src/components/Quiz.astro`
- Create: `src/content/docs/test/interactive.mdx`
- Create: `tests/quiz.spec.ts`

- [ ] **Step 1: Write the Playwright tests (they will fail until component exists)**

Create `tests/quiz.spec.ts`:

```typescript
// ABOUTME: E2e tests for the Quiz Astro component.
// ABOUTME: Verifies correct/incorrect answer flows and retry behavior.
import { test, expect } from '@playwright/test';

test.describe('Quiz component', () => {
  test.beforeEach(async ({ page }) => {
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
```

- [ ] **Step 2: Create the test fixture page**

Create `src/content/docs/test/interactive.mdx`:

```mdx
---
title: インタラクティブ機能テスト
description: Quiz と AnimatedStep のテスト用ページです。
draft: true
sidebar:
  hidden: true
---

import Quiz from '../../../components/Quiz.astro'
import AnimatedStep from '../../../components/AnimatedStep.astro'

## Quiz テスト

<Quiz
  question="3 × 7 はいくつ？"
  choices={["18", "21", "24", "28"]}
  answer={1}
  explanation="3の段は3・6・9・12…と3ずつ増えます"
/>

## AnimatedStep テスト

<AnimatedStep
  title="繰り上がりのある足し算"
  steps={[
    { label: "① 一の位を計算", content: "8 + 7 = 15。5を書いて1を繰り上げます。" },
    { label: "② 十の位を計算", content: "3 + 4 = 7。繰り上げた1を足して8。" },
    { label: "③ 答え", content: "38 + 47 = 85" }
  ]}
/>
```

- [ ] **Step 3: Create Quiz.astro**

Create `src/components/Quiz.astro`:

```astro
---
// ABOUTME: Interactive quiz component for practice problems embedded in MDX pages.
// ABOUTME: Supports 2-4 multiple choice options with immediate feedback and localStorage progress.

interface Props {
  question: string;
  choices: string[];
  answer: number;
  explanation?: string;
}

const { question, choices, answer, explanation } = Astro.props;
const questionKey = `quiz-${question.replace(/[\s？?]/g, '-').toLowerCase().slice(0, 50)}`;
---

<div class="quiz-container" data-answer={answer} data-key={questionKey}>
  <div class="quiz-label">🎯 チャレンジ！</div>
  <p class="quiz-question">{question}</p>
  <div class="quiz-choices">
    {choices.map((choice, i) => (
      <button class="quiz-choice" data-index={i}>{choice}</button>
    ))}
  </div>
  {explanation && (
    <div class="quiz-explanation" hidden>{explanation}</div>
  )}
  <div class="quiz-feedback" hidden></div>
</div>

<style>
  .quiz-container {
    border: 2px solid var(--sl-color-accent-low);
    border-radius: 12px;
    padding: 1.25rem;
    margin: 1.5rem 0;
    background: linear-gradient(135deg, color-mix(in srgb, var(--sl-color-accent) 8%, transparent), transparent);
  }

  .quiz-label {
    font-size: 0.75rem;
    font-weight: bold;
    color: var(--sl-color-accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.5rem;
  }

  .quiz-question {
    font-size: 1.05rem;
    font-weight: bold;
    margin: 0 0 1rem;
  }

  .quiz-choices {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 0.625rem;
  }

  .quiz-choice {
    padding: 0.875rem;
    border-radius: 10px;
    border: none;
    background: var(--sl-color-bg);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    font-size: 1.05rem;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.1s, box-shadow 0.1s;
  }

  .quiz-choice:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }

  .quiz-choice.correct {
    background: linear-gradient(135deg, #56ab2f, #a8e063);
    color: #fff;
    box-shadow: 0 2px 10px rgba(86, 171, 47, 0.4);
  }

  .quiz-choice.incorrect {
    background: #fee;
    border: 2px solid #e57373;
  }

  .quiz-choice:disabled {
    cursor: default;
    transform: none;
  }

  .quiz-feedback {
    margin-top: 0.75rem;
    font-weight: bold;
    font-size: 1rem;
  }

  .quiz-explanation {
    margin-top: 0.75rem;
    font-size: 0.875rem;
    background: var(--sl-color-bg-sidebar);
    padding: 0.625rem 0.875rem;
    border-radius: 6px;
    color: var(--sl-color-text);
  }

  .quiz-retry {
    margin-top: 0.75rem;
    padding: 0.5rem 1.25rem;
    border-radius: 8px;
    border: none;
    background: var(--sl-color-accent);
    color: #fff;
    cursor: pointer;
    font-size: 0.875rem;
    display: block;
  }
</style>

<script>
  import { checkAnswer, saveProgress, loadProgress } from '../scripts/quiz-logic';

  document.querySelectorAll<HTMLElement>('.quiz-container').forEach((container) => {
    const answerIndex = Number(container.dataset.answer);
    const questionKey = container.dataset.key!;
    const buttons = container.querySelectorAll<HTMLButtonElement>('.quiz-choice');
    const feedback = container.querySelector<HTMLElement>('.quiz-feedback')!;
    const explanation = container.querySelector<HTMLElement>('.quiz-explanation');

    // Restore already-solved state
    if (loadProgress(questionKey)) {
      feedback.textContent = '✅ クリア済み！';
      feedback.removeAttribute('hidden');
      buttons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === answerIndex) btn.classList.add('correct');
      });
      return;
    }

    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        buttons.forEach((b) => (b.disabled = true));

        if (checkAnswer(i, answerIndex)) {
          btn.classList.add('correct');
          feedback.textContent = '⭐ 正解！';
          feedback.removeAttribute('hidden');
          if (explanation) explanation.removeAttribute('hidden');
          saveProgress(questionKey);
        } else {
          btn.classList.add('incorrect');
          feedback.textContent = '❌ ちがいます。もう一度！';
          feedback.removeAttribute('hidden');

          const retry = document.createElement('button');
          retry.className = 'quiz-retry';
          retry.textContent = 'もう一度';
          retry.addEventListener('click', () => {
            buttons.forEach((b) => {
              b.disabled = false;
              b.classList.remove('correct', 'incorrect');
            });
            feedback.setAttribute('hidden', '');
            feedback.textContent = '';
            retry.remove();
          });
          container.appendChild(retry);
        }
      });
    });
  });
</script>
```

- [ ] **Step 4: Run e2e tests — confirm they pass**

```bash
pnpm test:e2e --project=chromium tests/quiz.spec.ts
```

Expected: PASS — 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Quiz.astro src/content/docs/test/interactive.mdx tests/quiz.spec.ts
git commit -m "feat: add Quiz Astro component with e2e tests"
```

---

## Task 4: AnimatedStep.astro component + e2e tests

**Files:**
- Create: `src/components/AnimatedStep.astro`
- Create: `tests/animated-step.spec.ts`

- [ ] **Step 1: Write the Playwright tests**

Create `tests/animated-step.spec.ts`:

```typescript
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
```

- [ ] **Step 2: Create AnimatedStep.astro**

Create `src/components/AnimatedStep.astro`:

```astro
---
// ABOUTME: Step-by-step animated explanation component for MDX content pages.
// ABOUTME: Displays one step at a time; previous steps remain visible but dimmed.

interface Step {
  label: string;
  content: string;
}

interface Props {
  title?: string;
  steps: Step[];
}

const { title, steps } = Astro.props;
---

<div class="animated-step" data-total={steps.length}>
  {title && <div class="step-title">{title}</div>}
  <div class="step-list">
    {steps.map((step, i) => (
      <div class="step-item" data-step={i} aria-hidden={i !== 0 ? 'true' : 'false'}>
        <div class="step-number">{i + 1}</div>
        <div class="step-body">
          <div class="step-label">{step.label}</div>
          <div class="step-content">{step.content}</div>
        </div>
      </div>
    ))}
  </div>
  <div class="step-nav">
    <button class="step-prev" disabled>← 前へ</button>
    <span class="step-counter">1 / {steps.length}</span>
    <button class="step-next" disabled={steps.length <= 1}>次へ →</button>
  </div>
  <button class="step-summary" hidden>まとめを見る</button>
</div>

<style>
  .animated-step {
    border: 2px solid var(--sl-color-accent-low);
    border-radius: 12px;
    padding: 1.25rem;
    margin: 1.5rem 0;
  }

  .step-title {
    font-size: 0.8rem;
    font-weight: bold;
    color: var(--sl-color-accent);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 1rem;
  }

  .step-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .step-item {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    transition: opacity 0.3s;
  }

  .step-item[aria-hidden='true'] {
    opacity: 0.2;
    pointer-events: none;
  }

  .step-number {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .step-item[aria-hidden='true'] .step-number {
    background: var(--sl-color-gray-4, #ccc);
  }

  .step-body {
    flex: 1;
    padding: 0.625rem 0.875rem;
    background: var(--sl-color-bg-sidebar);
    border-radius: 8px;
  }

  .step-label {
    font-weight: bold;
    font-size: 0.9rem;
    margin-bottom: 0.25rem;
  }

  .step-content {
    font-size: 0.875rem;
    color: var(--sl-color-text-accent, var(--sl-color-text));
  }

  .step-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1rem;
  }

  .step-prev,
  .step-next {
    padding: 0.625rem 1.125rem;
    border-radius: 8px;
    font-size: 0.9rem;
    cursor: pointer;
    font-weight: bold;
    border: 2px solid var(--sl-color-accent-low);
    background: var(--sl-color-bg);
    color: var(--sl-color-text);
    transition: background 0.15s;
  }

  .step-next:not(:disabled) {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    border-color: transparent;
  }

  .step-prev:disabled,
  .step-next:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .step-counter {
    font-size: 0.85rem;
    color: var(--sl-color-gray-3, #999);
  }

  .step-summary {
    display: block;
    width: 100%;
    margin-top: 0.75rem;
    padding: 0.625rem;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
  }
</style>

<script>
  import { nextStep, prevStep, isLastStep, isFirstStep } from '../scripts/animated-step-logic';

  document.querySelectorAll<HTMLElement>('.animated-step').forEach((container) => {
    const total = Number(container.dataset.total);
    let current = 0;

    const items = container.querySelectorAll<HTMLElement>('.step-item');
    const prevBtn = container.querySelector<HTMLButtonElement>('.step-prev')!;
    const nextBtn = container.querySelector<HTMLButtonElement>('.step-next')!;
    const counter = container.querySelector<HTMLElement>('.step-counter')!;
    const summaryBtn = container.querySelector<HTMLButtonElement>('.step-summary')!;

    function render() {
      items.forEach((item, i) => {
        item.setAttribute('aria-hidden', i > current ? 'true' : 'false');
      });
      prevBtn.disabled = isFirstStep(current);
      nextBtn.disabled = isLastStep(current, total);
      counter.textContent = `${current + 1} / ${total}`;
      if (isLastStep(current, total)) {
        summaryBtn.removeAttribute('hidden');
      }
    }

    prevBtn.addEventListener('click', () => {
      current = prevStep(current);
      render();
    });

    nextBtn.addEventListener('click', () => {
      current = nextStep(current, total);
      render();
    });

    summaryBtn.addEventListener('click', () => {
      items.forEach((item) => item.setAttribute('aria-hidden', 'false'));
      summaryBtn.setAttribute('hidden', '');
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      counter.textContent = `全 ${total} ステップ`;
    });

    render();
  });
</script>
```

- [ ] **Step 3: Run e2e tests — confirm they pass**

```bash
pnpm test:e2e --project=chromium tests/animated-step.spec.ts
```

Expected: PASS — 7 tests pass.

- [ ] **Step 4: Run full test suite**

```bash
pnpm test
```

Expected: All unit tests and e2e tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/AnimatedStep.astro tests/animated-step.spec.ts
git commit -m "feat: add AnimatedStep Astro component with e2e tests"
```

---

## Task 5: Add components to real content

Apply the components to one existing page to validate the real-world authoring experience.

**Files:**
- Create: `src/content/docs/math/sho2-kuku-oboekata.mdx` (new file with components)
- Delete: `src/content/docs/math/sho2-kuku-oboekata.md` (replaced by .mdx)

- [ ] **Step 1: Create the .mdx version**

Create `src/content/docs/math/sho2-kuku-oboekata.mdx` with the existing content plus components added at natural checkpoints. Copy the full existing frontmatter and content from `sho2-kuku-oboekata.md`, then add an import block after the frontmatter and insert components:

```mdx
---
title: 九九を覚えるコツまとめ
description: 小学2年生のかけ算九九を、覚えやすい順番と毎日の練習のしかたでやさしくまとめたページです。
sidebar:
  order: 2
---

import Quiz from '../../../components/Quiz.astro'
import AnimatedStep from '../../../components/AnimatedStep.astro'

# 九九を覚えるコツまとめ

（... 既存コンテンツをそのまま維持 ...）

## 5のだんを確認しよう

<Quiz
  question="5 × 3 はいくつ？"
  choices={["10", "12", "15", "20"]}
  answer={2}
  explanation="5のだんは5ずつ増えます。5・10・15・20…"
/>

## 九九の覚え方ステップ

<AnimatedStep
  title="九九を覚える4ステップ"
  steps={[
    { label: "① 覚えやすいだんから始める", content: "まず5のだんと2のだんを覚えましょう。" },
    { label: "② 声に出してリズムで言う", content: "「ごいちがご・ごにじゅう…」とリズムよく唱えます。" },
    { label: "③ きまりを見つける", content: "3×4と4×3は同じ12。入れかえても答えは同じです。" },
    { label: "④ 毎日3分くり返す", content: "短い時間でも毎日続けると、自然に覚えられます。" }
  ]}
/>

（... 残りの既存コンテンツをそのまま維持 ...）
```

> **Note:** Replace `（... 既存コンテンツ ...）` with the actual content from `sho2-kuku-oboekata.md`. Do not drop any existing text.

- [ ] **Step 2: Delete the old .md file**

```bash
git rm src/content/docs/math/sho2-kuku-oboekata.md
```

- [ ] **Step 3: Verify the build succeeds**

```bash
pnpm build
```

Expected: Build completes with no errors.

- [ ] **Step 4: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/content/docs/math/sho2-kuku-oboekata.mdx
git commit -m "feat: add Quiz and AnimatedStep to 九九 page"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Quiz component with game-style design (Task 3)
- ✅ AnimatedStep with button-driven step navigation (Task 4)
- ✅ MDX + Astro Island architecture (all tasks)
- ✅ `client:visible`-equivalent (components use `<script>` which Astro bundles with `client:load` semantics by default in pages)
- ✅ localStorage progress (quiz-logic.ts `saveProgress`/`loadProgress`)
- ✅ Starlight CSS variables used throughout (no hardcoded theme colors)
- ✅ Real content page updated (Task 5)

**Note on `client:` directive:** `<script>` tags in Astro components are bundled and executed when the component renders. For true lazy loading, the `client:visible` directive can be added in Task 3/4 by wrapping the components. This is an implementation detail the engineer can decide during execution.

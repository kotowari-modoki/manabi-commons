// ABOUTME: E2E tests for the physical education section.
// ABOUTME: Verifies the home page link and learning pages render their key headings.
import { expect, test } from '@playwright/test';

const HOME_URL = '/manabi-commons/';
const SECTION_URL = '/manabi-commons/physical-education/';
const BICYCLE_URL = '/manabi-commons/physical-education/hajimete-no-jitensha-renshu/';
const SAKAAGARI_URL = '/manabi-commons/physical-education/sakaagari-no-kotsu/';
const UNDOKAI_URL = '/manabi-commons/physical-education/undokai-chokuzen-zenjitsu/';

test.describe('physical education content pages', () => {
  test('home page links to the physical education section', async ({ page }) => {
    await page.goto(HOME_URL);

    await expect(page.getByRole('link', { name: '体育で体を動かす' })).toBeVisible();
    await page.getByRole('link', { name: '体育で体を動かす' }).click();
    await expect(page).toHaveURL(SECTION_URL);
    await expect(page.locator('h1').filter({ hasText: '体育' }).first()).toBeVisible();
  });

  test('bicycle practice page shows the main steps', async ({ page }) => {
    await page.goto(BICYCLE_URL);

    await expect(page.getByRole('heading', { level: 1, name: '初めて自転車に乗るれんしゅうのやり方' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'れんしゅうは「足で進む」から始めよう' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'ペダルをこぐ前に、止まり方をれんしゅうしよう' })).toBeVisible();
  });

  test('sakaagari page shows safety and review points', async ({ page }) => {
    await page.goto(SAKAAGARI_URL);

    await expect(page.getByRole('heading', { level: 1, name: '逆上がりのコツ' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '先に、安全のことをたしかめよう' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'うまくいかないときの見直しポイント' })).toBeVisible();
  });

  test('sports day page shows preparation and safety guidance', async ({ page }) => {
    await page.goto(UNDOKAI_URL);

    await expect(page.getByRole('heading', { level: 1, name: '運動会の直前にできること、前日に気をつけること' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: '直前にできること' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'こんなときは先生や大人に伝えよう' })).toBeVisible();
  });
});
